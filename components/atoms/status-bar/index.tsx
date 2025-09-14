import React, { useRef } from 'react';
import { Animated, Platform, SafeAreaView as RNSafeAreaView, View } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';
import { Text } from '~/components/ui/text';
import { cn } from '~/lib/utils';
import { SafeAreaView } from 'react-native-safe-area-context';

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

    const isAndroid = Platform.OS === 'android';

    const SafeAreaComp = isAndroid ? SafeAreaView : RNSafeAreaView;

    return (
        <Animated.View
            style={{
                position: 'absolute',
                width: '100%',
                zIndex: 9999,
                opacity,
            }}
        >
            <SafeAreaComp className={cn(netInfo.isInternetReachable ? 'bg-green-500' : 'bg-destructive')}>
                <View className="fkex-1 pb-2">
                    <Text className="text-center absolute bottom-0 w-full !text-base text-white">{`${
                        netInfo.isInternetReachable ? 'Connected' : 'No internet connection'
                    }`}</Text>
                </View>
            </SafeAreaComp>
        </Animated.View>
    );
};

export default React.memo(ConnectionStatusBar);
