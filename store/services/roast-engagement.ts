import { createApi } from '@reduxjs/toolkit/query/react';
import { roastBaseQuery } from './fetch-utils';
import {
    ICreateReminderPayload,
    IDefaultResponse,
    IEngagementPing,
    IPaginationParams,
    IReminderSync,
    IReminderSyncQuery,
    IRemindersQuery,
    IRoastNotificationPrefs,
    IRoastReminder,
    IStreakHistory,
    IStreakState,
    ITodayTasks,
    ITodayTasksQuery,
    IUpdateReminderPayload,
    REMINDER_COMPLETED_VIA,
    REMINDER_STATUS,
    REST_API_VERBS,
} from '../types';

/**
 * The Roast engagement API — tasks, reminders, streaks and notification preferences.
 *
 * **A separate service from `roastCrmApi`, on the same base URL.** Splitting it is
 * deliberate: `roast-crm.ts` carries `keepUnusedDataFor: 48h`, which is right for zones
 * and assimilation stages and badly wrong for a feed that changes hourly. Sharing a
 * service would mean sharing that lifetime.
 *
 * Every response arrives in the standard `IDefaultResponse` envelope, so every endpoint
 * unwraps `res.data`.
 */
/**
 * Whether a cached `getReminders` list is one a given reminder belongs in.
 *
 * The same reminder lives in several cache entries under different arguments — the guest
 * profile's `{ guestId }`, My Reminders' `{ status, limit }`, the scheduler's own
 * `{ status: UPCOMING, limit: 200 }` — and an optimistic write has to reach all of them or
 * the number on one screen disagrees with the list on another.
 *
 * `status` is a **comma-separated** string on the wire, so it is split rather than
 * compared; an absent filter means every status and matches everything.
 */
const listAcceptsReminder = (
    args: IRemindersQuery | undefined,
    reminder: { guestId: string; status: REMINDER_STATUS }
): boolean => {
    if (args?.guestId && args.guestId !== reminder.guestId) {
        return false;
    }

    return !args?.status || args.status.split(',').includes(reminder.status);
};

