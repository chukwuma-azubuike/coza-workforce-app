import useMediaQuery from '@hooks/media-query';
import isIphoneLessThanTen from '@utils/isIPhoneLessThanTen';
import React from 'react';
import { Platform } from 'react-native';

const useDevice = () => {
    const { isMobile } = useMediaQuery();
    const isAndroidOrBelowIOSTenOrTab = React.useMemo(
        () => Platform.OS === 'android' || isIphoneLessThanTen() || !isMobile,
        [isMobile]
    );

    return {
        isAndroidOrBelowIOSTenOrTab,
    };
};

export default useDevice;
