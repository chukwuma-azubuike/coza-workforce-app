import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { NOTIFICATION_CATEGORY, NOTIFICATION_CHANNEL, NOTIFICATION_PRIORITY } from '~/constants/notification-channels';
import ROAST_COPY from '~/constants/roast-copy';
import { IScheduledRecord } from '~/store/actions/roast-engagement';
import { REMINDER_STATUS } from '~/store/types';

/**
 * Local notification scheduling for Roast — the primitives, and the budget that keeps
 * them honest.
 *
 * ## The constraint
 *
 * iOS allows an app **64 pending local notifications**. Past that it silently drops them:
 * no error, no rejected promise, no callback, nothing in a Sentry breadcrumb. A worker
 * with eighty upcoming reminders who schedules naively loses twenty of them and never
 * finds out — and neither do we. That is the worst failure mode in this feature, because
 * it produces *silence* rather than a bug report.
 *
 * So the app never schedules more than it is allowed to, keeps the **nearest** ones, and
 * re-tops-up the tail as the head fires.
 *
 * ## Why a ledger
 *
 * `getAllScheduledNotificationsAsync()` can say what is pending, but not what each one was
 * scheduled *for* — comparing a pending notification against a reminder whose `dueAt`
 * moved needs the value it was scheduled with. The ledger in the persisted slice holds
 * that, keyed by reminder id, and `diffSchedules` is a pure function of it.
 */

/** iOS's hard cap on pending local notifications, per app. */
export const IOS_PENDING_LIMIT = 64;

/**
 * Held back for the streak at-risk warning and for headroom.
 *
 * Four rather than one because the at-risk warning is rescheduled daily, and a transient
 * overlap between the outgoing and incoming schedule must not be what pushes the app over
 * the cliff.
 */
export const RESERVED_SLOTS = 4;

/** What reminders may actually consume. */
export const REMINDER_BUDGET = IOS_PENDING_LIMIT - RESERVED_SLOTS;

/**
 * Every Roast-owned local notification carries this prefix.
 *
 * It is what makes the logout teardown possible: cancel by prefix, and a schedule added
 * later cannot be forgotten by a teardown written earlier.
 */
export const ROAST_IDENTIFIER_PREFIX = 'roast-';

/**
 * Deterministic, so a duplicate schedule *replaces* rather than stacks, and a full re-sync
 * after a reinstall is idempotent.
 */
export const identifierFor = (reminderId: string): string => `${ROAST_IDENTIFIER_PREFIX}reminder:${reminderId}`;

/** The at-risk warning, keyed by the local date it is warning about. */
export const streakRiskIdentifierFor = (localDate: string): string =>
    `${ROAST_IDENTIFIER_PREFIX}streak-risk:${localDate}`;

/**
 * The iOS action category for a reminder. Registered once at launch by
 * `NotificationsProvider`; named on the content so the tray shows the two buttons.
 */
export const ROAST_REMINDER_ACTION_CATEGORY = 'ROAST_REMINDER';

export const ROAST_ACTION = {
    MARK_DONE: 'MARK_DONE',
    SNOOZE_1H: 'SNOOZE_1H',
} as const;

/** The subset of a reminder the scheduler needs. Keeps the pure function testable. */
export interface ISchedulableReminder {
    _id: string;
    guestId: string;
    guestFirstName?: string;
    note: string;
    dueAt: string;
    status: REMINDER_STATUS;
}

export interface IScheduleDiff {
    /** Reminders to hand to the OS. Includes reschedules — see `toCancel`. */
    toSchedule: ISchedulableReminder[];
    /** Reminder ids to cancel. A rescheduled reminder appears here *and* above. */
    toCancel: string[];
    /** How many eligible reminders did not fit the budget. Surfaced for observability. */
    dropped: number;
}

/**
 * Works out what the OS should be holding, given what it is holding and what the server
 * says exists.
 *
 * Pure, and deliberately so: this is the one place in the feature where a bug is invisible
 * at runtime, so it has to be the one place that is trivially testable without a device.
 *
 * The rules, in order:
 *
 * 1. Only `UPCOMING` reminders still in the future are eligible. A reminder whose time has
 *    passed is not rescheduled — the OS already fired it, or the app was closed through it
 *    and firing it late would be a lie about when it was due.
 * 2. Sort ascending and keep the first `budget`. **The nearest, never the furthest.** The
 *    next hour matters more than next month, and the tail is re-topped-up as the head
 *    fires, so nothing is lost — only deferred.
 * 3. A ledger entry whose `dueAt` no longer matches is cancelled *and* rescheduled, never
 *    replaced in place. Expo's replace semantics vary by platform and version; a cancel
 *    followed by a schedule does not.
 */
export const diffSchedules = ({
    reminders,
    ledger,
    now,
    budget = REMINDER_BUDGET,
}: {
    reminders: ISchedulableReminder[];
    ledger: Record<string, IScheduledRecord>;
    now: number;
    budget?: number;
}): IScheduleDiff => {
    const eligible = reminders
        .filter(reminder => reminder.status === REMINDER_STATUS.UPCOMING && Date.parse(reminder.dueAt) > now)
        .sort((a, b) => Date.parse(a.dueAt) - Date.parse(b.dueAt));

    const keep = eligible.slice(0, Math.max(0, budget));
    const keepById = new Map(keep.map(reminder => [reminder._id, reminder]));

    const toSchedule = keep.filter(reminder => ledger[reminder._id]?.dueAt !== reminder.dueAt);

    const toCancel = Object.keys(ledger).filter(reminderId => {
        const kept = keepById.get(reminderId);

        // Gone, completed, past, or squeezed out of the budget by something nearer.
        if (!kept) {
            return true;
        }

        // Still wanted, but at a different time.
        return ledger[reminderId]?.dueAt !== kept.dueAt;
    });

    return { toSchedule, toCancel, dropped: eligible.length - keep.length };
};

