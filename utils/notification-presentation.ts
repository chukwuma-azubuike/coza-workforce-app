import * as Notifications from 'expo-notifications';
import { NOTIFICATION_PRIORITY } from '~/constants/notification-channels';

/**
 * How a notification arriving while the app is open should present itself.
 *
 * | `data.priority`     | Banner | Sound | Badge |
 * |---------------------|--------|-------|-------|
 * | `CRITICAL` / `HIGH` | yes    | yes   | yes   |
 * | `NORMAL`            | yes    | no    | yes   |
 * | `LOW`               | no     | no    | no    |
 *
 * Never a modal. §7.1 — a notification must not interrupt an in-progress clock-in or
 * report form, and the OS banner is the one presentation that cannot steal focus.
 *
 * The previous handler returned `shouldPlaySound: true` and `priority: MAX` for
 * *everything*, so a routine attendance digest chimed as loudly as a ticket. Note the
 * two halves of "silent" are independent: the backend omits the payload's `sound` key
 * on `NORMAL`/`LOW`, but that only governs the background presentation the OS builds —
 * in the foreground this handler decides, and it has to make the same call.
 *
 * `shouldShowList` stays true even at `LOW`: silent means it does not announce itself,
 * not that it never happened. The tray entry is how the user finds it later.
 */
const PRESENTATION: Record<NOTIFICATION_PRIORITY, Notifications.NotificationBehavior> = {
    [NOTIFICATION_PRIORITY.CRITICAL]: {
        shouldShowAlert: true,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
    },
    [NOTIFICATION_PRIORITY.HIGH]: {
        shouldShowAlert: true,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    [NOTIFICATION_PRIORITY.NORMAL]: {
        shouldShowAlert: true,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: true,
        priority: Notifications.AndroidNotificationPriority.DEFAULT,
    },
    [NOTIFICATION_PRIORITY.LOW]: {
        shouldShowAlert: false,
        shouldShowBanner: false,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
        priority: Notifications.AndroidNotificationPriority.LOW,
    },
};

/**
 * Falls back to `NORMAL` rather than `HIGH` when `priority` is missing or unrecognised.
 *
 * An unknown priority means a payload this build predates, and the conservative failure
 * is a visible-but-silent banner: the user still learns something happened, and a
 * notification we cannot classify never gets to make noise.
 */
export const getNotificationBehaviour = (priority?: NOTIFICATION_PRIORITY): Notifications.NotificationBehavior =>
    (priority && PRESENTATION[priority]) || PRESENTATION[NOTIFICATION_PRIORITY.NORMAL];

/**
 * The unread count the payload carries, or `undefined` when it carries none.
 *
 * ⚠️ A missing `badge` means **"leave the badge alone"**, never zero (§7.4). `LOW`
 * notifications omit it deliberately so low-value items do not move the count, and
 * coercing that absence to `0` would silently clear a real backlog of unread rows.
 */
export const getBadgeCount = (badge?: number | null): number | undefined =>
    typeof badge === 'number' && Number.isFinite(badge) && badge >= 0 ? badge : undefined;
