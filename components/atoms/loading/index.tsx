import React from 'react';
import { useColorScheme } from '~/lib/useColorScheme';
import { ActivityIndicator, ActivityIndicatorProps, Image, View, ViewProps } from 'react-native';
import { cn } from '~/lib/utils';

const logoWhite = require('@assets/images/COZA-Logo-white.png');
const logoBlack = require('@assets/images/COZA-Logo-black.png');

interface ILoadingProps extends ViewProps {
    bootUp?: boolean;
    cover?: boolean;
    spinnerProps?: ActivityIndicatorProps;
}

const Loading: React.FC<ILoadingProps> = ({ bootUp, spinnerProps, cover, ...props }) => {
    const { isLightColorScheme } = useColorScheme();

    return (
        <View className={cn(cover && 'flex-1')} {...props}>
            <View className="justify-center flex-1">
                {bootUp ? (
                    <View>
                        <Image alt="startuplogo" source={isLightColorScheme ? logoBlack : logoWhite} />
                    </View>
                ) : (
                    <ActivityIndicator {...spinnerProps} className={cn('text-foreground', cover && 'mx-auto')} />
                )}
            </View>
        </View>
    );
};

export default React.memo(Loading);
