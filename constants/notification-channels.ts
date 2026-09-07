import * as Notifications from 'expo-notifications';

/**
 * Android notification channel ids — **a contract with the backend, not an
 * implementation detail.**
 *
 * The app creates channels; the payload selects one by id. Neither half works alone,
 * and Android silently drops a notification addressed to a channel the device has
 * never created — no error to the app, nothing in the Expo receipt. So renaming an id
 * after release does not migrate anyone: it strands every existing install on a switch
 * they can no longer be reached through, and the only recovery is another release.
 *
 * Add ids here freely; never change or remove one that has shipped.
 */
export enum NOTIFICATION_CHANNEL {
    ATTENDANCE = 'attendance',
    ATTENDANCE_SUMMARY = 'attendance-summary',
    REPORTS = 'reports',
    PERMISSIONS = 'permissions',
    TICKETS = 'tickets',
    CONGRESS = 'congress',
    ANNOUNCEMENTS = 'announcements',
    ACCOUNT = 'account',
    ROAST_REMINDERS = 'roast-reminders',
    ROAST_NUDGES = 'roast-nudges',
    ROAST_STREAK = 'roast-streak',
    DEFAULT = 'default',
}

/** `data.category` — always present on the payload. Drives inbox filters. */
export enum NOTIFICATION_CATEGORY {
    ATTENDANCE = 'ATTENDANCE',
    PERMISSION = 'PERMISSION',
    REPORT = 'REPORT',
    TICKET = 'TICKET',
    ANNOUNCEMENT = 'ANNOUNCEMENT',
    ACCOUNT = 'ACCOUNT',
    SYSTEM = 'SYSTEM',
    /** A reminder the worker set themselves, on a guest. Never suppressed by the budget. */
    ROAST_REMINDER = 'ROAST_REMINDER',
    /** A nudge the system decided to send — the Morning Roast, the evening note prompt. */
    ROAST_ENGAGEMENT = 'ROAST_ENGAGEMENT',
    /** Streak at-risk warnings and milestones. */
    ROAST_STREAK = 'ROAST_STREAK',
}

/** `data.priority` — always present. Drives foreground presentation, not delivery. */
export enum NOTIFICATION_PRIORITY {
    CRITICAL = 'CRITICAL',
    HIGH = 'HIGH',
    NORMAL = 'NORMAL',
    LOW = 'LOW',
}

/**
 * The `data` block of a push payload.
 *
 * Every field is optional here even though the backend documents most of them as
 * always present: this is wire data, it survives a schema change on the other side,
 * and a hard assumption here becomes a crash on a device we cannot patch quickly.
 * Narrow at the point of use instead.
 */
export interface INotificationData {
    /** Routing key, e.g. `INDIVIDUAL_TICKET_ISSUED`. Kept for grouping and analytics. */
    type?: string;
    category?: NOTIFICATION_CATEGORY;
    priority?: NOTIFICATION_PRIORITY;
    /** A route path. Resolved against the allowlist in `constants/notification-routes`. */
    url?: string;
    /** Route params. `{}` when the destination takes none — never absent, never null. */
    content?: Record<string, unknown>;
    /** `_id` of the inbox row this push mirrors; the key for marking it read on tap. */
    notificationId?: string;
    timestamp?: string;
}

/**
 * The twelve channels, in the order they appear in Android's settings list.
 *
 * ⚠️ `importance` is a **ceiling the user may lower and the payload may never raise**,
 * which is the entire reason for splitting channels — setting everything to MAX gives
 * users one switch again, wearing twelve labels. `attendance-summary` is split from
 * `attendance` so a worker can silence the daily digest without silencing their own
 * clock-in reminder; `account` is separate so a security notification cannot be muted
 * along with announcements.
 *
 * Android also freezes importance at creation time: raising a value here has no effect
 * on installs that already ran an earlier build, so these are one-shot decisions.
 */
export const ANDROID_NOTIFICATION_CHANNELS: Array<
    { id: NOTIFICATION_CHANNEL } & Notifications.NotificationChannelInput
> = [
    {
        id: NOTIFICATION_CHANNEL.ATTENDANCE,
        name: 'Clock in & out',
        description: 'Reminders to clock in and out of a service.',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2D0060',
    },
    {
        id: NOTIFICATION_CHANNEL.ATTENDANCE_SUMMARY,
        name: 'Attendance summaries',
        description: 'Daily and per-service attendance digests for your department.',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 200],
        lightColor: '#2D0060',
    },
    {
        id: NOTIFICATION_CHANNEL.REPORTS,
        name: 'Reports',
        description: 'Reports awaiting your review, and decisions on reports you submitted.',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2D0060',
    },
    {
        id: NOTIFICATION_CHANNEL.PERMISSIONS,
        name: 'Permission requests',
        description: 'Permission requests awaiting your approval, and decisions on yours.',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2D0060',
    },
    {
        id: NOTIFICATION_CHANNEL.TICKETS,
        name: 'Tickets',
        description: 'Tickets issued to you or to your department, and retractions.',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2D0060',
    },
    {
        id: NOTIFICATION_CHANNEL.CONGRESS,
        name: 'Congress & CGWC',
        description: 'Congress sessions, instant messages and CGWC updates.',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2D0060',
    },
    {
        id: NOTIFICATION_CHANNEL.ANNOUNCEMENTS,
        name: 'Announcements',
        description: 'General announcements from your campus and the global workforce.',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 200],
        lightColor: '#2D0060',
    },
    {
        id: NOTIFICATION_CHANNEL.ACCOUNT,
        name: 'Account & security',
        description: 'Sign-in, password and profile security activity on your account.',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2D0060',
    },
    {
        id: NOTIFICATION_CHANNEL.ROAST_REMINDERS,
        name: 'Guest reminders',
        description: 'Reminders you set yourself on a guest, at the time you chose.',
        // The only Roast channel at HIGH, and the only one the worker explicitly asked
        // for. A reminder they set for 16:00 that arrives silently in the shade is a
        // reminder that did not work.
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2D0060',
    },
    {
        id: NOTIFICATION_CHANNEL.ROAST_NUDGES,
        name: 'Follow-up nudges',
        description: 'Suggestions about guests who are due a call, a note or an invite.',
        // DEFAULT, not HIGH: these are the system's opinion about what matters, and a
        // wrong opinion delivered at HIGH is what gets the whole category muted.
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 200],
        lightColor: '#2D0060',
    },
    {
        id: NOTIFICATION_CHANNEL.ROAST_STREAK,
        name: 'Streaks',
        description: 'Your daily engagement streak — at-risk warnings and milestones.',
        // LOW deliberately. A streak is a game; it earns a badge and a row in the
        // inbox, never a sound. Anyone who wants more can raise it themselves, and
        // Android lets them — it only refuses to let us raise it later.
        importance: Notifications.AndroidImportance.LOW,
        vibrationPattern: [0],
        lightColor: '#2D0060',
    },
    {
        id: NOTIFICATION_CHANNEL.DEFAULT,
        name: 'General',
        description: 'Anything that does not belong to one of the categories above.',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 200],
        lightColor: '#2D0060',
    },
];