/** Whether the OS will actually deliver anything we schedule. */
export const canScheduleNotifications = async (): Promise<boolean> => {
    try {
        const { granted } = await Notifications.getPermissionsAsync();
        return granted;
    } catch {
        return false;
    }
};

/**
 * Schedules one reminder.
 *
 * Returns the identifier Expo assigned, or `null` when the OS refused — which it does
 * silently past the cap, so a caller must treat `null` as "not scheduled" rather than
 * assuming success.
 */
export const scheduleReminder = async (reminder: ISchedulableReminder): Promise<string | null> => {
    const copy = ROAST_COPY.reminder(reminder.guestFirstName ?? 'Your guest', reminder.note);

    try {
        return await Notifications.scheduleNotificationAsync({
            identifier: identifierFor(reminder._id),
            content: {
                title: copy.title,
                body: copy.body,
                categoryIdentifier: ROAST_REMINDER_ACTION_CATEGORY,
                data: {
                    type: 'ROAST_REMINDER_DUE',
                    category: NOTIFICATION_CATEGORY.ROAST_REMINDER,
                    priority: NOTIFICATION_PRIORITY.HIGH,
                    // Routed by `useNotificationObserver` like any push — this hook does
                    // not navigate. The reminder id rides along so the profile can scroll
                    // to and highlight the row it came from.
                    url: '/roast-crm/guests/profile',
                    content: { _id: reminder.guestId, reminderId: reminder._id, focus: 'call' },
                    reminderId: reminder._id,
                },
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: new Date(reminder.dueAt),
                ...(Platform.OS === 'android' ? { channelId: NOTIFICATION_CHANNEL.ROAST_REMINDERS } : {}),
            },
        });
    } catch {
        // A schedule we could not make is a notification the worker does not get. It must
        // never be a crash, and the next reconcile tries again.
        return null;
    }
};

/**
 * The streak at-risk warning.
 *
 * Scheduled with the day count the streak *will* be — see the caller in `use-streak.ts`.
 * A count baked in a day early is off by one on the day it fires.
 */
export const scheduleStreakRisk = async ({
    localDate,
    at,
    days,
}: {
    localDate: string;
    at: Date;
    days: number;
}): Promise<string | null> => {
    const copy = ROAST_COPY.streak.atRisk(days);

    try {
        return await Notifications.scheduleNotificationAsync({
            identifier: streakRiskIdentifierFor(localDate),
            content: {
                title: copy.title,
                body: copy.body,
                data: {
                    type: 'ROAST_STREAK_AT_RISK',
                    category: NOTIFICATION_CATEGORY.ROAST_STREAK,
                    priority: NOTIFICATION_PRIORITY.LOW,
                    url: '/roast-crm/streak',
                    content: {},
                },
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: at,
                ...(Platform.OS === 'android' ? { channelId: NOTIFICATION_CHANNEL.ROAST_STREAK } : {}),
            },
        });
    } catch {
        return null;
    }
};

export const cancelNotification = async (identifier: string): Promise<void> => {
    try {
        await Notifications.cancelScheduledNotificationAsync(identifier);
    } catch {
        // Cancelling something already fired, or already gone, is not a failure.
    }
};

/**
 * Cancels every Roast-owned schedule on the device.
 *
 * Part of the logout teardown, and the reason every identifier carries a common prefix:
 * leaving these scheduled means the next person on a shared campus handset gets a
 * stranger's guest names on their lock screen, hours after that stranger signed out.
 *
 * Cancels **by prefix rather than by ledger**, because the ledger is exactly the thing
 * being wiped, and a schedule the ledger had already lost track of is precisely the one
 * that would otherwise survive.
 */
export const cancelAllRoastNotifications = async (): Promise<void> => {
    try {
        const scheduled = await Notifications.getAllScheduledNotificationsAsync();

        await Promise.all(
            scheduled
                .filter(request => request.identifier?.startsWith(ROAST_IDENTIFIER_PREFIX))
                .map(request => cancelNotification(request.identifier))
        );
    } catch {
        // Best effort. A teardown that throws must not block sign-out.
    }
};

/**
 * Registers the tray actions.
 *
 * `opensAppToForeground: false` is honoured on iOS, which completes the reminder without
 * ever showing the app. Android ignores it and launches — `D-8` accepts that for v1 and
 * defers the native `BroadcastReceiver` to v1.1, which is also when the widget's own
 * completion path lands and can share it.
 */
export const setUpRoastNotificationCategories = async (): Promise<void> => {
    try {
        await Notifications.setNotificationCategoryAsync(ROAST_REMINDER_ACTION_CATEGORY, [
            {
                identifier: ROAST_ACTION.MARK_DONE,
                buttonTitle: 'Mark done',
                options: { opensAppToForeground: false },
            },
            {
                identifier: ROAST_ACTION.SNOOZE_1H,
                buttonTitle: 'Snooze 1h',
                options: { opensAppToForeground: false },
            },
        ]);
    } catch {
        // Without the category the notification still arrives and still routes on tap; it
        // just loses its two buttons. Not worth failing a launch over.
    }
};
