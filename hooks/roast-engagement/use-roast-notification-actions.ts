import { useCallback, useEffect, useRef } from 'react';
import { Linking } from 'react-native';
import * as Notifications from 'expo-notifications';
import dayjs from 'dayjs';
import { useAppDispatch, useAppSelector } from '~/store/hooks';
import { userSelectors } from '~/store/actions/users';
import { roastEngagementActions } from '~/store/actions/roast-engagement';
import {
    roastEngagementApi,
    useCompleteReminderMutation,
    useSnoozeReminderMutation,
} from '~/store/services/roast-engagement';
import { ContactChannel, REMINDER_COMPLETED_VIA, QUALIFYING_ACTION_KIND } from '~/store/types';
import { ROAST_ACTION, cancelNotification, identifierFor } from '~/utils/local-notifications';
import { contactUrlFor } from '~/views/roast-crm/utils/communication';
import { usePingAction } from './use-engagement-ping';

/**
 * The three tray buttons that reach the guest rather than change the reminder.
 *
 * All of them foreground the app — see the action definitions in `local-notifications.ts`
 * — so by the time this runs there is a window to hand the URL to.
 */
const CONTACT_ACTIONS: Record<string, ContactChannel> = {
    [ROAST_ACTION.CALL]: ContactChannel.CALL,
    [ROAST_ACTION.WHATSAPP]: ContactChannel.WHATSAPP,
    [ROAST_ACTION.TEXT]: ContactChannel.SMS,
};

/**
 * Handles the buttons on a reminder notification — Call, WhatsApp, Text, Mark done and
 * Snooze.
 *
 * ⚠️ **This hook never navigates.** `useNotificationObserver` already owns that, and owns
 * it properly: it distinguishes cold start from background from foreground, deduplicates
 * by notification identifier, holds a target across the sign-in boundary, and refuses to
 * re-push the screen the user is already looking at. Two hooks navigating from one
 * response is precisely the double-push bug that hook's header documents having fixed
 * once already — so the default action falls straight through to it, untouched.
 *
 * What this hook owns is the *side effect* of a button press, which the observer knows
 * nothing about.
 */
