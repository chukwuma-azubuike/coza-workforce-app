import { useCallback, useEffect, useRef } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useAppDispatch, useAppSelector } from '~/store/hooks';
import { userSelectors } from '~/store/actions/users';
import { IOutboxEntry, roastEngagementActions, roastEngagementSelectors } from '~/store/actions/roast-engagement';
import { roastEngagementApi } from '~/store/services/roast-engagement';
import { ICreateReminderPayload, REMINDER_COMPLETED_VIA } from '~/store/types';
import { drainWidgetCompletions } from '~/utils/widget-completion-queue';
import useAppForeground from './use-app-foreground';

/**
 * How many times an entry is retried before it is dropped.
 *
 * Retrying forever is worse than giving up: an entry the server will never accept — a
 * reminder deleted on another device, a guest reassigned away — would otherwise be
 * re-sent on every foreground for the life of the install, and would block nothing but
 * still cost a request each time. Six attempts spans several days of normal use.
 */
const MAX_ATTEMPTS = 6;

/**
 * Applies mutations that were made with no network.
 *
 * Runs on reconnect and on every genuine foreground. Entries are applied **in order**,
 * not in parallel: a create followed by a complete on the same reminder has to happen in
 * that sequence, and firing both at once means the complete arrives for an id the server
 * has not minted yet.
 *
 * Every entry is idempotent by construction — creates carry an `Idempotency-Key`,
 * completes and snoozes are keyed on a server id — so a flush that dies halfway and
 * re-runs from the start is safe.
 */
const useOutboxFlush = () => {
    const dispatch = useAppDispatch();
    const user = useAppSelector(userSelectors.selectCurrentUser);
    const isAuthenticated = !!(user?.userId ?? user?._id);
    const outbox = useAppSelector(roastEngagementSelectors.selectOutbox);

    const outboxRef = useRef(outbox);
    outboxRef.current = outbox;

    const inFlight = useRef(false);

    const applyEntry = useCallback(
        async (entry: IOutboxEntry) => {
            switch (entry.kind) {
                case 'COMPLETE': {
                    const payload = entry.payload as { _id: string; completedVia?: REMINDER_COMPLETED_VIA };

                    await dispatch(
                        roastEngagementApi.endpoints.completeReminder.initiate({
                            _id: payload._id,
                            completedVia: payload.completedVia ?? REMINDER_COMPLETED_VIA.APP,
                        })
                    ).unwrap();

                    return;
                }

                case 'SNOOZE': {
                    const payload = entry.payload as { _id: string; dueAt: string };

                    await dispatch(roastEngagementApi.endpoints.snoozeReminder.initiate(payload)).unwrap();

                    return;
                }

                case 'CREATE': {
                    const payload = entry.payload as ICreateReminderPayload;

                    await dispatch(
                        roastEngagementApi.endpoints.createReminder.initiate({
                            ...payload,
                            // The entry id *is* the idempotency key. A create flushed twice
                            // — by two foregrounds racing, or by a response lost after the
                            // server committed — must not become two reminders.
                            idempotencyKey: payload.idempotencyKey ?? entry.id,
                        })
                    ).unwrap();

                    return;
                }

                case 'DELETE': {
                    const payload = entry.payload as { _id: string };

                    await dispatch(roastEngagementApi.endpoints.deleteReminder.initiate(payload._id)).unwrap();

                    return;
                }

                default:
                    return;
            }
        },
        [dispatch]
    );

    /**
     * Moves widget and tray completions into the outbox.
     *
     * They arrive in a plain AsyncStorage list because the contexts that create them —
     * an Android headless task, an iOS App Intent — have no store to dispatch into. This
     * is the handover point: once they are outbox entries, the existing ordering, retry
     * and idempotency rules own them and nothing downstream needs to know where they came
     * from.
     *
     * Runs before the flush rather than after, so a completion tapped on the home screen
     * while the app was closed goes out on the very next foreground rather than the one
     * after it.
     */
    const adoptWidgetCompletions = useCallback(async (): Promise<IOutboxEntry[]> => {
        const completions = await drainWidgetCompletions();

        const entries: IOutboxEntry[] = completions.map(completion => ({
            // Keyed on the reminder, so the same completion arriving from both the widget
            // and the tray collapses into one entry rather than two.
            id: `widget-complete:${completion.reminderId}`,
            kind: 'COMPLETE',
            payload: { _id: completion.reminderId, completedVia: REMINDER_COMPLETED_VIA.WIDGET },
            queuedAt: completion.at,
            attempts: 0,
        }));

        entries.forEach(entry => dispatch(roastEngagementActions.enqueue(entry)));

        // Returned as well as dispatched. A dispatch does not reach `outboxRef` until the
        // re-render, so the flush below would otherwise miss everything adopted this tick
        // and only send it on the *next* foreground — which, for a completion tapped on
        // the home screen with the app closed, is the one case that has to work now.
        return entries;
    }, [dispatch]);

    const flush = useCallback(async () => {
        if (!isAuthenticated || inFlight.current) {
            return;
        }

        const adopted = await adoptWidgetCompletions();

        if (!outboxRef.current.length && !adopted.length) {
            return;
        }

        inFlight.current = true;

        try {
            // Snapshotted rather than read live. Each success dispatches a `dequeue`, which
            // re-renders and replaces `outboxRef.current` mid-loop; iterating the live
            // value would skip entries as the array shifts under it.
            //
            // Adopted entries are merged by id rather than appended, matching `enqueue`'s
            // own replace-by-id semantics, so a completion that was already queued does not
            // get applied twice.
            const merged = [
                ...outboxRef.current.filter(entry => !adopted.some(item => item.id === entry.id)),
                ...adopted,
            ];

            const entries = merged.sort((a, b) => a.queuedAt.localeCompare(b.queuedAt));

            for (const entry of entries) {
                try {
                    await applyEntry(entry);
                    dispatch(roastEngagementActions.dequeue(entry.id));
                } catch {
                    dispatch(roastEngagementActions.recordAttempt(entry.id));

                    if (entry.attempts + 1 >= MAX_ATTEMPTS) {
                        dispatch(roastEngagementActions.dequeue(entry.id));
                        continue;
                    }

                    // Stop at the first live failure rather than working through the rest.
                    // The usual cause is simply being offline again, and hammering the
                    // remaining entries only burns retries against the same wall — while
                    // an ordering dependency between two entries would be broken by
                    // skipping past the one that failed.
                    break;
                }
            }
        } finally {
            inFlight.current = false;
        }
    }, [adoptWidgetCompletions, applyEntry, dispatch, isAuthenticated]);

    useAppForeground(flush);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            // `isInternetReachable` is null until the first probe resolves; unknown counts
            // as reachable, matching `store/rn-listeners.ts`. A false "offline" costs a
            // flush that was needed; a false "online" costs one failed request the next
            // event corrects.
            if (state.isConnected !== false && state.isInternetReachable !== false) {
                flush();
            }
        });

        return unsubscribe;
    }, [flush]);

    return { flush, pending: outbox.length };
};

export default useOutboxFlush;
