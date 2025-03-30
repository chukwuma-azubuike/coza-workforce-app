import React, { useRef } from 'react';
import { Animated, SafeAreaView, View } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';
import { Text } from '~/components/ui/text';
import { cn } from '~/lib/utils';

const ConnectionStatusBar: React.FC = () => {
    const netInfo = useNetInfo();

    const opacity = useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        if (netInfo.isInternetReachable) {
            Animated.timing(opacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
            setTimeout(() => {
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 2000,
                    useNativeDriver: true,
                }).start();
            }, 1000);
        }
        if (!netInfo.isInternetReachable) {
            Animated.timing(opacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [netInfo.isInternetReachable]);

    return (
        <Animated.View
            style={{
                position: 'absolute',
                width: '100%',
                zIndex: 9999,
                opacity,
            }}
        >
            <SafeAreaView className={cn(netInfo.isInternetReachable ? 'bg-green-500' : 'bg-destructive')}>
                <View className={cn('flex-1 w-full h-max pb-4')}>
                    <Text className="text-center w-full !text-base text-white">{`${
                        netInfo.isInternetReachable ? 'Connected' : 'No internet connection'
                    }`}</Text>
                </View>
            </SafeAreaView>
        </Animated.View>
    );
};

export default React.memo(ConnectionStatusBar);
