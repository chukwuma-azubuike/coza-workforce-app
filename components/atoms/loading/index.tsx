import React from 'react';
import { ActivityIndicator, ActivityIndicatorProps, View, ViewProps } from 'react-native';
import { cn } from '~/lib/utils';


interface ILoadingProps extends ViewProps {
    bootUp?: boolean;
    cover?: boolean;
    spinnerProps?: ActivityIndicatorProps;
}

const Loading: React.FC<ILoadingProps> = ({ spinnerProps, cover, ...props }) => {

    return (
        <View className={cn(cover && 'flex-1')} {...props}>
            <View className="justify-center flex-1">
                <ActivityIndicator
                    {...spinnerProps}
                    className={cn('text-foreground', cover && 'mx-auto', spinnerProps?.className)}
                />
            </View>
        </View>
    );
};

export default React.memo(Loading);
