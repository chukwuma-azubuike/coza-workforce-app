import React from 'react';
import { Center, ICenterProps, Image, Spinner, VStack } from 'native-base';
import useAppColorMode from '@hooks/theme/colorMode';
import { ColorValue } from 'react-native';
const logoWhite = require('@assets/images/COZA-Logo-white.png');
const logoBlack = require('@assets/images/COZA-Logo-black.png');

interface ILoadingProps extends ICenterProps {
    bootUp?: boolean;
}

const Loading: React.FC<ILoadingProps> = ({ bootUp, color = 'gray.600', ...props }) => {
    const { isLightMode } = useAppColorMode();

    return (
        <Center justifyContent="center" h="full" w="full" {...props}>
            <VStack justifyContent="center">
                {bootUp ? (
                    <Image alt="startuplogo" source={isLightMode ? logoBlack : logoWhite} />
                ) : (
                    <Spinner color={color as ColorValue} size="lg" />
                )}
            </VStack>
        </Center>
    );
};

export default React.memo(Loading);
