import React from 'react';
import { Image } from 'react-native';
import { useColorScheme } from '~/lib/useColorScheme';
const logoWhite = require('~/assets/images/COZA-Logo-white.png');
const logoBlack = require('~/assets/images/COZA-Logo-black.png');

const Logo: React.FC = () => {
    const { isLightColorScheme } = useColorScheme();

    return <Image style={{ width: 120, height: 120 }} source={isLightColorScheme ? logoBlack : logoWhite} />;
};

export default React.memo(Logo);
