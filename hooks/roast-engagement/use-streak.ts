import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '~/store/hooks';
import { userSelectors } from '~/store/actions/users';
import { roastEngagementActions, roastEngagementSelectors } from '~/store/actions/roast-engagement';
import { useGetStreakQuery } from '~/store/services/roast-engagement';
import {
    cancelNotification,
    canScheduleNotifications,
    legacyStreakRiskIdentifierFor,
    scheduleStreakRisk,
    streakRiskIdentifierFor,
} from '~/utils/local-notifications';
import {
    STREAK_AT_RISK_HOURS,
    localDateOf,
    localTimezone,
    streakRiskTimeFor,
    tomorrowLocalDate,
} from './use-local-date';

/** The last pass of the day, which gets the last-call copy rather than the afternoon's. */
const FINAL_PASS_HOUR = STREAK_AT_RISK_HOURS[STREAK_AT_RISK_HOURS.length - 1];

/**
 * The streak, and the local notification that warns it is about to end.
 *
 * The streak arithmetic itself is entirely server-side (ADR-003) — a device clock is not
 * a trustworthy input to a number the worker cares about, and two handsets sharing an
 * account would otherwise disagree. This hook caches what the server said and owns the one
 * piece that has to be local: the at-risk warnings, which must fire whether or not the
 * phone has a network that day.
 */
const useStreak = () => {
    const dispatch = useAppDispatch();
    const user = useAppSelector(userSelectors.selectCurrentUser);
    const isAuthenticated = !!(user?.userId ?? user?._id);

    const cached = useAppSelector(roastEngagementSelectors.selectStreak);
    const lastPingLocalDate = useAppSelector(roastEngagementSelectors.selectLastPingLocalDate);

    const { data: remote, isLoading } = useGetStreakQuery({ tz: localTimezone() }, { skip: !isAuthenticated });

    // The remote value wins the moment it arrives; the cache exists to fill the gap before
    // it does, so the header does not render a zero and then jump.
    const streak = remote ?? cached;

    useEffect(() => {
        if (remote) {
            dispatch(roastEngagementActions.setStreak(remote));
        }
    }, [dispatch, remote]);

    /**
     * Re-points the at-risk warnings at the right day.
     *
     * Four rules, the first three from US-4.2:
     *
     * 1. **Today's warnings are cancelled the moment today's ping lands** — *both* of
     *    them. That cancel is what keeps the warnings correct for a worker who engaged at
     *    06:00 and then lost signal for the rest of the day; without it they fire anyway
     *    and announce the loss of a streak that was secured hours earlier. Missing one of
     *    the two is the same bug, half the time.
     * 2. **Nothing is scheduled when `current` is 0.** There is nothing to lose, and a
     *    warning about a streak that does not exist is pure noise.
     * 3. **Tomorrow's are scheduled with `current + 1`**, which is what the streak *will*
     *    be on the day they fire. Baking in today's count would be off by one exactly when
     *    the worker reads it.
     * 4. **The pre-two-pass identifier is swept every time.** See
     *    `legacyStreakRiskIdentifierFor` — this change ships over the air onto devices
     *    already holding a 15:00 warning under a key nothing else here can see, and that
     *    warning is unreachable by rule 1.
     */
    const syncAtRiskNotification = useCallback(async () => {
        if (!isAuthenticated || !streak) {
            return;
        }

        const today = localDateOf();
        const tomorrow = tomorrowLocalDate();
        const engagedToday = lastPingLocalDate === today;

        // Rule 4, and unconditional on purpose: it has to happen for a worker whose streak
        // is 0 and who therefore returns early below, and for one who has already engaged.
        await Promise.all([today, tomorrow].map(date => cancelNotification(legacyStreakRiskIdentifierFor(date))));

        if (engagedToday) {
            await Promise.all(
                STREAK_AT_RISK_HOURS.map(hour => cancelNotification(streakRiskIdentifierFor(today, hour)))
            );
        }

        if (streak.current === 0) {
            return;
        }

        if (!(await canScheduleNotifications())) {
            return;
        }

        const days = streak.current + 1;

        await Promise.all(
            STREAK_AT_RISK_HOURS.map(hour =>
                scheduleStreakRisk({
                    localDate: tomorrow,
                    hour,
                    at: streakRiskTimeFor(tomorrow, hour),
                    days,
                    isFinalPass: hour === FINAL_PASS_HOUR,
                })
            )
        );

        // Today's, too, for each pass the day is still unclaimed and the hour has not
        // passed. The identifiers are deterministic, so re-scheduling is a replace rather
        // than a second warning — and the hour is part of the key, so the evening pass no
        // longer overwrites the afternoon one.
        if (!engagedToday) {
            await Promise.all(
                STREAK_AT_RISK_HOURS.map(async hour => {
                    const at = streakRiskTimeFor(today, hour);

                    if (at.getTime() <= Date.now()) {
                        return;
                    }

                    await scheduleStreakRisk({
                        localDate: today,
                        hour,
                        at,
                        days,
                        isFinalPass: hour === FINAL_PASS_HOUR,
                    });
                })
            );
        }
    }, [isAuthenticated, lastPingLocalDate, streak]);

    useEffect(() => {
        syncAtRiskNotification();
    }, [syncAtRiskNotification]);

    return {
        streak,
        isLoading: isLoading && !cached,
        /** True only when the server says so — never derived from a device clock. */
        isAtRisk: !!streak?.isAtRisk,
        syncAtRiskNotification,
    };
};

export default useStreak;
