import dayjs from 'dayjs';
import { NOTIFICATION_CATEGORY, NOTIFICATION_PRIORITY } from '~/constants/notification-channels';
import type { IGetNotificationsPayload, INotificationRow, IReadResult } from './notification';

/**
 * ⚠️ **Temporary — delete this file once `/notification/*` is live.**
 *
 * Serves the notification centre from memory so the screen can be exercised before the
 * backend endpoints exist: day grouping, category filters, pagination, optimistic read,
 * mark-all-read, the route allowlist and the unread badge.
 *
 * Flip this to `false` (or delete the file and its three call sites in
 * `notification.ts`) to go back to the network. It is `&& __DEV__` so a build that ships
 * with the flag left on still talks to the real API — a mocked inbox reaching a user
 * would look exactly like a working one, which is the worst kind of bug to ship.
 */
export const USE_MOCK_NOTIFICATIONS = true && __DEV__;

const hoursAgo = (hours: number): string => dayjs().subtract(hours, 'hour').toISOString();
const daysAgo = (days: number): string => dayjs().subtract(days, 'day').toISOString();

/**
 * Rows chosen to cover the cases that actually break, not just the happy path:
 *
 * - every category, so each filter chip returns something
 * - every priority, including the `LOW` rows that carry no badge
 * - read and unread, in both states of the day grouping
 * - `content: {}`, a single `_id`, and the two-key report payload
 * - a title long enough to hit the two-line clamp, and a body long enough to wrap
 * - **a deliberately unroutable `url`** (`/attendance/clock-in`, which the backend emits
 *   today and this build does not have) so the allowlist fallback is visible
 * - a row with no `url` at all — an uncatalogued type
 * - a `BROADCAST` row, whose `isRead` is per-user
 * - one row from last year, which is the only way to see the `D MMM YYYY` date header
 */
