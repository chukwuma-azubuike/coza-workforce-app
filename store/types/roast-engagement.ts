import { ID } from './roast-crm';

/**
 * The Roast engagement system's wire types.
 *
 * ⚠️ **Written against the live API, not against the design doc.** Where the two
 * disagreed, the server won — see the notes on `ENGAGEMENT_SOURCE`, `IEngagementPing`
 * and `IRoastReminder` in particular. Verified against
 * `coza-app-evangeleon/src/build/docs/swagger.json` and the service implementations
 * behind it.
 *
 * Kept out of `roast-crm.ts` (712 lines, and the CRM domain) because these describe a
 * different service surface with a different cache lifetime — `03_MOBILE_SPEC.md §2`.
 */

/* -------------------------------------------------------------------------- */
/* Task feed                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * What a task *is*. The server decides; the client renders.
 *
 * `REMINDER` is the worker's own, set on a guest profile. Everything else is the
 * system's opinion, produced by the detection queries in `taskFeed.service.ts`.
 */
export enum ROAST_TASK_KIND {
    REMINDER = 'REMINDER',
    CALL_DUE = 'CALL_DUE',
    FOLLOW_UP = 'FOLLOW_UP',
    INVITE = 'INVITE',
    NOTE = 'NOTE',
    PROGRESS = 'PROGRESS',
}

/**
 * The only two kinds `POST /tasks/:id/dismiss` accepts.
 *
 * A `CALL_DUE` row disappears when the call is logged, not when it is waved away — so
 * the swipe-to-dismiss affordance must not be offered on one, or the gesture fails with
 * a 400 the user cannot act on.
 */
export const DISMISSIBLE_TASK_KINDS: ROAST_TASK_KIND[] = [ROAST_TASK_KIND.NOTE, ROAST_TASK_KIND.PROGRESS];

/**
 * One row in the Task Feed — the shared spine of the whole feature.
 *
 * `title` and `subtitle` arrive **already composed**. The alternative, a client that
 * renders a sentence from a `kind` and a guest object, means the push body and the in-app
 * row are two implementations of the same sentence and they drift.
 */
export interface RoastTask {
    /**
     * A **composite** id — `note:652b7d4f…`, `call_due:652b…` — not a document id.
     *
     * It is what `/tasks/:id/dismiss` takes, and it is why a task id must never be used
     * to fetch a guest or a reminder directly. `guestId` and `reminderId` are the real
     * keys.
     */
    _id: string;
    kind: ROAST_TASK_KIND;
    guestId?: ID;
    /** First name only, and **absent entirely** when `hideGuestNames` is on (`D-10`). */
    guestFirstName?: string;
    title: string;
    subtitle?: string;
    /** ISO instant. Sorts the feed. */
    dueAt: string;
    isOverdue: boolean;
    /** An expo-router path with query params, already in `KNOWN_NOTIFICATION_ROUTES`. */
    deepLink: string;
    /** Present on `REMINDER` rows only — the key for completing it. */
    reminderId?: ID;
    completedAt?: string | null;
}

export interface ITaskCounts {
    due: number;
    overdue: number;
    total: number;
}

export interface ITodayTasks {
    tasks: RoastTask[];
    counts: ITaskCounts;
    generatedAt: string;
    timezone: string;
    localDate: string;
}

export interface ITodayTasksQuery {
    tz: string;
    /** How far ahead to look. Server defaults to the end of the local day. */
    horizonHours?: number;
    /** Comma-separated `ROAST_TASK_KIND` values. */
    kind?: string;
}

/* -------------------------------------------------------------------------- */
/* Reminders                                                                   */
/* -------------------------------------------------------------------------- */

export enum REMINDER_STATUS {
    UPCOMING = 'UPCOMING',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}

export enum REMINDER_COMPLETED_VIA {
    APP = 'APP',
    NOTIFICATION = 'NOTIFICATION',
    WIDGET = 'WIDGET',
}

