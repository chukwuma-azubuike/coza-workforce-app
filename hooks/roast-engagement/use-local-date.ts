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
 * The hour the streak warning fires — 15:00 local, per US-4.2.
 *
 * Late enough that a worker who simply has not started yet is not nagged, early enough to
 * leave most of an evening to act on it.
 */
export const STREAK_AT_RISK_HOUR = 15;

/** 15:00 local on the given local date, as an instant. */
export const streakRiskTimeFor = (localDate: string): Date =>
    dayjs(localDate).hour(STREAK_AT_RISK_HOUR).minute(0).second(0).millisecond(0).toDate();

/** Tomorrow's local date, relative to the device's calendar. */
export const tomorrowLocalDate = (from: Date | number = Date.now()): string =>
    dayjs(from).add(1, 'day').format('YYYY-MM-DD');
