import type * as Notifications from 'expo-notifications';
import { INotificationData, NOTIFICATION_CATEGORY, NOTIFICATION_PRIORITY } from '~/constants/notification-channels';
import {
    isKnownNotificationRoute,
    NOTIFICATION_FALLBACK_ROUTE,
    toNavigableRoute,
} from '~/constants/notification-routes';

/** Params in the shape `router.push` accepts. */
export type INotificationRouteParams = Record<string, string | number | (string | number)[]>;

export interface INotificationTarget {
    pathname: string;
    params: INotificationRouteParams;
    /** `_id` of the inbox row, so a tap can mark it read. */
    notificationId?: string;
    /** True when `url` was absent or unknown to this build and we fell back. */
    isFallback: boolean;
}

/**
 * Reads the `data` block off a notification without trusting any of it.
 *
 * Push data crosses a process boundary and, on Android, a JSON round-trip that can
 * hand back a *string* where the contract promises an object. Everything below narrows
 * rather than casts.
 */
export const parseNotificationData = (notification?: Notifications.Notification | null): INotificationData => {
    const raw = notification?.request?.content?.data;

    if (!raw || typeof raw !== 'object') {
        return {};
    }

    const data = raw as Record<string, unknown>;

    // Checked against the values rather than `in`, which would compare against the enum
    // *keys* and only pass today because every member is named after its own value.
    const toEnum = <T extends Record<string, string>>(members: T, value: unknown): T[keyof T] | undefined =>
        typeof value === 'string' && Object.values(members).includes(value) ? (value as T[keyof T]) : undefined;

    const asString = (value: unknown): string | undefined => (typeof value === 'string' ? value : undefined);

    return {
        type: asString(data['type']),
        category: toEnum(NOTIFICATION_CATEGORY, data['category']),
        priority: toEnum(NOTIFICATION_PRIORITY, data['priority']),
        url: asString(data['url']),
        content: toContentObject(data['content']),
        notificationId: asString(data['notificationId']),
        timestamp: asString(data['timestamp']),
    };
};

/**
 * `content` is documented as always an object, but Android's FCM data bridge stringifies
 * nested JSON on some paths, so a string that parses to an object is accepted too.
 */
const toContentObject = (content: unknown): Record<string, unknown> | undefined => {
    if (content && typeof content === 'object' && !Array.isArray(content)) {
        return content as Record<string, unknown>;
    }

    if (typeof content === 'string' && content.trim().startsWith('{')) {
        try {
            const parsed = JSON.parse(content);
            return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : undefined;
        } catch {
            return undefined;
        }
    }

    return undefined;
};

/**
 * Flattens `content` into route params.
 *
 * Expo Router serialises params into the URL, so a nested object arrives at the screen
 * as the literal `[object Object]` — worse than absent, because the screen then queries
 * with it. Primitives pass through; anything else is dropped rather than mangled.
 */
const toRouteParams = (content?: Record<string, unknown>): INotificationRouteParams => {
    if (!content) {
        return {};
    }

    return Object.entries(content).reduce<INotificationRouteParams>((params, [key, value]) => {
        if (typeof value === 'string' || typeof value === 'number') {
            params[key] = value;
        } else if (typeof value === 'boolean') {
            params[key] = String(value);
        } else if (Array.isArray(value)) {
            const primitives = value.filter(
                (item): item is string | number => typeof item === 'string' || typeof item === 'number'
            );

            if (primitives.length) {
                params[key] = primitives;
            }
        }

        return params;
    }, {});
};

/**
 * Resolves a notification — from the tray or from an inbox row — to somewhere this
 * build can actually navigate.
 *
 * Two rules from the contract, both of which the old implementation got wrong:
 *
 * 1. `url` and `content` are independent. The previous guard was
 *    `if (pathname && typeof params === 'object')`, which threw away a perfectly good
 *    path whenever `content` was missing and sent the user to the home tab. The backend
 *    now always sends `{}`, but that only hides the bug — an uncatalogued type would
 *    still lose its destination.
 * 2. An unknown `url` opens the notification centre, never `/`. Types ship server-side
 *    before the build that handles them, so forward-compatibility is the client's job,
 *    and the home tab is silent about the fact that anything happened at all.
 *
 * A `/` target is additionally rewritten to `/(tabs)` — see `NOTIFICATION_HOME_ROUTE`
 * for why the bare path cannot be trusted to land on the home tab.
 */
export const resolveNotificationTarget = (data: INotificationData): INotificationTarget => {
    const params = toRouteParams(data.content);
    const isRoutable = !!data.url && isKnownNotificationRoute(data.url);

    return {
        pathname: isRoutable ? toNavigableRoute(data.url as string) : NOTIFICATION_FALLBACK_ROUTE,
        // Params belong to the destination that was asked for. Carrying a ticket id onto
        // the notification centre would at best be ignored and at worst rehydrate a
        // screen with the wrong entity.
        params: isRoutable ? params : {},
        notificationId: data.notificationId,
        isFallback: !isRoutable,
    };
};
