import dayjs from 'dayjs';

/**
 * The day, and the zone, **as the device reckons them**.
 *
 * Kept in one place because every consumer has to agree: the engagement ping credits a
 * day by this string, the at-risk notification is keyed by it, and the streak's whole
 * definition of "consecutive" is built on it. Two callers formatting it two ways is a
 * streak that breaks for reasons nobody can reproduce.
 */

/** `YYYY-MM-DD` in the device's own calendar. */
export const localDateOf = (date: Date | number = Date.now()): string => dayjs(date).format('YYYY-MM-DD');

/**
 * The device's IANA zone, e.g. `Africa/Lagos`.
 *
 * Falls back to `UTC` rather than throwing: `Intl` is present on both platforms in this
 * SDK, but a ping that fails because a zone could not be read is a day the worker loses.
 */
export const localTimezone = (): string => {
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    } catch {
        return 'UTC';
    }
};

/**
 * The hours the streak warning fires — 16:00 and 19:00 local.
 *
 * Two passes rather than one because they catch different people: the afternoon one
 * catches the worker who has not engaged all day, the evening one catches the worker who
 * meant to and did not. The evening pass is the last thing anybody hears before the
 * streak goes, which is why it gets its own copy rather than repeating the afternoon's.
 *
 * **Not user-configurable, and deliberately not offered as a setting.** This is a deadline
 * warning, and a deadline whose warning the worker can move is not much of a warning. The
 * two *digest* hours next to it on the settings screen are configurable; these are not,
 * and the distinction is the point.
 *
 * Ordered, and read in order — the array is the schedule.
 */
export const STREAK_AT_RISK_HOURS = [16, 19] as const;

/** The given local hour on the given local date, as an instant. */
export const streakRiskTimeFor = (localDate: string, hour: number): Date =>
    dayjs(localDate).hour(hour).minute(0).second(0).millisecond(0).toDate();

/**
 * Whether a local hour falls inside a quiet-hours window.
 *
 * **The window wraps midnight, and the wrapping case is the common one** — 22:00 → 07:00
 * is what most people set. The obvious predicate (`hour >= start && hour < end`) reports
 * 23:00 as *outside* a 22→07 window, so a check written that way stays silent on exactly
 * the configurations that need warning and fires on the ones that do not.
 *
 * `start === end` is an empty window rather than a 24-hour one, matching the server: a
 * worker who has somehow set both to the same hour is not silenced all day.
 *
 * Advisory only. The server does not reject a digest hour inside quiet hours and neither
 * does the UI — rejecting it would make the order in which the two settings are edited
 * matter, which is worse than the thing it prevents.
 */
export const isWithinQuietHours = (hour: number, start: number, end: number): boolean =>
    start === end ? false : start < end ? hour >= start && hour < end : hour >= start || hour < end;

/** Tomorrow's local date, relative to the device's calendar. */
export const tomorrowLocalDate = (from: Date | number = Date.now()): string =>
    dayjs(from).add(1, 'day').format('YYYY-MM-DD');
