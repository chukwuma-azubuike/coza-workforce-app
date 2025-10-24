import React from 'react';

import Utils from '@utils/index';
import { useAppDispatch, useAppSelector } from '~/store/hooks';
import { userActions, userSelectors } from '~/store/actions/users';
import { ThunkDispatch } from '@reduxjs/toolkit';
import { IStore } from '~/store';
import { useLogoutMutation } from '~/store/services/account';
import { useNotifications } from '../push-notifications/useNotifications';
import { Alert } from 'react-native';

export const useAuth = () => {
    const user = useAppSelector(userSelectors.selectCurrentUser);
    const { expoPushToken } = useNotifications();
    const dispatch = useAppDispatch();
    const [logoutCall, { isLoading }] = useLogoutMutation();

    const logOut = async () => {
        try {
            if (!expoPushToken) {
                return logOutfn(dispatch);
            }

            const res = await logoutCall({ expoPushToken, userId: (user?._id ?? user?.userId) as string });
            if (res.data) {
                logOutfn(dispatch);
            }
            if (res.error) {
                console.log(res.error);
                Alert.alert(
                    (res.error as any)?.error ?? (res.error as any)?.data?.message ?? 'Oops something went wrong'
                );
            }
        } catch (error) {
            Alert.alert((error as any)?.error ?? (error as any)?.data?.message ?? 'Oops something went wrong');
        }
    };

    return {
        logOut,
        isLoading,
    };
};

export const logOutfn = (dispatch: ThunkDispatch<IStore, any, any>) => {
    Utils.clearCurrentUserStorage().then(res => {
        Utils.clearStorage().then(res => {
            dispatch(userActions.clearSession());
            Utils.removeUserSession();
        });
    });
};
