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

        deleteReminder: endpoint.mutation<void, string>({
            query: _id => ({
                url: `/reminders/${_id}`,
                method: REST_API_VERBS.DELETE,
            }),
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
