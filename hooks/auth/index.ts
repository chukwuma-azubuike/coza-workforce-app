import Utils from '@utils/index';
import { useAppDispatch, useAppSelector } from '~/store/hooks';
import { userActions, userSelectors } from '~/store/actions/users';
import { modalActions } from '~/store/actions/modal';
import { notificationActions } from '~/store/actions/notifications';
import { ThunkDispatch } from '@reduxjs/toolkit';
import { IStore } from '~/store';
import { ILogoutPayload } from '~/store/types';
import { useLogoutMutation } from '~/store/services/account';
import { useNotifications } from '../push-notifications/useNotifications';
import { getDeviceId } from '~/utils/device';
import { roastEngagementActions } from '~/store/actions/roast-engagement';
import { cancelAllRoastNotifications } from '~/utils/local-notifications';
import { clearWidgetSnapshot } from '~/utils/widget-bridge';

export const useAuth = () => {
    const user = useAppSelector(userSelectors.selectCurrentUser);
    const { expoPushToken } = useNotifications();
    const dispatch = useAppDispatch();
    const [logoutCall, { isLoading }] = useLogoutMutation();

    /**
     * Deleting the device row is what stops the next person to sign in on a shared
     * campus phone from receiving the previous user's notifications — permission
     * decisions, ticket details and report contents all arrive in the body.
     *
     * So the call is unconditional wherever a delete key exists, and the local
     * sign-out happens either way: a failed network call must never leave someone
     * stranded in a session they asked to leave.
     */
    const logOut = async () => {
        try {
            const userId = (user?._id ?? user?.userId) as string | undefined;

            // Safe to await inline because `getDeviceId` resolves to null rather than
            // throwing — a device id we cannot read must not cost us the token-only
            // logout we could still have made.
            const deviceId = await getDeviceId();

            const payload: ILogoutPayload | null = !userId
                ? null
                : deviceId
                  ? { userId, deviceId, ...(expoPushToken ? { expoPushToken } : {}) }
                  : expoPushToken
                    ? { userId, expoPushToken }
                    : null;

            if (payload) {
                await logoutCall(payload).unwrap();
            }
        } catch (error) {
            // The row is deleted server-side or it is not; either way the user asked to
            // sign out. Swallow rather than surface — a logout that appears to fail is
            // worse than one that quietly leaves a row for the next sign-in to claim.
            // `.unwrap()` is deliberate: without it an RTK Query error resolves normally
            // and this branch becomes unreachable dead code.
        } finally {
            logOutfn(dispatch);
        }
    };

    return {
        logOut,
        isLoading,
    };
};

export const logOutfn = (dispatch: ThunkDispatch<IStore, any, any>) => {
    // Nothing from the previous session should survive on screen.
    dispatch(modalActions.clear());

    /**
     * Roast reminders are scheduled on the *device*, not sent from the server, so deleting
     * the device row above does nothing to them: without this they keep firing for hours
     * after sign-out, putting a stranger's guest names on the lock screen of a shared
     * campus handset. Cancelled by identifier prefix, so a schedule this teardown has
     * never heard of is still caught.
     *
     * The widget snapshot is the same leak on a different surface, and is *overwritten*
     * rather than deleted — a deleted snapshot leaves the widget rendering its last frame
     * with nothing to trigger a redraw.
     *
     * Both are fire-and-forget: neither may delay or block the sign-out the user asked for.
     */
    cancelAllRoastNotifications();
    clearWidgetSnapshot();

    // Persisted, and holds guest names in `cachedFeed` plus the scheduler's ledger. Left
    // alone it rehydrates into the next person's session on this handset.
    dispatch(roastEngagementActions.reset());

    // The notifications slice is persisted, so without this the previous user's push
    // token rehydrates into the next session on the same handset and becomes the
    // delete key for someone else's logout.
    dispatch(notificationActions.reset());

    Utils.clearCurrentUserStorage().then(_res => {
        Utils.clearStorage().then(_res => {
            dispatch(userActions.clearSession());
            Utils.removeUserSession();
        });
    });
};