const SEED_ROWS: INotificationRow[] = [
    {
        _id: 'mock-ticket-1',
        userId: 'mock-user',
        audience: 'USER',
        title: 'A ticket was issued to you',
        message: 'A ticket has been issued to you for lateness at First Service. Tap to read it and respond.',
        type: 'INDIVIDUAL_TICKET_ISSUED',
        category: NOTIFICATION_CATEGORY.TICKET,
        priority: NOTIFICATION_PRIORITY.HIGH,
        url: '/tickets/ticket-details',
        content: { _id: 'mock-ticket-entity-1' },
        isRead: false,
        readAt: null,
        expiresAt: null,
        createdAt: hoursAgo(1),
    },
    {
        _id: 'mock-report-1',
        userId: 'mock-user',
        audience: 'USER',
        title: 'Campus Pastor returned your service report for changes',
        message:
            'The attendance figures for Second Service do not reconcile with the ushering count, and the guest section is empty. Please correct both and resubmit before Wednesday so the campus summary can close on time.',
        type: 'REPORT_CP_CHANGE_REQUESTED',
        category: NOTIFICATION_CATEGORY.REPORT,
        priority: NOTIFICATION_PRIORITY.HIGH,
        url: '/gh-approvals/report-detail',
        content: { reportId: 'mock-report-entity-1', reportType: 'ServiceReport' },
        isRead: false,
        readAt: null,
        expiresAt: null,
        createdAt: hoursAgo(3),
    },
    {
        _id: 'mock-permission-1',
        userId: 'mock-user',
        audience: 'USER',
        title: 'Your permission request was approved',
        message: 'Your request for 12–14 September has been approved by your Head of Department.',
        type: 'PERMISSION_STATUS',
        category: NOTIFICATION_CATEGORY.PERMISSION,
        priority: NOTIFICATION_PRIORITY.NORMAL,
        url: '/permissions/permission-details',
        content: { _id: 'mock-permission-entity-1' },
        isRead: false,
        readAt: null,
        expiresAt: null,
        createdAt: hoursAgo(5),
    },
    {
        _id: 'mock-attendance-1',
        userId: 'mock-user',
        audience: 'USER',
        title: 'Clock in for First Service',
        message: 'First Service starts in 30 minutes. Clock in once you arrive on campus.',
        type: 'CLOCK_IN',
        category: NOTIFICATION_CATEGORY.ATTENDANCE,
        priority: NOTIFICATION_PRIORITY.HIGH,
        // The path the backend emits today. This build has no such route, so tapping it
        // must land on the centre rather than `/+not-found`.
        url: '/attendance/clock-in',
        content: {},
        isRead: true,
        readAt: hoursAgo(7),
        expiresAt: dayjs().add(16, 'hour').toISOString(),
        createdAt: hoursAgo(8),
    },
    {
        _id: 'mock-announcement-1',
        userId: null,
        audience: 'BROADCAST',
        title: 'CGWC 2026 registration closes on Friday',
        message:
            'Registration for the Global Workers Conference closes at midnight on Friday. Workers who have not registered will not be allocated accommodation.',
        type: 'GENERAL_NOTIFICATION',
        category: NOTIFICATION_CATEGORY.ANNOUNCEMENT,
        priority: NOTIFICATION_PRIORITY.LOW,
        url: '/congress',
        content: {},
        isRead: false,
        readAt: null,
        expiresAt: null,
        createdAt: daysAgo(1),
    },
    {
        _id: 'mock-attendance-summary-1',
        userId: 'mock-user',
        audience: 'USER',
        title: 'Ushering attendance summary for Sunday',
        message: '38 of 44 workers clocked in. 4 were late and 2 had approved permissions.',
        type: 'CLOCK_IN_SUMMARY',
        category: NOTIFICATION_CATEGORY.ATTENDANCE,
        priority: NOTIFICATION_PRIORITY.NORMAL,
        url: '/attendance',
        content: { tabKey: 'teamAttendance' },
        isRead: true,
        readAt: daysAgo(1),
        expiresAt: dayjs().add(6, 'day').toISOString(),
        createdAt: daysAgo(1),
    },
    {
        _id: 'mock-account-1',
        userId: 'mock-user',
        audience: 'USER',
        title: 'Your password was changed',
        message: 'If this was not you, contact your Campus Pastor immediately.',
        type: 'PASSWORD_CHANGED',
        category: NOTIFICATION_CATEGORY.ACCOUNT,
        priority: NOTIFICATION_PRIORITY.CRITICAL,
        // No `url` — an uncatalogued type. The row is still readable here.
        content: {},
        isRead: false,
        readAt: null,
        expiresAt: null,
        createdAt: daysAgo(1),
    },
    {
        _id: 'mock-ticket-2',
        userId: 'mock-user',
        audience: 'USER',
        title: 'A ticket issued to your department was retracted',
        message: 'The ticket issued to Ushering for Second Service has been retracted by Quality Control.',
        type: 'RETRACT_TICKET_ISSUED',
        category: NOTIFICATION_CATEGORY.TICKET,
        priority: NOTIFICATION_PRIORITY.NORMAL,
        url: '/tickets/ticket-details',
        content: { _id: 'mock-ticket-entity-2' },
        isRead: true,
        readAt: daysAgo(2),
        expiresAt: null,
        createdAt: daysAgo(3),
    },
    {
        _id: 'mock-permission-2',
        userId: 'mock-user',
        audience: 'USER',
        title: 'A permission request is waiting for your approval',
        message: 'Ngozi Eze has requested permission for 20 September. Three requests are now awaiting your review.',
        type: 'PERMISSION_CREATED',
        category: NOTIFICATION_CATEGORY.PERMISSION,
        priority: NOTIFICATION_PRIORITY.HIGH,
        url: '/permissions',
        content: {},
        isRead: false,
        readAt: null,
        expiresAt: null,
        createdAt: daysAgo(4),
    },
    {
        _id: 'mock-report-2',
        userId: 'mock-user',
        audience: 'USER',
        title: 'Global Senior Pastor approved the campus report',
        message: 'The Lagos campus report for the week of 10 August has been approved and closed.',
        type: 'REPORT_GSP_APPROVED',
        category: NOTIFICATION_CATEGORY.REPORT,
        priority: NOTIFICATION_PRIORITY.NORMAL,
        url: '/gh-approvals/report-detail',
        content: { reportId: 'mock-report-entity-2', reportType: 'CampusReport' },
        isRead: true,
        readAt: daysAgo(5),
        expiresAt: null,
        createdAt: daysAgo(6),
    },
    {
        _id: 'mock-system-1',
        userId: null,
        audience: 'BROADCAST',
        title: 'Scheduled maintenance on Saturday morning',
        message: 'The app will be unavailable between 02:00 and 04:00 on Saturday while the servers are upgraded.',
        type: 'SYSTEM_MAINTENANCE',
        category: NOTIFICATION_CATEGORY.SYSTEM,
        priority: NOTIFICATION_PRIORITY.LOW,
        content: {},
        isRead: true,
        readAt: daysAgo(9),
        expiresAt: null,
        createdAt: daysAgo(11),
    },
    {
        _id: 'mock-announcement-2',
        userId: null,
        audience: 'BROADCAST',
        title: 'Thank you to every worker who served through the December Congress season',
        message: 'A full report of the season, including departmental highlights, is now available under Congress.',
        type: 'GENERAL_NOTIFICATION',
        category: NOTIFICATION_CATEGORY.ANNOUNCEMENT,
        priority: NOTIFICATION_PRIORITY.LOW,
        url: '/congress/congress-report',
        content: {},
        isRead: true,
        readAt: daysAgo(300),
        expiresAt: null,
        createdAt: dayjs().subtract(1, 'year').subtract(9, 'day').toISOString(),
    },
];

