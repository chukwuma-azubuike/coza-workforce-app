import React from 'react';
import { Center, Image, Spinner, VStack } from 'native-base';
import useAppColorMode from '../../../hooks/theme/colorMode';
const logoWhite = require('../../../assets/images/COZA-Logo-white.png');
const logoBlack = require('../../../assets/images/COZA-Logo-black.png');

const Loading = ({ bootUp }: { bootUp?: boolean }) => {
    const { isLightMode } = useAppColorMode();

    return (
        <Center flex={1} justifyContent="center">
            <VStack justifyContent="center">
                {bootUp ? (
                    <Image alt="startuplogo" source={isLightMode ? logoBlack : logoWhite} />
                ) : (
                    <Spinner color="primary.600" fontSize="6xl" boxSize="xl" size="lg" />
                )}
            </VStack>
        </Center>
    );
};

export default Loading;
