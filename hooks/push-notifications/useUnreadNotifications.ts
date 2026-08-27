import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '~/store/hooks';
import { userSelectors } from '~/store/actions/users';
import { notificationActions, notificationSelectors } from '~/store/actions/notifications';
import { useGetUnreadCountQuery } from '~/store/services/notification';

/** One minute — see `pollingInterval` below for why it is not tighter. */
const UNREAD_POLL_INTERVAL_MS = 60_000;

/**
 * The unread count for the bell, from one place.
 *
 * Two things move this number and they disagree by design: the payload `badge` on an
 * arriving push (fast, but absent on `LOW` notifications and suppressed entirely during
 * quiet hours, so it drifts low), and this endpoint (authoritative, but only as fresh as
 * the last fetch). Rather than have callers pick, both write into the persisted slice and
 * every consumer reads it — so a bell rendered in two places can never show two numbers.
 *
 * The server value wins whenever it arrives: on mount, on focus, on reconnect, and now
 * on a poll while the app is open. Between those, a push badge keeps it moving.
 */
const useUnreadNotifications = () => {
    const dispatch = useAppDispatch();
    const user = useAppSelector(userSelectors.selectCurrentUser);
    const unreadCount = useAppSelector(notificationSelectors.selectUnreadCount);

    const userId = (user?.userId ?? user?._id) as string | undefined;

    const { data, isLoading, refetch } = useGetUnreadCountQuery(userId as string, {
        skip: !userId,
        refetchOnFocus: true,
        refetchOnReconnect: true,

        /**
         * Focus and reconnect alone leave the bell wrong for as long as the user stays on
         * one screen — which, on a service day, is most of the morning. Three of the paths
         * that change this number never touch the app at all: a quiet-hours notification
         * writes the inbox row and suppresses the push, a `LOW` one carries no `badge` on
         * purpose, and reading a row on another device moves the count down here. Polling
         * is what closes that gap; there is no realtime channel to subscribe to.
         *
         * A minute is chosen against what the number is *for*: it decorates a bell, and
         * nobody acts on the difference between 3 and 4 unread. The request is a single
         * integer on an indexed count, so the cost is one small round trip a minute per
         * open app — and only while it is open.
         */
        pollingInterval: UNREAD_POLL_INTERVAL_MS,

        /**
         * No polling from the background. Without this the timer keeps firing while the
         * app is suspended-but-resident, spending battery and radio to refresh a bell
         * nobody is looking at — and `AppState` only reports that state to RTK Query
         * because `setupReactNativeListeners` wires it (`store/rn-listeners.ts`); under
         * the default web handler this flag has nothing to read.
         */
        skipPollingIfUnfocused: true,
    });

    useEffect(() => {
        // `!== undefined` rather than a truthiness check: zero is a real count, and the
        // one that most needs to land — it is what clears a stale badge.
        if (data !== undefined) {
            dispatch(notificationActions.setUnreadCount(data));
        }
    }, [data, dispatch]);

    return { unreadCount, isLoading, refetch };
};

export default useUnreadNotifications;
