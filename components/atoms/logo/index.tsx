import React from 'react';
import { Image } from 'react-native';
import { useColorScheme } from '~/lib/useColorScheme';
const logoWhite = require('~/assets/images/COZA-Logo-white.png');
const logoBlack = require('~/assets/images/COZA-Logo-black.png');

const Logo: React.FC = ({ size = 120 }: { size?: number }) => {
    const { isLightColorScheme } = useColorScheme();

    return <Image style={{ width: size, height: size }} source={isLightColorScheme ? logoBlack : logoWhite} />;
};

export default React.memo(Logo);
