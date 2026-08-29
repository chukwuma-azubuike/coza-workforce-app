import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '~/store/hooks';
import { userSelectors } from '~/store/actions/users';
import { roastEngagementActions, roastEngagementSelectors } from '~/store/actions/roast-engagement';
import { useGetStreakQuery } from '~/store/services/roast-engagement';
import {
    cancelNotification,
    canScheduleNotifications,
    scheduleStreakRisk,
    streakRiskIdentifierFor,
} from '~/utils/local-notifications';
import { localDateOf, localTimezone, streakRiskTimeFor, tomorrowLocalDate } from './use-local-date';

/**
 * The streak, and the local notification that warns it is about to end.
 *
 * The streak arithmetic itself is entirely server-side (ADR-003) — a device clock is not
 * a trustworthy input to a number the worker cares about, and two handsets sharing an
 * account would otherwise disagree. This hook caches what the server said and owns the one
 * piece that has to be local: the 15:00 warning, which must fire whether or not the phone
 * has a network that afternoon.
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
     * Re-points the at-risk warning at the right day.
     *
     * Three rules, all from US-4.2:
     *
     * 1. **Today's warning is cancelled the moment today's ping lands.** That cancel is
     *    what makes the 15:00 warning correct for a worker who engaged at 06:00 and then
     *    lost signal for the rest of the day — without it, the warning fires anyway and
     *    tells them they are about to lose a streak they already secured.
     * 2. **Nothing is scheduled when `current` is 0.** There is nothing to lose, and a
     *    warning about a streak that does not exist is pure noise.
     * 3. **Tomorrow's is scheduled with `current + 1`**, which is what the streak *will* be
     *    on the day it fires. Baking in today's count would be off by one exactly when the
     *    worker reads it.
     */
    const syncAtRiskNotification = useCallback(async () => {
        if (!isAuthenticated || !streak) {
            return;
        }

        const today = localDateOf();
        const engagedToday = lastPingLocalDate === today;

        if (engagedToday) {
            await cancelNotification(streakRiskIdentifierFor(today));
        }

        if (streak.current === 0) {
            return;
        }

        if (!(await canScheduleNotifications())) {
            return;
        }

        const tomorrow = tomorrowLocalDate();

        await scheduleStreakRisk({
            localDate: tomorrow,
            at: streakRiskTimeFor(tomorrow),
            days: streak.current + 1,
        });

        // Today's, too, when the day is still unclaimed and 15:00 has not passed. The
        // identifier is deterministic, so re-scheduling it is a replace rather than a
        // second warning.
        if (!engagedToday) {
            const at = streakRiskTimeFor(today);

            if (at.getTime() > Date.now()) {
                await scheduleStreakRisk({ localDate: today, at, days: streak.current + 1 });
            }
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
