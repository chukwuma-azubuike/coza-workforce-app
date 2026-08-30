import { Platform } from 'react-native';
import * as Calendar from 'expo-calendar';
import * as IntentLauncher from 'expo-intent-launcher';

/**
 * Mirroring a Roast reminder into the phone's own stores — Reminders, Calendar, Alarm.
 *
 * See `docs/roast-engagement/08_DEVICE_REMINDERS_PLAN.md` for the reasoning. The two
 * rules that everything here follows from:
 *
 * ## 1. The mirror is one-way. Always.
 *
 * Roast writes it, Roast deletes it, Roast **never reads it back**. If a worker ticks the
 * item off in Apple Reminders, nothing happens in Roast. Polling EventKit for completion
 * would mean a scheduled read of the user's entire reminders store, it cannot tell "done"
 * from "deleted", and it would make the streak — which the server owns — depend on a
 * device store we do not control. The mirror is a nudge; the reminder is the record.
 *
 * ## 2. It is best-effort, and never blocks anything.
 *
 * By the time any of this runs, the reminder itself has already been saved. A denied
 * permission, a device with no writable calendar, a revoked grant — every one of them
 * resolves to `null` and the worker keeps the notification they already had. None of them
 * is an error worth showing, because none of them lost anything.
 *
 * ⚠️ **This module is pure of React on purpose.** It is the half of the feature that can
 * be silently wrong, so it is the half that has to be readable and testable without a
 * device attached. The hooks that call it own the *when*; this owns the *what*.
 */

export enum MIRROR_PROVIDER {
    /** The iOS Reminders app. `createReminderAsync` does not exist on Android. */
    IOS_REMINDERS = 'IOS_REMINDERS',
    /** A calendar event with an alert on it. Both platforms. */
    CALENDAR = 'CALENDAR',
    /** The Android clock's alarm. See `ANDROID_ALARM_HORIZON_MS` for why it is limited. */
    ANDROID_ALARM = 'ANDROID_ALARM',
}

/**
 * What the ledger keeps per mirrored reminder. Device-local; never sent to the server.
 *
 * It describes *this handset's* state, not the reminder's — the same reason
 * `IScheduledRecord` is local. Two phones signed into one account mirror independently.
 */
export interface IMirrorRecord {
    provider: MIRROR_PROVIDER;
    /**
     * The EventKit / CalendarProvider id, for deleting it again.
     *
     * Absent for `ANDROID_ALARM`, which returns nothing identifying — see
     * `createAndroidAlarm`.
     */
    externalId?: string;
    /** Android needs this as well as the event id to delete reliably. */
    calendarId?: string;
    /** `mirrorContentKey` as at the write, so an edit is detected without reading back. */
    contentKey: string;
    /** When it was written. See `MIRROR_SETTLE_MS`. */
    createdAt: string;
}

/**
 * How long a freshly-written mirror is left alone by the reconcile.
 *
 * A mirror is created against the reminder's **real** id the moment the server returns it,
 * but the cached reminder list is still holding the optimistic row under a temporary id
 * until the refetch lands. A reconcile in that window sees a ledger entry with no matching
 * reminder and correctly concludes the reminder is gone — deleting the mirror that was
 * written a second ago.
 *
 * Two minutes is far longer than that window and far shorter than anything a worker would
 * notice, and the cost of being wrong in this direction is one stale entry until the next
 * reconcile rather than a silently lost one.
 */
export const MIRROR_SETTLE_MS = 2 * 60 * 1000;

/** Whether the reconcile is allowed to act on a record yet. */
export const hasSettled = (record: IMirrorRecord, now = Date.now()): boolean =>
    now - Date.parse(record.createdAt) > MIRROR_SETTLE_MS;

/** The subset of a reminder that ends up in the mirror. */
export interface IMirrorableReminder {
    _id: string;
    /** The guest's first name, or a neutral stand-in when names are hidden. */
    title: string;
    note: string;
    dueAt: string;
}

/**
 * How far ahead the Android alarm option is offered.
 *
 * `ACTION_SET_ALARM` takes an hour and a minute and **has no concept of a date**. A
 * one-shot alarm fires at the next occurrence of that time, so a reminder set on Wednesday
 * for Saturday 10:00 would go off on Thursday morning. Twenty-four hours is the entire
 * range over which "the next occurrence of 10:00" and "the time the worker chose" are the
 * same moment.
 */
export const ANDROID_ALARM_HORIZON_MS = 24 * 60 * 60 * 1000;

/** How long a mirrored calendar event is. Long enough to see, short enough not to block a day. */
const EVENT_DURATION_MS = 15 * 60 * 1000;

