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
