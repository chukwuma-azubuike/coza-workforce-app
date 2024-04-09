import React from 'react';
import useAppColorMode from '@hooks/theme/colorMode';
import { Image, View, ViewProps } from 'react-native';
import { ActivityIndicator } from 'react-native';
import VStackComponent from '@components/layout/v-stack';
import CenterComponent from '@components/layout/center';

const logoWhite = require('@assets/images/COZA-Logo-white.png');
const logoBlack = require('@assets/images/COZA-Logo-black.png');

interface ILoadingProps extends ViewProps {
    bootUp?: boolean;
}

const Loading: React.FC<ILoadingProps> = ({ bootUp, ...props }) => {
    const { isLightMode } = useAppColorMode();

    return (
        <View style={{ flex: 1, display: 'flex', justifyContent: 'center' }} {...props}>
            <VStackComponent style={{ justifyContent: 'center' }}>
                {bootUp ? (
                    <CenterComponent>
                        <Image alt="startuplogo" source={isLightMode ? logoBlack : logoWhite} />
                    </CenterComponent>
                ) : (
                    <ActivityIndicator />
                )}
            </VStackComponent>
        </View>
    );
};

export default React.memo(Loading);