/**
 * What the mirror was written *for*.
 *
 * Compared rather than read back — see rule 1. An edit to the time or the wording changes
 * this, and the reconcile then deletes and re-creates rather than trying to patch an
 * EventKit record in place.
 */
export const mirrorContentKey = (reminder: IMirrorableReminder): string =>
    [reminder.dueAt, reminder.title, reminder.note].join('|');

/**
 * The providers worth offering, for this platform and this due time.
 *
 * Options that do not apply are **absent, not disabled**: a menu where half the entries
 * are greyed out on each platform is a menu that reads as broken.
 *
 * D-3 in the plan: iOS is offered Reminders and not Calendar. A follow-up call is a task,
 * not an appointment, and putting it on the calendar as a 15-minute event clutters the day
 * view of somebody who lives in that view. Android has no Reminders app to send it to, so
 * the calendar is the dated option there. Add `MIRROR_PROVIDER.CALENDAR` to the iOS branch
 * if that call is ever reversed — nothing else needs to change.
 */
export const availableProviders = (dueAt?: string): MIRROR_PROVIDER[] => {
    if (Platform.OS === 'ios') {
        return [MIRROR_PROVIDER.IOS_REMINDERS];
    }

    if (Platform.OS !== 'android') {
        return [];
    }

    const withinHorizon = !!dueAt && Date.parse(dueAt) - Date.now() <= ANDROID_ALARM_HORIZON_MS;

    return withinHorizon ? [MIRROR_PROVIDER.CALENDAR, MIRROR_PROVIDER.ANDROID_ALARM] : [MIRROR_PROVIDER.CALENDAR];
};

/** The label a worker sees. Kept here so the copy and the capability cannot drift apart. */
export const MIRROR_LABELS: Record<MIRROR_PROVIDER, string> = {
    [MIRROR_PROVIDER.IOS_REMINDERS]: 'Reminders',
    [MIRROR_PROVIDER.CALENDAR]: 'Calendar',
    [MIRROR_PROVIDER.ANDROID_ALARM]: 'Alarm',
};

/**
 * Asks for whatever this provider needs, and reports whether it was given.
 *
 * Called lazily — at the moment the worker first asks for a mirror, never at launch. A
 * calendar prompt on first run, from an app about guests, is the kind of thing people deny
 * on principle and then never revisit.
 *
 * The alarm needs no runtime permission at all; `SET_ALARM` is a normal manifest
 * permission and is granted at install.
 */
export const ensureMirrorPermission = async (provider: MIRROR_PROVIDER): Promise<boolean> => {
    try {
        if (provider === MIRROR_PROVIDER.ANDROID_ALARM) {
            return Platform.OS === 'android';
        }

        const { granted } =
            provider === MIRROR_PROVIDER.IOS_REMINDERS
                ? await Calendar.requestRemindersPermissionsAsync()
                : await Calendar.requestCalendarPermissionsAsync();

        return granted;
    } catch {
        return false;
    }
};

/**
 * The calendar to write events into.
 *
 * `getDefaultCalendarAsync` is iOS-only, so Android has to choose — D-4 in the plan: the
 * primary calendar if the device names one, otherwise the first that will accept a write.
 * A device with no writable calendar at all is a real state (a work profile with a
 * read-only mirrored account) and resolves to `null` rather than throwing.
 */
const writableEventCalendarId = async (): Promise<string | null> => {
    if (Platform.OS === 'ios') {
        const calendar = await Calendar.getDefaultCalendarAsync();

        return calendar?.id ?? null;
    }

    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    const writable = calendars.filter(calendar => calendar.allowsModifications);

    return (writable.find(calendar => calendar.isPrimary) ?? writable[0])?.id ?? null;
};

/**
 * An entry in the iOS Reminders app.
 *
 * `dueDate` alone puts it in the list; the **alarm** is what makes it speak up. Both are
 * set, because a reminder that appears in a list the worker was not looking at is not a
 * reminder — it is a note.
 *
 * `calendarId: null` means the user's default reminders list, which is the one their other
 * devices sync and the one they actually read.
 */
const createIosReminder = async (reminder: IMirrorableReminder): Promise<IMirrorRecord | null> => {
    const due = new Date(reminder.dueAt);

    const externalId = await Calendar.createReminderAsync(null, {
        title: `${reminder.title} — ${reminder.note}`,
        notes: reminder.note,
        dueDate: due,
        startDate: due,
        completed: false,
        alarms: [{ absoluteDate: due.toISOString() }],
    });

    return {
        provider: MIRROR_PROVIDER.IOS_REMINDERS,
        externalId,
        contentKey: mirrorContentKey(reminder),
        createdAt: new Date().toISOString(),
    };
};