export const roastEngagementApi = createApi({
    reducerPath: 'roastEngagement',

    baseQuery: roastBaseQuery,

    tagTypes: ['Task', 'Reminder', 'ReminderList', 'Streak', 'StreakHistory', 'RoastPrefs'],

    refetchOnFocus: true,
    refetchOnReconnect: true,

    /**
     * Five minutes.
     *
     * The task feed answers "what should I do right now". Serving a 48-hour-old one is
     * worse than a spinner, and the persisted slice already covers the genuinely offline
     * case with an explicit "last updated" line.
     */
    keepUnusedDataFor: 300,

    endpoints: endpoint => ({
        /* ------------------------------- Tasks -------------------------------- */

        getTodayTasks: endpoint.query<ITodayTasks, ITodayTasksQuery>({
            query: params => ({
                url: '/tasks/today',
                method: REST_API_VERBS.GET,
                params,
            }),
            transformResponse: (res: IDefaultResponse<ITodayTasks>) => res.data,
            providesTags: ['Task'],
        }),

        /**
         * Wave away a NOTE or PROGRESS suggestion.
         *
         * `_id` here is the task's **composite** id (`note:652b…`), not a document id.
         * Only those two kinds are dismissible — see `DISMISSIBLE_TASK_KINDS`; anything
         * else 400s, so the UI must not offer the gesture.
         */
        dismissTask: endpoint.mutation<void, string>({
            query: taskId => ({
                url: `/tasks/${encodeURIComponent(taskId)}/dismiss`,
                method: REST_API_VERBS.POST,
            }),
            invalidatesTags: ['Task'],
        }),

        /* ----------------------------- Reminders ------------------------------ */

        getReminders: endpoint.query<{ data: IRoastReminder[]; pagination?: IPaginationParams }, IRemindersQuery>({
            query: params => ({
                url: '/reminders',
                method: REST_API_VERBS.GET,
                params,
            }),
            transformResponse: (res: IDefaultResponse<IRoastReminder[]>) => ({
                data: res.data,
                pagination: res.pagination,
            }),
            providesTags: result =>
                result?.data
                    ? [
                          ...result.data.map(({ _id }) => ({ type: 'Reminder' as const, id: _id })),
                          { type: 'ReminderList' as const, id: 'LIST' },
                      ]
                    : [{ type: 'ReminderList' as const, id: 'LIST' }],
        }),

        /**
         * The scheduler's input — everything that changed since `since`, tombstones
         * included.
         *
         * Deliberately a **mutation, not a query**: it writes device state server-side
         * (`lastSyncAt`, `scheduledThroughAt`), it is called imperatively from the
         * scheduler rather than subscribed to by a screen, and caching a sync cursor's
         * response is meaningless — the next call must always ask again.
         */
        syncReminders: endpoint.mutation<IReminderSync, IReminderSyncQuery>({
            query: params => ({
                url: '/reminders/sync',
                method: REST_API_VERBS.GET,
                params,
            }),
            transformResponse: (res: IDefaultResponse<IReminderSync>) => res.data,
        }),

        /**
         * Set a reminder.
         *
         * **Optimistic.** The counts this feeds — the badge on My Guests' Reminders
         * button, the one on the guest profile's card — are the confirmation that the
         * reminder was set. Waiting for a round trip before either moves means the sheet
         * closes onto a screen that looks exactly as it did before, which reads as the
         * save having failed; the worker's usual response is to set it again.
         *
         * The provisional row carries a client-side `_id`. It is replaced wholesale when
         * the invalidation below refetches, so nothing downstream ever has to reconcile
         * the temporary id with the real one — it only has to survive being rendered,
         * which is why every field on `IRoastReminder` is populated rather than cast.
         */
        createReminder: endpoint.mutation<IRoastReminder, ICreateReminderPayload>({
            query: ({ idempotencyKey, ...body }) => ({
                url: '/reminders',
                method: REST_API_VERBS.POST,
                body,
                // A header, not a body field. The server keys a partial unique index on
                // it, so a flush that repeats returns the original with 200 instead of
                // creating a twin.
                ...(idempotencyKey ? { headers: { 'Idempotency-Key': idempotencyKey } } : {}),
            }),
            transformResponse: (res: IDefaultResponse<IRoastReminder>) => res.data,

            async onQueryStarted(payload, { dispatch, queryFulfilled, getState }) {
                const now = new Date().toISOString();

                const optimistic: IRoastReminder = {
                    // Prefixed so a row that somehow outlives the refetch is obvious in a
                    // log rather than looking like a document id.
                    _id: `optimistic:${payload.idempotencyKey ?? now}`,
                    // Not read by anything that renders a reminder, and reaching into the
                    // user slice from here would couple the API layer to it for a field
                    // the server is about to send back anyway.
                    userId: '',
                    guestId: payload.guestId,
                    note: payload.note,
                    dueAt: payload.dueAt,
                    timezone: payload.timezone,
                    status: REMINDER_STATUS.UPCOMING,
                    snoozeCount: 0,
                    idempotencyKey: payload.idempotencyKey ?? null,
                    createdAt: now,
                };

                const patches: Array<{ undo: () => void }> = [];

                for (const entry of roastEngagementApi.util.selectInvalidatedBy(getState(), [
                    { type: 'ReminderList', id: 'LIST' },
                ])) {
                    if (entry.endpointName !== 'getReminders') {
                        continue;
                    }

                    const args = entry.originalArgs as IRemindersQuery | undefined;

                    if (!listAcceptsReminder(args, optimistic)) {
                        continue;
                    }

                    patches.push(
                        dispatch(
                            roastEngagementApi.util.updateQueryData('getReminders', args as IRemindersQuery, draft => {
                                draft.data = [...(draft.data ?? []), optimistic];
                            })
                        )
                    );
                }

                try {
                    await queryFulfilled;
                } catch {
                    patches.forEach(patch => patch.undo());
                }
            },

            invalidatesTags: [{ type: 'ReminderList', id: 'LIST' }, 'Task'],
        }),

        updateReminder: endpoint.mutation<IRoastReminder, IUpdateReminderPayload>({
            query: ({ _id, ...body }) => ({
                url: `/reminders/${_id}`,
                method: REST_API_VERBS.PATCH,
                body,
            }),
            transformResponse: (res: IDefaultResponse<IRoastReminder>) => res.data,
            invalidatesTags: (_result, _error, { _id }) => [
                { type: 'Reminder', id: _id },
                { type: 'ReminderList', id: 'LIST' },
                'Task',
            ],
        }),

        /**
         * Mark done.
         *
         * **Optimistic, and it has to be.** This is reached from a notification tray on a
         * bad network; a spinner between tap and effect is the difference between "done"
         * and "did that work?". The server is idempotent on completion, so the replay
         * that the offline outbox performs cannot resurrect the row.
         */
        completeReminder: endpoint.mutation<IRoastReminder, { _id: string; completedVia: REMINDER_COMPLETED_VIA }>({
            query: ({ _id, completedVia }) => ({
                url: `/reminders/${_id}/complete`,
                method: REST_API_VERBS.PATCH,
                body: { completedVia },
            }),
            transformResponse: (res: IDefaultResponse<IRoastReminder>) => res.data,

            async onQueryStarted({ _id, completedVia }, { dispatch, queryFulfilled, getState }) {
                const completedAt = new Date().toISOString();
                const patches: Array<{ undo: () => void }> = [];

                // Every cached `getReminders` list, whatever its arguments — the guest
                // profile's list and My Reminders hold the same row under different
                // cache keys, and patching only the one in view leaves the other stale.
                for (const entry of roastEngagementApi.util.selectInvalidatedBy(getState(), [
                    { type: 'Reminder', id: _id },
                ])) {
                    if (entry.endpointName !== 'getReminders') {
                        continue;
                    }

                    patches.push(
                        dispatch(
                            roastEngagementApi.util.updateQueryData(
                                'getReminders',
                                entry.originalArgs as IRemindersQuery,
                                draft => {
                                    const row = draft.data?.find(reminder => reminder._id === _id);

                                    if (row) {
                                        row.status = REMINDER_STATUS.COMPLETED;
                                        row.completedAt = completedAt;
                                        row.completedVia = completedVia;
                                    }
                                }
                            )
                        )
                    );
                }

                try {
                    await queryFulfilled;
                } catch {
                    patches.forEach(patch => patch.undo());
                }
            },

            invalidatesTags: (_result, _error, { _id }) => [
                { type: 'Reminder', id: _id },
                { type: 'ReminderList', id: 'LIST' },
                'Task',
                // Completing a reminder is a qualifying action server-side, so the
                // streak the header is showing is now out of date.
                'Streak',
            ],
        }),

        /**
         * Snooze to a later time.
         *
         * 400s once `snoozeCount` reaches `MAX_SNOOZE_COUNT` (10) with a field-level
         * error on `dueAt`. That is a real state a user can reach, not an edge case —
         * render the message rather than a generic failure.
         */
        snoozeReminder: endpoint.mutation<IRoastReminder, { _id: string; dueAt: string }>({
            query: ({ _id, dueAt }) => ({
                url: `/reminders/${_id}/snooze`,
                method: REST_API_VERBS.PATCH,
                body: { dueAt },
            }),
            transformResponse: (res: IDefaultResponse<IRoastReminder>) => res.data,

            async onQueryStarted({ _id, dueAt }, { dispatch, queryFulfilled, getState }) {
                const patches: Array<{ undo: () => void }> = [];

                for (const entry of roastEngagementApi.util.selectInvalidatedBy(getState(), [
                    { type: 'Reminder', id: _id },
                ])) {
                    if (entry.endpointName !== 'getReminders') {
                        continue;
                    }

                    patches.push(
                        dispatch(
                            roastEngagementApi.util.updateQueryData(
                                'getReminders',
                                entry.originalArgs as IRemindersQuery,
                                draft => {
                                    const row = draft.data?.find(reminder => reminder._id === _id);

                                    if (row) {
                                        // `snoozedFrom` keeps the ORIGINAL time, so it is
                                        // only set on the first snooze — mirroring what
                                        // the server does, so the optimistic row and the
                                        // confirmed one agree.
                                        row.snoozedFrom = row.snoozedFrom ?? row.dueAt;
                                        row.dueAt = dueAt;
                                        row.snoozeCount += 1;
                                        row.status = REMINDER_STATUS.UPCOMING;
                                    }
                                }
                            )
                        )
                    );
                }

                try {
                    await queryFulfilled;
                } catch {
                    patches.forEach(patch => patch.undo());
                }
            },

            invalidatesTags: (_result, _error, { _id }) => [
                { type: 'Reminder', id: _id },
                { type: 'ReminderList', id: 'LIST' },
                'Task',
            ],
        }),

        /**
         * Delete a reminder.
         *
         * **Optimistic**, for the same reason as `createReminder` — and more so: this one
         * is reached through a confirmation dialog, so the worker has already committed
         * and a row that lingers afterwards reads as the delete having been refused.
         */
        deleteReminder: endpoint.mutation<void, string>({
            query: _id => ({
                url: `/reminders/${_id}`,
                method: REST_API_VERBS.DELETE,
            }),

            async onQueryStarted(_id, { dispatch, queryFulfilled, getState }) {
                const patches: Array<{ undo: () => void }> = [];

                for (const entry of roastEngagementApi.util.selectInvalidatedBy(getState(), [
                    { type: 'Reminder', id: _id },
                ])) {
                    if (entry.endpointName !== 'getReminders') {
                        continue;
                    }

                    patches.push(
                        dispatch(
                            roastEngagementApi.util.updateQueryData(
                                'getReminders',
                                entry.originalArgs as IRemindersQuery,
                                draft => {
                                    draft.data = (draft.data ?? []).filter(reminder => reminder._id !== _id);
                                }
                            )
                        )
                    );
                }

                try {
                    await queryFulfilled;
                } catch {
                    patches.forEach(patch => patch.undo());
                }
            },

            invalidatesTags: (_result, _error, _id) => [
                { type: 'Reminder', id: _id },
                { type: 'ReminderList', id: 'LIST' },
                'Task',
            ],
        }),

        /* --------------------------- Engagement ------------------------------- */

        /**
         * Record engagement for the device's local day.
         *
         * Returns the whole streak state, so no caller ever needs a follow-up `GET`.
         * Idempotent by construction — a unique index on `(userId, localDate)` means two
         * pings from two handsets in the same second cannot both count.
         */
        pingEngagement: endpoint.mutation<IStreakState, IEngagementPing>({
            query: body => ({
                url: '/engagement/ping',
                method: REST_API_VERBS.POST,
                body,
            }),
            transformResponse: (res: IDefaultResponse<IStreakState>) => res.data,
            invalidatesTags: ['Streak', 'StreakHistory'],
        }),

        getStreak: endpoint.query<IStreakState, { tz: string }>({
            query: params => ({
                url: '/streaks/me',
                method: REST_API_VERBS.GET,
                params,
            }),
            transformResponse: (res: IDefaultResponse<IStreakState>) => res.data,
            providesTags: ['Streak'],
        }),

        getStreakHistory: endpoint.query<IStreakHistory, { months?: number; tz: string }>({
            query: params => ({
                url: '/streaks/me/history',
                method: REST_API_VERBS.GET,
                params,
            }),
            transformResponse: (res: IDefaultResponse<IStreakHistory>) => res.data,
            providesTags: ['StreakHistory'],
        }),

        acknowledgeStreakReset: endpoint.mutation<void, void>({
            query: () => ({
                url: '/streaks/me/acknowledge-reset',
                method: REST_API_VERBS.POST,
            }),
            invalidatesTags: ['Streak'],
        }),

        /* --------------------------- Preferences ------------------------------ */

        getNotificationPreferences: endpoint.query<IRoastNotificationPrefs, void>({
            query: () => ({
                url: '/notification-preferences/me',
                method: REST_API_VERBS.GET,
            }),
            transformResponse: (res: IDefaultResponse<IRoastNotificationPrefs>) => res.data,
            providesTags: ['RoastPrefs'],
        }),

        updateNotificationPreferences: endpoint.mutation<IRoastNotificationPrefs, Partial<IRoastNotificationPrefs>>({
            query: body => ({
                url: '/notification-preferences/me',
                method: REST_API_VERBS.PATCH,
                body,
            }),
            transformResponse: (res: IDefaultResponse<IRoastNotificationPrefs>) => res.data,

            // Optimistic: a settings toggle that waits for a round trip before moving
            // reads as broken, and every field here is trivially reversible.
            async onQueryStarted(body, { dispatch, queryFulfilled }) {
                const patch = dispatch(
                    roastEngagementApi.util.updateQueryData('getNotificationPreferences', undefined, draft => {
                        Object.assign(draft, body);
                    })
                );

                try {
                    await queryFulfilled;
                } catch {
                    patch.undo();
                }
            },

            invalidatesTags: ['RoastPrefs', 'Task'],
        }),
    }),
});

export const {
    useGetTodayTasksQuery,
    useDismissTaskMutation,
    useGetRemindersQuery,
    useLazyGetRemindersQuery,
    useSyncRemindersMutation,
    useCreateReminderMutation,
    useUpdateReminderMutation,
    useCompleteReminderMutation,
    useSnoozeReminderMutation,
    useDeleteReminderMutation,
    usePingEngagementMutation,
    useGetStreakQuery,
    useGetStreakHistoryQuery,
    useAcknowledgeStreakResetMutation,
    useGetNotificationPreferencesQuery,
    useUpdateNotificationPreferencesMutation,
} = roastEngagementApi;