const useRoastNotificationActions = () => {
    const dispatch = useAppDispatch();
    const user = useAppSelector(userSelectors.selectCurrentUser);
    const isAuthenticated = !!(user?.userId ?? user?._id);
    const [completeReminder] = useCompleteReminderMutation();
    const [snoozeReminder] = useSnoozeReminderMutation();
    const { pingAction } = usePingAction();

    /**
     * Identifiers already acted on.
     *
     * A tray action can reach the listener twice — the same duplication `useNotificationObserver`
     * guards against — and here a duplicate is not a cosmetic double-push but a second
     * `complete` on a reminder, or a snooze stacked on a snooze.
     */
    const handled = useRef<Set<string>>(new Set());

    const isAuthenticatedRef = useRef(isAuthenticated);
    isAuthenticatedRef.current = isAuthenticated;

    const handleResponse = useCallback(
        async (response: Notifications.NotificationResponse) => {
            const action = response.actionIdentifier;
            const channel = CONTACT_ACTIONS[action];

            // The tap-through case. Routing belongs to `useNotificationObserver`; there is
            // nothing for this hook to do.
            if (!channel && action !== ROAST_ACTION.MARK_DONE && action !== ROAST_ACTION.SNOOZE_1H) {
                return;
            }

            const data = response.notification?.request?.content?.data as Record<string, unknown> | undefined;
            const reminderId = typeof data?.['reminderId'] === 'string' ? (data['reminderId'] as string) : undefined;

            if (!reminderId || !isAuthenticatedRef.current) {
                return;
            }

            const key = `${response.notification.request.identifier}:${action}`;

            if (handled.current.has(key)) {
                return;
            }

            handled.current.add(key);

            if (channel) {
                const phoneNumber = typeof data?.['phoneNumber'] === 'string' ? data['phoneNumber'] : undefined;

                // The number is baked into the payload at schedule time, so there is
                // nothing to look up and nothing that can fail on a cold launch. Its
                // absence means the guest had no number when the reminder was scheduled
                // — in which case this button was never registered on the notification
                // and we should not be here at all.
                if (!phoneNumber) {
                    return;
                }

                const url = contactUrlFor(phoneNumber, channel);

                if (!url) {
                    return;
                }

                try {
                    await Linking.openURL(url);
                } catch {
                    // WhatsApp not installed, or a number the dialer will not take. The
                    // app has already been brought to the front by the action itself and
                    // `useNotificationObserver` is routing to the guest's profile, where
                    // every one of these buttons exists again — so the worker lands
                    // somewhere they can finish the job rather than on an error.
                }

                // Deliberately does **not** complete the reminder. Reaching someone and
                // being done with them are different things: a call that rings out still
                // needs the reminder, and silently clearing it is how a follow-up gets
                // lost.
                return;
            }

            if (action === ROAST_ACTION.MARK_DONE) {
                // Cancel first, and unconditionally. The notification the worker just
                // dismissed must not fire again while the mutation is still in flight, and
                // on a bad network that flight can outlast the reminder's own due time.
                await cancelNotification(identifierFor(reminderId));

                dispatch(
                    roastEngagementActions.enqueue({
                        id: `complete:${reminderId}`,
                        kind: 'COMPLETE',
                        payload: { _id: reminderId, completedVia: REMINDER_COMPLETED_VIA.NOTIFICATION },
                        queuedAt: new Date().toISOString(),
                        attempts: 0,
                    })
                );

                try {
                    await completeReminder({
                        _id: reminderId,
                        completedVia: REMINDER_COMPLETED_VIA.NOTIFICATION,
                    }).unwrap();

                    dispatch(roastEngagementActions.dequeue(`complete:${reminderId}`));
                    pingAction(QUALIFYING_ACTION_KIND.REMINDER_COMPLETED, reminderId);
                } catch {
                    // Left in the outbox on purpose. A completion that silently fails is
                    // the most corrosive bug this feature can have — the reminder comes
                    // back, and the worker learns the button does not work.
                }

                return;
            }

            const dueAt = dayjs().add(1, 'hour').toISOString();

            dispatch(
                roastEngagementActions.enqueue({
                    id: `snooze:${reminderId}`,
                    kind: 'SNOOZE',
                    payload: { _id: reminderId, dueAt },
                    queuedAt: new Date().toISOString(),
                    attempts: 0,
                })
            );

            try {
                await snoozeReminder({ _id: reminderId, dueAt }).unwrap();
                dispatch(roastEngagementActions.dequeue(`snooze:${reminderId}`));
            } catch {
                // Same reasoning. The local reschedule happens either way, because the
                // scheduler reconciles from the optimistically-patched cache: the worker
                // gets their reminder in an hour whether or not the server heard about it.
            }

            // Nudges the scheduler: the list this reminder lives in has changed, so the
            // reconcile re-schedules it for its new time.
            dispatch(roastEngagementApi.util.invalidateTags([{ type: 'ReminderList', id: 'LIST' }]));
        },
        [completeReminder, dispatch, pingAction, snoozeReminder]
    );

    useEffect(() => {
        const subscription = Notifications.addNotificationResponseReceivedListener(response => {
            handleResponse(response);
        });

        // A button pressed while the app was dead surfaces here rather than through the
        // listener, exactly as a tap does.
        //
        // `useNotificationObserver` reads the same value and then *clears* it, so the two
        // hooks are reading one non-replayable slot. They do not race: both effects are
        // registered in the same commit and both issue this call synchronously in their
        // effect body, so both reads are in flight before the observer's clear — which
        // only runs after its own read resolves — can land. The dedupe set below is the
        // backstop if that ever stops being true.
        Notifications.getLastNotificationResponseAsync()
            .then(response => {
                if (response) {
                    handleResponse(response);
                }
            })
            .catch(() => {});

        return () => subscription.remove();
    }, [handleResponse]);
};

export default useRoastNotificationActions;
