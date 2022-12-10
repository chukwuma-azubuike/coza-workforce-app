import React from 'react';
import Utils from '../../utils';

const useUserSession = () => {
    const [isLoggedIn, setIsLoggedIn] = React.useState<boolean>(false);

    React.useEffect(() => {
        Utils.retrieveUserSession().then(res => {
            if (res) setIsLoggedIn(true);
            else setIsLoggedIn(false);
        });
    }, []);

    return { isLoggedIn };
};

export default useUserSession;