/** A 15-minute event with an alert at its start. */
const createCalendarEvent = async (reminder: IMirrorableReminder): Promise<IMirrorRecord | null> => {
    const calendarId = await writableEventCalendarId();

    if (!calendarId) {
        return null;
    }

    const startDate = new Date(reminder.dueAt);

    const externalId = await Calendar.createEventAsync(calendarId, {
        title: `${reminder.title} — ${reminder.note}`,
        notes: reminder.note,
        startDate,
        endDate: new Date(startDate.getTime() + EVENT_DURATION_MS),
        alarms: [{ relativeOffset: 0 }],
    });

    return {
        provider: MIRROR_PROVIDER.CALENDAR,
        externalId,
        calendarId,
        contentKey: mirrorContentKey(reminder),
        createdAt: new Date().toISOString(),
    };
};

/**
 * An alarm in whatever clock app the device uses.
 *
 * ⚠️ **Fire-and-forget, and it cannot be undone by us.** `ACTION_SET_ALARM` returns
 * nothing identifying the alarm it created, and Android exposes no API to list or delete
 * one. So a mirrored alarm survives completing the reminder, deleting it, and signing out
 * — the worker has to dismiss it themselves. That is the whole reason this provider is
 * offered only inside a 24-hour horizon: the blast radius of something we cannot clean up
 * has to be small enough to be tomorrow's problem at worst.
 *
 * `SKIP_UI` keeps the worker in Roast instead of dropping them into the Clock app. It is
 * why `com.android.alarm.permission.SET_ALARM` is declared in `app.json`.
 */
const createAndroidAlarm = async (reminder: IMirrorableReminder): Promise<IMirrorRecord | null> => {
    const due = new Date(reminder.dueAt);

    await IntentLauncher.startActivityAsync('android.intent.action.SET_ALARM', {
        extra: {
            'android.intent.extra.alarm.HOUR': due.getHours(),
            'android.intent.extra.alarm.MINUTES': due.getMinutes(),
            'android.intent.extra.alarm.MESSAGE': `${reminder.title} — ${reminder.note}`,
            'android.intent.extra.alarm.SKIP_UI': true,
        },
    });

    // No `externalId`: there is nothing to record and nothing to delete later.
    return {
        provider: MIRROR_PROVIDER.ANDROID_ALARM,
        contentKey: mirrorContentKey(reminder),
        createdAt: new Date().toISOString(),
    };
};

/**
 * Writes one mirror. Returns the ledger record, or `null` if it could not be written.
 *
 * `null` is an ordinary outcome, not a failure to report — see rule 2 at the top.
 */
export const createMirror = async (
    provider: MIRROR_PROVIDER,
    reminder: IMirrorableReminder
): Promise<IMirrorRecord | null> => {
    try {
        if (!(await ensureMirrorPermission(provider))) {
            return null;
        }

        switch (provider) {
            case MIRROR_PROVIDER.IOS_REMINDERS:
                return Platform.OS === 'ios' ? await createIosReminder(reminder) : null;
            case MIRROR_PROVIDER.CALENDAR:
                return await createCalendarEvent(reminder);
            case MIRROR_PROVIDER.ANDROID_ALARM:
                return Platform.OS === 'android' ? await createAndroidAlarm(reminder) : null;
            default:
                return null;
        }
    } catch {
        return null;
    }
};

/**
 * Removes one mirror.
 *
 * Deleting something already gone is not a failure — the worker may well have deleted it
 * themselves, which is exactly the outcome we wanted anyway.
 */
export const deleteMirror = async (record: IMirrorRecord): Promise<void> => {
    if (!record.externalId) {
        return;
    }

    try {
        if (record.provider === MIRROR_PROVIDER.IOS_REMINDERS) {
            await Calendar.deleteReminderAsync(record.externalId);
            return;
        }

        if (record.provider === MIRROR_PROVIDER.CALENDAR) {
            await Calendar.deleteEventAsync(record.externalId);
        }
    } catch {
        // Already gone, or the grant was revoked. Neither is worth surfacing.
    }
};

/**
 * Removes every mirror this device made.
 *
 * Part of the sign-out teardown, and the reason the ledger exists at all: a mirrored
 * reminder carries a guest's name into a store that **syncs off the handset** — an iOS
 * reminder reaches the worker's Mac through iCloud, a work calendar event reaches their
 * organisation's servers. Signing out of Roast on a shared campus phone has to take those
 * with it.
 *
 * Alarms are the exception and cannot be reached; see `createAndroidAlarm`.
 */
export const deleteAllMirrors = async (records: IMirrorRecord[]): Promise<void> => {
    await Promise.all(records.map(deleteMirror));
};