/** Server-enforced. `PATCH /reminders/:id/snooze` 400s at this count. */
export const MAX_SNOOZE_COUNT = 10;

/** Server-enforced `maxlength` on `note`. */
export const REMINDER_NOTE_MAX_LENGTH = 280;

/**
 * The server's tolerance for a `dueAt` that has just passed, in seconds.
 *
 * It covers clock skew and round-trip latency, so the client must validate against the
 * *same* grace or a time the user picked legitimately gets rejected on arrival.
 */
export const REMINDER_DUE_AT_GRACE_SECONDS = 60;

/**
 * A reminder as the API returns it.
 *
 * ⚠️ **No guest name.** The server returns the raw document and there is no populate —
 * so a row, a list and a locally scheduled notification all have to resolve the name
 * from the guests cache themselves. Promising a denormalised `guestFirstName` here would
 * render `undefined` in a notification body, on a lock screen, with the app closed.
 */
export interface IRoastReminder {
    _id: ID;
    userId: ID;
    guestId: ID;
    campusId?: ID;
    /** ≤ 280 chars. The worker's own words — rendered verbatim in the notification body. */
    note: string;
    /** UTC instant. */
    dueAt: string;
    /** IANA zone as at creation, so the time still displays correctly after travel. */
    timezone: string;
    status: REMINDER_STATUS;
    completedAt?: string | null;
    completedVia?: REMINDER_COMPLETED_VIA | null;
    /**
     * The original `dueAt` before the first snooze.
     *
     * Kept because a reminder snoozed eleven times is a signal — either the task is not
     * real or the worker is stuck — and a UI that silently rewrites `dueAt` destroys it.
     */
    snoozedFrom?: string | null;
    snoozeCount: number;
    /** Echoed back from the create header; present only on rows the outbox created. */
    idempotencyKey?: string | null;
    /** Soft-delete marker. A row carrying one arrives as a tombstone in `/reminders/sync`. */
    deletedAt?: string | null;
    createdAt: string;
    updatedAt?: string;
}

export interface ICreateReminderPayload {
    guestId: ID;
    dueAt: string;
    note: string;
    timezone: string;
    /**
     * The client's temp id, sent as an `Idempotency-Key` **header**, not in the body.
     *
     * A reminder created offline and flushed twice by the outbox must not become two
     * reminders — and the outbox retries by design, so this is not optional. The server
     * returns the original with **200** rather than 201 on a repeat, so a 200 here means
     * "already existed", not "created".
     */
    idempotencyKey?: string;
}

export interface IUpdateReminderPayload {
    _id: ID;
    dueAt?: string;
    note?: string;
}

export interface IRemindersQuery {
    /** Comma-separated `REMINDER_STATUS` values. Omit for every status. */
    status?: string;
    guestId?: ID;
    page?: number;
    limit?: number;
}

/**
 * The scheduler's input: one call that tells a device everything that changed.
 *
 * `tombstones` is the half that is easy to omit and impossible to work around — a client
 * that only ever receives live rows can never learn to cancel the local notification for
 * a reminder somebody deleted on another device. It carries **cancelled** rows too, not
 * just deleted ones.
 */
export interface IReminderSync {
    upserts: IRoastReminder[];
    tombstones: ID[];
    serverTime: string;
}

export interface IReminderSyncQuery {
    /** Omit on a first sync to receive everything. */
    since?: string;
    deviceId?: string;
    platform?: 'ios' | 'android';
    timezone?: string;
    /**
     * The furthest-future reminder this device actually scheduled.
     *
     * Reported so the server can tell "no device is going to fire this locally" from "a
     * device has it covered" — the v1.1 stale-device fallback reads it. Sending the wrong
     * value here does not break anything today; sending none disables that fallback.
     */
    scheduledThroughAt?: string;
}

/* -------------------------------------------------------------------------- */
/* Engagement & streaks                                                        */
/* -------------------------------------------------------------------------- */

export enum ENGAGEMENT_SOURCE {
    APP_FOREGROUND = 'APP_FOREGROUND',
    QUALIFYING_ACTION = 'QUALIFYING_ACTION',
}

