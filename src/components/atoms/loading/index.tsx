import React from 'react';
import { Center, ICenterProps, Image, Spinner, VStack } from 'native-base';
import useAppColorMode from '../../../hooks/theme/colorMode';
import { ColorValue } from 'react-native';
const logoWhite = require('../../../assets/images/COZA-Logo-white.png');
const logoBlack = require('../../../assets/images/COZA-Logo-black.png');

interface ILoadingProps extends ICenterProps {
    bootUp?: boolean;
}

const Loading: React.FC<ILoadingProps> = ({ bootUp, color = 'primary.500', ...props }) => {
    const { isLightMode } = useAppColorMode();

    return (
        <Center justifyContent="center" h={!bootUp ? 10 : 'full'} w={!bootUp ? 10 : 'full'} {...props}>
            <VStack justifyContent="center">
                {bootUp ? (
                    <Image alt="startuplogo" source={isLightMode ? logoBlack : logoWhite} />
                ) : (
                    <Spinner color={color as ColorValue} fontSize="6xl" boxSize="xl" size="lg" />
                )}
            </VStack>
        </Center>
    );
};

export default Loading;
