import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '~/store/hooks';
import { userSelectors } from '~/store/actions/users';
import { notificationActions, notificationSelectors } from '~/store/actions/notifications';
import { useGetUnreadCountQuery } from '~/store/services/notification';

/**
 * The unread count for the bell, from one place.
 *
 * Two things move this number and they disagree by design: the payload `badge` on an
 * arriving push (fast, but absent on `LOW` notifications and suppressed entirely during
 * quiet hours, so it drifts low), and this endpoint (authoritative, but only as fresh as
 * the last fetch). Rather than have callers pick, both write into the persisted slice and
 * every consumer reads it — so a bell rendered in two places can never show two numbers.
 *
 * The server value wins whenever it arrives, which is on mount, on focus and on
 * reconnect. Between those, a push badge keeps it moving.
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
