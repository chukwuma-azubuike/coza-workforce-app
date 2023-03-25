import React from 'react';
import { Center, ICenterProps, Image, Spinner, VStack } from 'native-base';
import useAppColorMode from '../../../hooks/theme/colorMode';
const logoWhite = require('../../../assets/images/COZA-Logo-white.png');
const logoBlack = require('../../../assets/images/COZA-Logo-black.png');

interface ILoadingProps extends ICenterProps {
    bootUp?: boolean;
}

const Loading: React.FC<ILoadingProps> = ({ bootUp, ...props }) => {
    const { isLightMode } = useAppColorMode();

    return (
        <Center justifyContent="center" h={!bootUp ? 10 : 'full'} w={!bootUp ? 10 : 'full'} {...props}>
            <VStack justifyContent="center">
                {bootUp ? (
                    <Image alt="startuplogo" source={isLightMode ? logoBlack : logoWhite} />
                ) : (
                    <Spinner color="primary.500" fontSize="6xl" boxSize="xl" size="lg" />
                )}
            </VStack>
        </Center>
    );
};

export default Loading;