export enum QUALIFYING_ACTION_KIND {
    TIMELINE = 'TIMELINE',
    REMINDER_COMPLETED = 'REMINDER_COMPLETED',
    STAGE_CHANGE = 'STAGE_CHANGE',
    GUEST_CAPTURED = 'GUEST_CAPTURED',
}

/** Nested, not flattened — the server reads `qualifyingAction.kind`. */
export interface IQualifyingAction {
    kind: QUALIFYING_ACTION_KIND;
    refId?: ID;
    /** ISO. Defaults server-side to arrival time; send it so an outbox flush is honest. */
    at?: string;
}

export interface IEngagementPing {
    /**
     * `YYYY-MM-DD` **as the device reckoned it**, not as the server infers it on arrival.
     *
     * This is the field that makes an offline day count: a worker who engages at 22:00
     * with no signal and reconnects at 07:00 the next morning must be credited for
     * yesterday. The server validates the shape and falls back to its own view of the
     * client's zone if it is malformed, so a wrong value is silently ignored rather than
     * rejected — send it correctly or not at all.
     */
    localDate: string;
    timezone: string;
    source: ENGAGEMENT_SOURCE;
    qualifyingAction?: IQualifyingAction;
}

/**
 * The whole streak, returned by `POST /engagement/ping` as well as `GET /streaks/me`.
 *
 * The ping returning the full state is deliberate — the caller never needs a follow-up
 * `GET`, the same economy `markNotificationsRead` already uses in the Workforce inbox.
 */
export interface IStreakState {
    current: number;
    longest: number;
    /** Live streak, nothing logged today, past 15:00 local. */
    isAtRisk: boolean;
    freezesBanked: number;
    freezesSpent: number;
    lastEngagedLocalDate: string | null;
    /** Every milestone already awarded, so the UI never re-celebrates one. */
    milestonesAwarded: number[];
    /**
     * Stays true until `POST /streaks/me/acknowledge-reset`, so a reset that happened
     * while the app was closed is still shown on the next open (US-4.3).
     */
    wasReset: boolean;
    /** A freeze was spent on *this* transition — drives the "streak saved" card. */
    freezeSpent: boolean;
    /** Non-null only on the transition that crossed it. */
    milestoneReached: number | null;
    localDate: string;
    timezone: string;
}

export interface IStreakDay {
    localDate: string;
    engaged: boolean;
    actions: number;
}

export interface IStreakHistory {
    from: string;
    to: string;
    timezone: string;
    /** Every date in the range, engaged or not — the heatmap needs the gaps. */
    days: IStreakDay[];
}

/* -------------------------------------------------------------------------- */
/* Preferences                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Roast notification preferences, created with defaults on first read.
 *
 * There is deliberately **no `reminders` toggle** on the wire: a custom reminder is
 * something the worker asked for at a named minute, and a global switch that silently
 * swallows it is a bug report waiting to happen. Deleting the reminder is the disable
 * action.
 */
export interface IRoastNotificationPrefs {
    callDue: boolean;
    followUp: boolean;
    invite: boolean;
    note: boolean;
    progress: boolean;
    streak: boolean;
    /** `D-10` — swaps every push body to a count, hiding guest names on lock screens. */
    hideGuestNames: boolean;
    /** US-1.2's configurable N. 1–90. */
    followUpThresholdDays: number;
    quietHoursEnabled: boolean;
    /** Local hour, 0–23. */
    quietHoursStart: number;
    quietHoursEnd: number;
    timezone: string;
}

/**
 * A field-level rejection, as `ResponseClass.sendValidationErrorResponse` shapes it.
 *
 * The `errors` map is keyed by field name and is what US-2.1's "blocked with a clear
 * inline message" renders — surfacing `message` alone turns an inline hint into a banner.
 */
export interface IRoastValidationError {
    status: number;
    message: string;
    isError: true;
    isSuccessful: false;
    errors: Record<string, string>;
}
