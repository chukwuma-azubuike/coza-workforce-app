import React from 'react';
import { AppStateContext } from '../../App';
import Utils from '@utils/index';

export const useAuth = () => {
    const { setIsLoggedIn } = React.useContext(AppStateContext);

    const logOut = () => {
        Utils.clearCurrentUserStorage().then(res => {
            Utils.clearStorage().then(res => {
                setIsLoggedIn && setIsLoggedIn(false);
                Utils.removeUserSession();
            });
        });
    };

    return {
        logOut,
    };
};
