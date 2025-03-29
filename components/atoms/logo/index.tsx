import React from 'react';
import { Image } from 'react-native';
import useAppColorMode from '@hooks/theme/colorMode';
const logoWhite = require('@assets/images/COZA-Logo-white.png');
const logoBlack = require('@assets/images/COZA-Logo-black.png');

const Logo: React.FC = () => {
    const { isLightMode } = useAppColorMode();

    return <Image source={isLightMode ? logoBlack : logoWhite} />;
};

export default React.memo(Logo);
