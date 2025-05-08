import React from 'react';
import { useColorScheme } from '~/lib/useColorScheme';
import { ActivityIndicator, ActivityIndicatorProps, Image, View, ViewProps } from 'react-native';

const logoWhite = require('@assets/images/COZA-Logo-white.png');
const logoBlack = require('@assets/images/COZA-Logo-black.png');

interface ILoadingProps extends ViewProps {
    bootUp?: boolean;
    spinnerProps?: ActivityIndicatorProps;
}

const Loading: React.FC<ILoadingProps> = ({ bootUp, spinnerProps, ...props }) => {
    const { isLightColorScheme } = useColorScheme();

    return (
        <View {...props}>
            <View className="justify-center flex-1">
                {bootUp ? (
                    <View>
                        <Image alt="startuplogo" source={isLightColorScheme ? logoBlack : logoWhite} />
                    </View>
                ) : (
                    <ActivityIndicator {...spinnerProps} />
                )}
            </View>
        </View>
    );
};

export default React.memo(Loading);
