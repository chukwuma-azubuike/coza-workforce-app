import React from 'react';
import Utils from '@utils/index';

const useUserSession = () => {
    const [isLoggedIn, setIsLoggedIn] = React.useState<boolean>();

    React.useEffect(() => {
        Utils.retrieveUserSession().then(res => {
            if (res) setIsLoggedIn(true);
            else setIsLoggedIn(false);
        });
    }, [isLoggedIn]);

    return { isLoggedIn, setIsLoggedIn };
};

export default useUserSession;
