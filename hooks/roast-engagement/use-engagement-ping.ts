import { useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '~/store/hooks';
import { userSelectors } from '~/store/actions/users';
import { roastEngagementActions, roastEngagementSelectors } from '~/store/actions/roast-engagement';
import { usePingEngagementMutation } from '~/store/services/roast-engagement';
import { ENGAGEMENT_SOURCE, IEngagementPing, QUALIFYING_ACTION_KIND } from '~/store/types';
import { localDateOf, localTimezone } from './use-local-date';
import useAppForeground from './use-app-foreground';

/**
 * Tells the server the worker showed up today.
 *
 * Two triggers:
 *
 * - **Foreground**, at most once per local day. `D-1` sets v1's bar at opening the app,
 *   which is deliberately low — the point of a streak is to be winnable — but the ping
 *   records qualifying actions alongside it from day one, so v1.5 can raise the bar using
 *   real data rather than a guess.
 * - **After a qualifying action** — a timeline note, a completed reminder, a stage change,
 *   a guest captured. These are cheap and idempotent server-side (the unique index on
 *   `{userId, localDate}` is the guard), so they fire and forget.
 *
 * `localDate` travels *with* the ping rather than being inferred from arrival time. That
 * is the whole reason an offline day still counts: a worker who engages at 22:00 with no
 * signal and reconnects at 07:00 the next morning must be credited for **yesterday**.
 */
const useEngagementPingCore = () => {
    const dispatch = useAppDispatch();
    const user = useAppSelector(userSelectors.selectCurrentUser);
    const isAuthenticated = !!(user?.userId ?? user?._id);
    const lastPingLocalDate = useAppSelector(roastEngagementSelectors.selectLastPingLocalDate);
    const [pingEngagement] = usePingEngagementMutation();

    const lastPingRef = useRef(lastPingLocalDate);
    lastPingRef.current = lastPingLocalDate;

    const ping = useCallback(
        async (source: ENGAGEMENT_SOURCE, kind?: QUALIFYING_ACTION_KIND, refId?: string) => {
            if (!isAuthenticated) {
                return;
            }

            const localDate = localDateOf();

            const payload: IEngagementPing = {
                localDate,
                timezone: localTimezone(),
                source,
                // Nested, not flattened. The server reads `qualifyingAction.kind` — a
                // top-level `refId` is silently discarded, which is the worst shape of
                // bug here because the ping still succeeds and the day still counts.
                ...(kind
                    ? {
                          qualifyingAction: {
                              kind,
                              at: new Date().toISOString(),
                              ...(refId ? { refId } : {}),
                          },
                      }
                    : {}),
            };

            try {
                const streak = await pingEngagement(payload).unwrap();

                // Cached so the streak header renders instantly on the next cold start
                // rather than popping in a second late, and so the at-risk scheduler has a
                // day count to work from with no network.
                dispatch(roastEngagementActions.setStreak(streak));
                dispatch(roastEngagementActions.setLastPingLocalDate(localDate));
            } catch {
                // Deliberately not queued in the outbox.
                //
                // A ping is a claim about a specific local date, and the foreground ping
                // repeats on every launch — so the next time the app opens with a network,
                // that day is claimed anyway. An outbox entry would only add a second
                // write of a value the unique index already deduplicates. Action pings are
                // different in intent but not in effect: the action itself is already
                // queued, and the day is credited when it lands.
            }
        },
        [dispatch, isAuthenticated, pingEngagement]
    );

    /**
     * The once-a-day foreground ping.
     *
     * Guarded on the *local date*, not a timestamp: the question is "has this calendar day
     * been claimed", and a device that crosses midnight while backgrounded must ping again
     * on return even though only minutes have passed.
     */
    const pingIfNewDay = useCallback(() => {
        if (lastPingRef.current === localDateOf()) {
            return;
        }

        ping(ENGAGEMENT_SOURCE.APP_FOREGROUND);
    }, [ping]);

    /** Call after anything in `QUALIFYING_ACTION_KIND`. Cheap, idempotent, fire-and-forget. */
    const pingAction = useCallback(
        (kind: QUALIFYING_ACTION_KIND, refId?: string) => ping(ENGAGEMENT_SOURCE.QUALIFYING_ACTION, kind, refId),
        [ping]
    );

    return { ping, pingAction, pingIfNewDay };
};

/**
 * The foreground half. **Mounted exactly once**, by `useRoastEngagement`.
 *
 * Split from `usePingAction` so a screen can report an action without also installing a
 * second `AppState` listener. The day guard would make the extra ping harmless, but every
 * mounted copy is another listener and another network call on every return to the app,
 * for no additional information.
 */
const useEngagementPing = () => {
    const { ping, pingAction, pingIfNewDay } = useEngagementPingCore();

    useAppForeground(pingIfNewDay);

    return { ping, pingAction };
};

/**
 * The action half, for screens.
 *
 * Installs no listeners: call `pingAction` after a timeline note, a completed reminder, a
 * stage change or a captured guest, and nothing else happens.
 */
export const usePingAction = () => {
    const { pingAction } = useEngagementPingCore();

    return { pingAction };
};

export default useEngagementPing;
