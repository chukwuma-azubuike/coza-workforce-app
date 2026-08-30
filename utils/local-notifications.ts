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
 * Held back for the streak at-risk warnings and for headroom.
 *
 * The ceiling is four: today's two passes and tomorrow's, at 16:00 and 19:00 each. Six
 * rather than four because the warnings are rescheduled daily, and a transient overlap
 * between the outgoing and incoming schedule must not be what pushes the app over the
 * cliff — reserving exactly the ceiling reserves nothing.
 *
 * Whatever overflows does **not** land on the streak warnings. It lands on reminders, and
 * they are dropped in the silence described above.
 */
export const RESERVED_SLOTS = 6;

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

/**
 * An at-risk warning, keyed by the local date it warns about **and the hour it fires**.
 *
 * The hour is not decoration. There are two passes a day now, and deterministic
 * identifiers — which are load-bearing everywhere else in this module, because they make a
 * duplicate schedule a replace rather than a stack — would otherwise have the evening pass
 * silently overwrite the afternoon one.
 */
export const streakRiskIdentifierFor = (localDate: string, hour: number): string =>
    `${ROAST_IDENTIFIER_PREFIX}streak-risk:${localDate}@${hour}`;

/**
 * The identifier a build before the two-pass change would have used.
 *
 * Kept so the upgrade can clean up after itself, and it must be, because this change ships
 * over the air. A device that has already reconciled is holding a pending
 * `roast-streak-risk:2026-08-30` scheduled for 15:00. Once updated, the app cancels the
 * `@16` and `@19` keys and nothing anywhere cancels that one — including the ping-cancel
 * path, whose entire job is to stop warning a worker who has already engaged.
 *
 * Left to itself it fires once per upgraded device, at the wrong hour, quite possibly to
 * somebody who engaged that morning. That is precisely the failure the reschedule exists
 * to prevent.
 *
 * Cancelling an identifier that is not there is already a no-op, so this stays harmless on
 * a clean install and costs nothing to keep indefinitely — cheaper than a date gate that
 * would itself need removing later.
 */
export const legacyStreakRiskIdentifierFor = (localDate: string): string =>
    `${ROAST_IDENTIFIER_PREFIX}streak-risk:${localDate}`;

/**
 * The action category for a reminder whose guest has **no** number on record.
 *
 * Registered once at launch by `NotificationsProvider`; named on the content so the tray
 * shows the buttons when the notification is expanded.
 */
export const ROAST_REMINDER_ACTION_CATEGORY = 'ROAST_REMINDER';

/**
 * The same, plus Call / WhatsApp / Text.
 *
 * A second category rather than a conditional inside one, because a category is
 * registered once for the whole app and a notification only names it — there is no way to
 * hide a button per-notification. Offering "Call" on a guest captured without a phone
 * number would dial nothing, so the choice has to be made at schedule time, and that
 * means two categories.
 */
export const ROAST_REMINDER_CONTACT_CATEGORY = 'ROAST_REMINDER_CONTACT';

export const ROAST_ACTION = {
    MARK_DONE: 'MARK_DONE',
    SNOOZE_1H: 'SNOOZE_1H',
    CALL: 'CALL',
    WHATSAPP: 'WHATSAPP',
    TEXT: 'TEXT',
} as const;

/** The subset of a reminder the scheduler needs. Keeps the pure function testable. */
export interface ISchedulableReminder {
    _id: string;
    guestId: string;
    guestFirstName?: string;
    /**
     * Baked into the notification so the tray's Call / WhatsApp / Text work with the app
     * cold. Looking it up when the button is pressed would mean a network read inside the
     * few seconds the OS gives a launched-from-notification app, on the one path where
     * the worker is already holding the phone to their ear.
     */
    guestPhoneNumber?: string;
    note: string;
    dueAt: string;
    status: REMINDER_STATUS;
}

/**
 * Everything about a reminder that ends up *inside* the scheduled notification.
 *
 * The ledger stores this rather than only `dueAt`, because the guest's name and number
 * arrive from a different query than the reminder does and routinely land **after** the
 * first schedule was made. Diffing on `dueAt` alone means that first version — no name,
 * no contact buttons — is the one the worker gets, permanently: the time never changed,
 * so nothing ever reschedules it. Editing a note had the same problem.
 *
 * An entry written by a build that predates this returns `undefined` and therefore
 * mismatches, which reschedules it once on upgrade. That is the intent.
 */
