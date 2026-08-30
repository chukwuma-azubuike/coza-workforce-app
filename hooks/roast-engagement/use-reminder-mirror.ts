import { useCallback, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '~/store/hooks';
import { userSelectors } from '~/store/actions/users';
import { roastEngagementActions, roastEngagementSelectors } from '~/store/actions/roast-engagement';
import { useGetNotificationPreferencesQuery, useGetRemindersQuery } from '~/store/services/roast-engagement';
import { IRoastReminder, REMINDER_STATUS } from '~/store/types';
import {
    IMirrorableReminder,
    MIRROR_PROVIDER,
    createMirror,
    deleteMirror,
    hasSettled,
    mirrorContentKey,
} from '~/utils/device-mirror';
import useAppForeground from './use-app-foreground';
import useGuestNameIndex from '~/views/roast-crm/hooks/use-guest-name-index';

/**
 * Matches `use-reminder-scheduler.ts`, and for the same reason: the reconcile has to see
 * the reminders it is *not* mirroring in order to know that a mirrored one has gone.
 */
const UPCOMING_PAGE_SIZE = 200;

/**
 * The write half: the worker's choice, and what to do with it.
 *
 * Split out from the reconcile below because it has **no effects** and is therefore safe
 * to call from a screen. `useReminderMirror` runs exactly once, from `useRoastEngagement`;
 * `ReminderSheet` needs `applyMirror` without dragging a second reconcile loop into every
 * sheet that mounts.
 */
export const useMirrorTarget = () => {
    const dispatch = useAppDispatch();
    const user = useAppSelector(userSelectors.selectCurrentUser);
    const isAuthenticated = !!(user?.userId ?? user?._id);
    const mirrored = useAppSelector(roastEngagementSelectors.selectMirrored);
    const mirrorDefault = useAppSelector(roastEngagementSelectors.selectMirrorDefault);

    const guestNames = useGuestNameIndex();

    /**
     * Honoured here as well as on the lock screen.
     *
     * "Hide guest names" is a promise about who can read over the worker's shoulder, and a
     * calendar event titled with a guest's name breaks it more thoroughly than a
     * notification does — it is still there tomorrow, and on their laptop.
     */
    const { data: prefs } = useGetNotificationPreferencesQuery(undefined, { skip: !isAuthenticated });
    const hideGuestNames = !!prefs?.hideGuestNames;

    /**
     * The title a mirror carries.
     *
     * Deliberately the guest's **first name only** — never a surname, never a number,
     * never an assimilation stage. This text is leaving the app's sandbox for a store that
     * syncs to other devices, so it carries the least that still makes the entry useful.
     */
    const mirrorableFor = useCallback(
        (reminder: IRoastReminder): IMirrorableReminder => ({
            _id: reminder._id,
            title: hideGuestNames ? 'Roast follow-up' : (guestNames[reminder.guestId]?.firstName ?? 'A guest'),
            note: reminder.note,
            dueAt: reminder.dueAt,
        }),
        [guestNames, hideGuestNames]
    );

    /**
     * Applies a worker's choice on one reminder, right after they saved it.
     *
     * Called from the sheet rather than left to the reconcile, because the reconcile has
     * no way to learn about an *intent* — only about a ledger entry that already exists.
     * Passing `null` is how the choice is turned off again on an edit.
     */
    const applyMirror = useCallback(
        async (reminder: IRoastReminder, provider: MIRROR_PROVIDER | null) => {
            const existing = mirrored[reminder._id];
            const mirrorable = mirrorableFor(reminder);

            // Content as well as provider, because the reconcile below no longer picks up
            // drift on alarms — it cannot, without ringing the phone twice. An edited time
            // on an alarm-mirrored reminder has to be acted on here or nowhere.
            const unchanged =
                !!existing && existing.provider === provider && existing.contentKey === mirrorContentKey(mirrorable);

            if (unchanged) {
                return;
            }

            if (existing) {
                await deleteMirror(existing);
                dispatch(roastEngagementActions.clearMirror(reminder._id));
            }

            if (!provider) {
                return;
            }

            const record = await createMirror(provider, mirrorable);

            // `null` means denied, or no writable calendar. The reminder itself already
            // saved, so there is nothing to roll back and nothing worth interrupting the
            // worker about — they keep the notification they would have had anyway.
            if (record) {
                dispatch(roastEngagementActions.setMirror({ reminderId: reminder._id, record }));
            }
        },
        [dispatch, mirrorableFor, mirrored]
    );

    /** What this reminder is currently mirrored to, for pre-selecting the row on edit. */
    const mirrorFor = useCallback(
        (reminderId?: string): MIRROR_PROVIDER | null =>
            (reminderId ? mirrored[reminderId]?.provider : undefined) ?? null,
        [mirrored]
    );

    return { applyMirror, mirrorDefault, mirrorFor, mirrorableFor };
};

/**
 * Keeps the phone's own Reminders / Calendar entries in step with the reminders that were
 * opted in to them.
 *
 * The sibling of `use-reminder-scheduler`, with one structural difference that shapes
 * everything: **the server has no idea a mirror exists.** Mirroring is a per-reminder
 * choice made on one handset, so the local `mirrored` ledger is the only list of what to
 * reconcile, and this hook walks *the ledger* rather than the reminder list.
 *
 * What that buys: a reminder nobody mirrored is never touched, and the reconcile costs
 * nothing at all for the majority of workers who never turn the feature on.
 *
 * See `docs/roast-engagement/08_DEVICE_REMINDERS_PLAN.md`.
 */
const useReminderMirror = () => {
    const dispatch = useAppDispatch();
    const user = useAppSelector(userSelectors.selectCurrentUser);
    const isAuthenticated = !!(user?.userId ?? user?._id);
    const mirrored = useAppSelector(roastEngagementSelectors.selectMirrored);

    const { data: page } = useGetRemindersQuery(
        { status: REMINDER_STATUS.UPCOMING, limit: UPCOMING_PAGE_SIZE },
        { skip: !isAuthenticated }
    );
    const reminders = page?.data;

    const { mirrorableFor } = useMirrorTarget();

    const mirroredRef = useRef(mirrored);
    mirroredRef.current = mirrored;

    /** Serialises reconciles, exactly as the scheduler does and for the same reason. */
    const inFlight = useRef<Promise<void> | null>(null);

    const reconcile = useCallback(async () => {
        if (!isAuthenticated || !reminders) {
            return;
        }

        const run = async () => {
            const ledger = mirroredRef.current;
            const entries = Object.entries(ledger);

            if (!entries.length) {
                return;
            }

            const byId = new Map(reminders.map(reminder => [reminder._id, reminder]));

            for (const [reminderId, record] of entries) {
                // Written moments ago, before the list it belongs to has been refetched.
                // See `MIRROR_SETTLE_MS`.
                if (!hasSettled(record)) {
                    continue;
                }

                const reminder = byId.get(reminderId);

                // Completed, deleted, or fallen out of the upcoming window. Either way the
                // mirror has outlived what it was mirroring.
                if (!reminder) {
                    await deleteMirror(record);
                    dispatch(roastEngagementActions.clearMirror(reminderId));
                    continue;
                }

                const mirrorable = mirrorableFor(reminder);

                if (record.contentKey === mirrorContentKey(mirrorable)) {
                    continue;
                }

                // The alarm is never re-created here. Every other provider is fixed by
                // deleting and re-writing; an alarm cannot be deleted, so the same path
                // would leave the stale one ringing and add a second beside it — and the
                // worker cannot remove either from inside Roast.
                //
                // Drift also arrives here unprompted. `mirrorableFor` reads the guest-name
                // index, which resolves after the reminder list does, so the title changes
                // from "A guest" to a real name with nobody touching anything. That alone
                // would duplicate every mirrored alarm on the next foreground.
                //
                // A change the worker made themselves is handled in `applyMirror`, where
                // there is a sheet to disclose the leftover alarm on.
                if (record.provider === MIRROR_PROVIDER.ANDROID_ALARM) {
                    continue;
                }

                // Deleted and re-created rather than patched. EventKit will edit a record
                // in place, but the id it hands back afterwards is not reliably the same
                // one across platforms — and a mirror we have lost the id for is a guest's
                // name we can no longer clean up at sign-out.
                await deleteMirror(record);

                const replacement = await createMirror(record.provider, mirrorable);

                if (replacement) {
                    dispatch(roastEngagementActions.setMirror({ reminderId, record: replacement }));
                } else {
                    dispatch(roastEngagementActions.clearMirror(reminderId));
                }
            }
        };

        const chained = (inFlight.current ?? Promise.resolve()).then(run, run);
        inFlight.current = chained;

        await chained;

        if (inFlight.current === chained) {
            inFlight.current = null;
        }
    }, [dispatch, isAuthenticated, mirrorableFor, reminders]);

    useEffect(() => {
        reconcile();
    }, [reconcile]);

    useAppForeground(reconcile, { runOnMount: false });

    return { reconcile };
};

export default useReminderMirror;