/**
 * Filler, so there is a second page to scroll into. Alternating category and read state
 * keeps the filtered views paginated too rather than collapsing to one page each.
 */
const FILLER_ROWS: INotificationRow[] = Array.from({ length: 18 }, (_, index) => {
    const categories = [
        NOTIFICATION_CATEGORY.TICKET,
        NOTIFICATION_CATEGORY.PERMISSION,
        NOTIFICATION_CATEGORY.REPORT,
        NOTIFICATION_CATEGORY.ATTENDANCE,
    ];
    const category = categories[index % categories.length] as NOTIFICATION_CATEGORY;

    return {
        _id: `mock-filler-${index}`,
        userId: 'mock-user',
        audience: 'USER' as const,
        title: `Earlier ${category.toLowerCase()} activity`,
        message: `A ${category.toLowerCase()} notification from ${index + 7} days ago, kept so the list has something to page into.`,
        type: 'GENERAL_NOTIFICATION',
        category,
        priority: index % 3 === 0 ? NOTIFICATION_PRIORITY.NORMAL : NOTIFICATION_PRIORITY.LOW,
        content: {},
        isRead: index % 4 !== 0,
        readAt: null,
        expiresAt: null,
        createdAt: daysAgo(index + 7),
    };
});

const ALL_ROWS = [...SEED_ROWS, ...FILLER_ROWS];

/**
 * Read receipts recorded this session.
 *
 * Module-level so the state survives navigating away and back, which is exactly what the
 * screen's optimistic-read path needs to be tested against — a local-only overlay would
 * make every failure mode look like it worked. Resets on reload, like any mock.
 */
const readIds = new Set<string>(ALL_ROWS.filter(row => row.isRead).map(row => row._id));

const withReadState = (row: INotificationRow): INotificationRow => ({
    ...row,
    isRead: readIds.has(row._id),
    readAt: readIds.has(row._id) ? (row.readAt ?? new Date().toISOString()) : null,
});

/** Newest first, as the endpoint returns them. */
const sortedRows = (): INotificationRow[] =>
    [...ALL_ROWS].sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf()).map(withReadState);

export const mockUnreadCount = (): number => ALL_ROWS.filter(row => !readIds.has(row._id)).length;

/** Applies the same server-side filters the real endpoint does, then paginates. */
export const mockInboxPage = ({ page = 1, limit = 20, category, unreadOnly }: IGetNotificationsPayload) => {
    const filtered = sortedRows()
        .filter(row => (category ? row.category === category : true))
        .filter(row => (unreadOnly ? !row.isRead : true));

    const start = (page - 1) * limit;

    return {
        data: filtered.slice(start, start + limit),
        pagination: {
            page,
            limit,
            total: filtered.length,
            totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
        },
    };
};

export const mockMarkRead = (notificationIds: string[]): IReadResult => {
    const updated = notificationIds.filter(id => !readIds.has(id));
    updated.forEach(id => readIds.add(id));

    return { updated: updated.length, unreadCount: mockUnreadCount() };
};

export const mockMarkAllRead = (): IReadResult => {
    const updated = ALL_ROWS.filter(row => !readIds.has(row._id));
    updated.forEach(row => readIds.add(row._id));

    return { updated: updated.length, unreadCount: mockUnreadCount() };
};

/** Enough latency for a skeleton and a spinner to actually be visible. */
export const mockLatency = (ms = 450): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));
