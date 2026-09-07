import { createApi } from '@reduxjs/toolkit/query/react';
import { IDefaultResponse, IPaginationParams, REST_API_VERBS } from '../types';
import { fetchUtils } from './fetch-utils';
import { NOTIFICATION_CATEGORY, NOTIFICATION_PRIORITY } from '~/constants/notification-channels';

const SERVICE_URL = 'notification';

/**
 * One row of the in-app inbox.
 *
 * The inbox — not push — is the durable channel. Every notification is written here
 * first and pushed best-effort on top, so a worker with no registered device, a revoked
 * OS permission or a quiet-hours notification still has it waiting on next open. Treat
 * an arriving push as a hint that this list changed.
 */
export interface INotificationRow {
    _id: string;
    /** `null` on a broadcast — the row is not owned by one user. */
    userId?: string | null;
    audience?: 'USER' | 'BROADCAST';
    title: string;
    message: string;
    /** Routing key, e.g. `INDIVIDUAL_TICKET_ISSUED`. */
    type?: string;
    category?: NOTIFICATION_CATEGORY;
    priority?: NOTIFICATION_PRIORITY;
    /** Same routing target the push carried, so an inbox tap lands where a tray tap does. */
    url?: string;
    content?: Record<string, unknown>;
    image?: string;
    /**
     * Authoritative for both audiences. On a broadcast it is computed for the requesting
     * user from a per-user read receipt, so it never changes because someone else read it.
     */
    isRead: boolean;
    readAt?: string | null;
    /**
     * Set on time-boxed rows — clock-in reminders expire after 24h, summaries after 7
     * days — and the row is then removed by a TTL index. Tickets, permissions and reports
     * are `null` and kept indefinitely, so an inbox is not a complete activity history.
     */
    expiresAt?: string | null;
    createdAt: string;
    updatedAt?: string;
}

export interface IGetNotificationsPayload {
    userId: string;
    page?: number;
    /** Clamped to 1–100 server-side. */
    limit?: number;
    category?: NOTIFICATION_CATEGORY;
    unreadOnly?: boolean;
}

export interface IMarkReadPayload {
    userId: string;
    notificationIds: string[];
}

/** Both `PATCH`es return the caller's fresh count, so the badge needs no follow-up call. */
export interface IReadResult {
    updated: number;
    unreadCount: number;
}

interface IInboxResponse {
    notifications: INotificationRow[];
    pagination?: {
        current?: number;
        limit?: number;
        total?: number;
        pages?: number;
    };
}

export const notificationServiceSlice = createApi({
    // Not `SERVICE_URL` like its siblings: the persisted UI slice already owns
    // `notifications`, and a cache slice called `notification` one character away from it
    // is a trap for the next person reading `store/index.ts`.
    reducerPath: 'notificationApi',

    baseQuery: fetchUtils.baseQueryWithTokenRefresh,

    tagTypes: ['notification', 'unreadCount'],

    // There is no realtime channel — `socket.io` is a dependency on both sides but wired
    // on neither — so the inbox is pull-only. Refetching on focus and on reconnect is what
    // stands in for it, alongside pull-to-refresh on the screen itself.
    refetchOnFocus: true,
    refetchOnReconnect: true,

    endpoints: endpoint => ({
        getNotifications: endpoint.query<
            { data: INotificationRow[]; pagination: IPaginationParams },
            IGetNotificationsPayload
        >({
            query: ({ userId, ...params }) => ({
                url: `/${SERVICE_URL}/user/${userId}`,
                params,
            }),

            // Renamed into the shape `useInfiniteData` reads. The server speaks
            // `{ current, pages }`; the hook expects `{ page, totalPages }`, and a
            // mismatch here silently pins `hasNextPage` to the page-size heuristic.
            transformResponse: (response: IDefaultResponse<IInboxResponse>) => ({
                data: response.data?.notifications ?? [],
                pagination: {
                    page: response.data?.pagination?.current,
                    limit: response.data?.pagination?.limit,
                    total: response.data?.pagination?.total,
                    totalPages: response.data?.pagination?.pages,
                } as IPaginationParams,
            }),

            providesTags: ['notification'],
        }),

        markNotificationsRead: endpoint.mutation<IReadResult, IMarkReadPayload>({
            query: ({ userId, notificationIds }) => ({
                url: `/${SERVICE_URL}/read/${userId}`,
                method: REST_API_VERBS.PATCH,
                body: { notificationIds },
            }),

            transformResponse: (response: IDefaultResponse<IReadResult>) => response.data,

            // Deliberately does **not** invalidate `notification`. The screen shows the row
            // as read the moment it is tapped and reverts if this call fails, so refetching
            // the whole list would only cost a round trip and a flicker mid-navigation. The
            // next focus reconciles it.
            invalidatesTags: ['unreadCount'],
        }),

        markAllNotificationsRead: endpoint.mutation<IReadResult, string>({
            query: userId => ({
                url: `/${SERVICE_URL}/read-all/${userId}`,
                method: REST_API_VERBS.PATCH,
            }),

            transformResponse: (response: IDefaultResponse<IReadResult>) => response.data,

            // Every row changed, so unlike the single-row case the list is genuinely stale.
            invalidatesTags: ['notification', 'unreadCount'],
        }),

        getUnreadCount: endpoint.query<number, string>({
            query: userId => `/${SERVICE_URL}/unread-count/${userId}`,

            transformResponse: (response: IDefaultResponse<{ unreadCount: number }>) => response.data?.unreadCount ?? 0,

            providesTags: ['unreadCount'],
        }),
    }),
});

export const {
    useGetNotificationsQuery,
    useGetUnreadCountQuery,
    useMarkNotificationsReadMutation,
    useMarkAllNotificationsReadMutation,
} = notificationServiceSlice;
