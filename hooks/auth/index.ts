import React from 'react';

import Utils from '@utils/index';
import { useAppDispatch } from '~/store/hooks';
import { userActions } from '~/store/actions/users';

export const useAuth = () => {
    const dispatch = useAppDispatch();

    const logOut = () => {
        Utils.clearCurrentUserStorage().then(res => {
            Utils.clearStorage().then(res => {
                dispatch(userActions.clearSession());
                Utils.removeUserSession();
            });
        });
    };

    return {
        logOut,
    };
};
