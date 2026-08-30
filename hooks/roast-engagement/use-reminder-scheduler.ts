import { useCallback, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '~/store/hooks';
import { userSelectors } from '~/store/actions/users';
import { roastEngagementActions, roastEngagementSelectors, IScheduledRecord } from '~/store/actions/roast-engagement';
import { useGetRemindersQuery } from '~/store/services/roast-engagement';
import { REMINDER_STATUS } from '~/store/types';
import { useGetMyGuestsQuery } from '~/store/services/roast-crm';
import {
    ISchedulableReminder,
    cancelNotification,
    canScheduleNotifications,
    contentKeyFor,
    diffSchedules,
    identifierFor,
    scheduleReminder,
} from '~/utils/local-notifications';
import useAppForeground from './use-app-foreground';
import useGuestNameIndex from '~/views/roast-crm/hooks/use-guest-name-index';

/**
 * How many upcoming reminders to pull.
 *
 * Comfortably above the 60-slot budget on purpose: the scheduler needs to *see* the ones
 * it cannot schedule in order to report `dropped`, and to promote them as nearer ones
 * fire. Asking for exactly the budget would make an over-budget worker indistinguishable
 * from an exactly-full one.
 */
const UPCOMING_PAGE_SIZE = 200;

/**
 * Keeps the OS's pending local notifications in step with the server's reminders.
 *
 * Runs on mount, on every genuine foreground, and whenever the upcoming list changes —
 * which covers create, edit, complete, snooze and delete, because all five invalidate
 * `ReminderList` and RTK Query re-fetches it.
 *
 * The actual decision-making is `diffSchedules`, which is pure and lives in
 * `utils/local-notifications.ts`. This hook only performs it: it reads the ledger, calls
 * the OS, and writes the ledger back. Keeping those halves apart is what makes the part
 * that can be silently wrong the part that can be tested without a device.
 */
const useReminderScheduler = () => {
    const dispatch = useAppDispatch();
    const user = useAppSelector(userSelectors.selectCurrentUser);
    const isAuthenticated = !!(user?.userId ?? user?._id);
    const ledger = useAppSelector(roastEngagementSelectors.selectScheduled);

    const { data: page } = useGetRemindersQuery(
        { status: REMINDER_STATUS.UPCOMING, limit: UPCOMING_PAGE_SIZE },
        { skip: !isAuthenticated }
    );
    const reminders = page?.data;

    /**
     * Guest names for the notification bodies.
     *
     * The API returns a `guestId` and nothing else, and this text is composed here and
     * then handed to the OS — it lands on a lock screen with the app closed and no chance
     * to resolve anything later. A name missing at schedule time is a name missing
     * forever, for that notification.
     */
    const guestNames = useGuestNameIndex();

    /**
     * Whether the guest cache has *settled*, as opposed to merely being empty.
     *
     * `useGuestNameIndex` returns `{}` both while the guest list is in flight and when the
     * worker genuinely has no guests, and the two want opposite behaviour: reconciling
     * against the first schedules every reminder nameless and numberless, and the content
     * key then flips a moment later, cancelling and rescheduling the lot. Waiting one tick
     * costs nothing and removes that churn from every cold start.
     *
     * `isError` counts as settled on purpose. A guest list that will not load must not be
     * able to stop reminders being scheduled at all — a notification reading "Your guest"
     * is worth far more than no notification.
     */
    const { isSuccess: guestsLoaded, isError: guestsFailed } = useGetMyGuestsQuery(undefined, {
        skip: !isAuthenticated,
    });
    const guestsSettled = guestsLoaded || guestsFailed;

    /**
     * The ledger, readable from a callback that is not re-created when it changes.
     *
     * Closing over the rendered value instead would make every reconcile diff against the
     * ledger as it stood when the callback was built — which, for a reconcile triggered by
     * the write the *previous* reconcile made, is the state before that write.
     */
    const ledgerRef = useRef(ledger);
    ledgerRef.current = ledger;

    /**
     * Serialises reconciles.
     *
     * A foreground transition and a re-fetch of the reminder list routinely land in the
     * same tick. Two reconciles running against the same starting ledger would each
     * schedule the same reminders and each write a ledger that omits the other's work —
     * and because the identifiers are deterministic, the *schedules* would collapse
     * correctly while the *ledger* would not, leaving the app permanently convinced it
     * had work to do.
     */
    const inFlight = useRef<Promise<void> | null>(null);

    const reconcile = useCallback(async () => {
        if (!isAuthenticated || !guestsSettled) {
            return;
        }

        const run = async () => {
            // Nothing to reconcile against if the OS will not deliver anything. The
            // ledger is deliberately left alone rather than cleared: permission can be
            // granted again from Settings without the app restarting, and a cleared
            // ledger would then re-schedule everything from scratch.
            if (!(await canScheduleNotifications())) {
                return;
            }

            const schedulable: ISchedulableReminder[] = (reminders ?? []).map(reminder => ({
                _id: reminder._id,
                guestId: reminder.guestId,
                guestFirstName: guestNames[reminder.guestId]?.firstName,
                guestPhoneNumber: guestNames[reminder.guestId]?.phoneNumber,
                note: reminder.note,
                dueAt: reminder.dueAt,
                status: reminder.status,
            }));

            const { toSchedule, toCancel } = diffSchedules({
                reminders: schedulable,
                ledger: ledgerRef.current,
                now: Date.now(),
            });

            if (!toSchedule.length && !toCancel.length) {
                return;
            }

            const next: Record<string, IScheduledRecord> = { ...ledgerRef.current };

            // Cancel first. A reschedule appears in both lists, and doing it in this order
            // is what makes "cancel then schedule" mean what it says rather than racing
            // its own replacement.
            await Promise.all(
                toCancel.map(async reminderId => {
                    await cancelNotification(next[reminderId]?.notificationId ?? identifierFor(reminderId));
                    delete next[reminderId];
                })
            );

            await Promise.all(
                toSchedule.map(async reminder => {
                    const notificationId = await scheduleReminder(reminder);

                    // `null` means the OS refused — past the cap, or permission revoked
                    // between the check above and here. Recording it anyway would make the
                    // ledger claim a notification exists that does not, and the next
                    // reconcile would then skip re-scheduling it.
                    if (notificationId) {
                        next[reminder._id] = {
                            notificationId,
                            dueAt: reminder.dueAt,
                            contentKey: contentKeyFor(reminder),
                        };
                    }
                })
            );

            dispatch(roastEngagementActions.setScheduled(next));
        };

        const chained = (inFlight.current ?? Promise.resolve()).then(run, run);
        inFlight.current = chained;

        await chained;

        if (inFlight.current === chained) {
            inFlight.current = null;
        }
    }, [dispatch, isAuthenticated, guestsSettled, reminders, guestNames]);

    useEffect(() => {
        reconcile();
    }, [reconcile]);

    useAppForeground(reconcile, { runOnMount: false });

    return { reconcile };
};

export default useReminderScheduler;