export const contentKeyFor = (reminder: ISchedulableReminder): string =>
    [reminder.dueAt, reminder.guestFirstName ?? '', reminder.guestPhoneNumber ?? '', reminder.note].join('|');

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
 * 3. A ledger entry whose **content key** no longer matches is cancelled *and* rescheduled,
 *    never replaced in place. Expo's replace semantics vary by platform and version; a
 *    cancel followed by a schedule does not. See `contentKeyFor` for why the comparison is
 *    not simply `dueAt`.
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

    const toSchedule = keep.filter(reminder => ledger[reminder._id]?.contentKey !== contentKeyFor(reminder));

    const toCancel = Object.keys(ledger).filter(reminderId => {
        const kept = keepById.get(reminderId);

        // Gone, completed, past, or squeezed out of the budget by something nearer.
        if (!kept) {
            return true;
        }

        // Still wanted, but at a different time — or with different words, a name that
        // has since resolved, or a number that has since been added to the guest.
        return ledger[reminderId]?.contentKey !== contentKeyFor(kept);
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
                categoryIdentifier: reminder.guestPhoneNumber
                    ? ROAST_REMINDER_CONTACT_CATEGORY
                    : ROAST_REMINDER_ACTION_CATEGORY,
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
                    guestId: reminder.guestId,
                    // The tray's Call / WhatsApp / Text read this. Carried on the payload
                    // rather than resolved on press: the button can be hit with the app
                    // dead, and a cold launch has no guest cache to look it up in.
                    phoneNumber: reminder.guestPhoneNumber,
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
 * A streak at-risk warning.
 *
 * Scheduled with the day count the streak *will* be — see the caller in `use-streak.ts`.
 * A count baked in a day early is off by one on the day it fires.
 *
 * `isFinalPass` picks the copy rather than the hour doing it, because the hours live in
 * `use-local-date.ts` and this module is imported *by* that side of the tree. It also
 * keeps the decision where it belongs: the last pass is the last pass whatever hour it is
 * moved to.
 */
export const scheduleStreakRisk = async ({
    localDate,
    hour,
    at,
    days,
    isFinalPass,
}: {
    localDate: string;
    hour: number;
    at: Date;
    days: number;
    isFinalPass: boolean;
}): Promise<string | null> => {
    const copy = isFinalPass ? ROAST_COPY.streak.atRiskFinal(days) : ROAST_COPY.streak.atRisk(days);

    try {
        return await Notifications.scheduleNotificationAsync({
            identifier: streakRiskIdentifierFor(localDate, hour),
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
 * Completing and snoozing run **without** showing the app.
 *
 * `opensAppToForeground: false` is honoured on iOS. Android ignores it and launches —
 * `D-8` accepts that for v1 and defers the native `BroadcastReceiver` to v1.1, which is
 * also when the widget's own completion path lands and can share it.
 */
const MARK_DONE_ACTION: Notifications.NotificationAction = {
    identifier: ROAST_ACTION.MARK_DONE,
    buttonTitle: 'Mark done',
    options: { opensAppToForeground: false },
};

const SNOOZE_ACTION: Notifications.NotificationAction = {
    identifier: ROAST_ACTION.SNOOZE_1H,
    buttonTitle: 'Snooze 1h',
    options: { opensAppToForeground: false },
};

/**
 * Contacting the guest **must** foreground the app.
 *
 * Opening `tel:` / `wa.me` / `sms:` is a foreground-only operation on both platforms: a
 * background action extension has no window to hand the URL to, and `Linking.openURL`
 * from one either throws or silently does nothing. So these three say so, rather than
 * looking like they work and quietly dropping the call.
 */
const CALL_ACTION: Notifications.NotificationAction = {
    identifier: ROAST_ACTION.CALL,
    buttonTitle: 'Call',
    options: { opensAppToForeground: true },
};

const WHATSAPP_ACTION: Notifications.NotificationAction = {
    identifier: ROAST_ACTION.WHATSAPP,
    buttonTitle: 'WhatsApp',
    options: { opensAppToForeground: true },
};

const TEXT_ACTION: Notifications.NotificationAction = {
    identifier: ROAST_ACTION.TEXT,
    buttonTitle: 'Text',
    options: { opensAppToForeground: true },
};

/**
 * Registers the tray actions.
 *
 * ⚠️ **Order is the design here, because both platforms truncate.** Android's standard
 * notification template renders the **first three** actions and drops the rest; iOS shows
 * the **first four** when the notification is expanded. Reaching the guest is the reason
 * the reminder exists and is the thing that has no in-app shortcut worth the taps, so the
 * three contact actions lead. Mark done and Snooze survive the cut on iOS and remain a tap
 * away everywhere else — the reminder row, the Today feed, and the home-screen widget.
 *
 * Re-ordering this array is the whole of the change if that trade-off ever looks wrong.
 */
export const setUpRoastNotificationCategories = async (): Promise<void> => {
    try {
        await Promise.all([
            Notifications.setNotificationCategoryAsync(ROAST_REMINDER_ACTION_CATEGORY, [
                MARK_DONE_ACTION,
                SNOOZE_ACTION,
            ]),
            Notifications.setNotificationCategoryAsync(ROAST_REMINDER_CONTACT_CATEGORY, [
                CALL_ACTION,
                WHATSAPP_ACTION,
                TEXT_ACTION,
                MARK_DONE_ACTION,
                SNOOZE_ACTION,
            ]),
        ]);
    } catch {
        // Without the category the notification still arrives and still routes on tap; it
        // just loses its buttons. Not worth failing a launch over.
    }
};
