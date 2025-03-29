import React from 'react';
import { Platform } from 'react-native';

import useMediaQuery from '~/hooks/media-query';

const useDevice = () => {
    const { isMobile } = useMediaQuery();
    const isAndroidOrBelowIOSTenOrTab = React.useMemo(() => Platform.OS === 'android' || !isMobile, [isMobile]);
    const isIOS = Platform.OS === 'ios';

    return {
        isIOS,
        isAndroidOrBelowIOSTenOrTab,
    };
};

export default useDevice;
