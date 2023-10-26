import React, { useRef } from 'react';
import { Animated, Platform } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';
import { Box, Text } from 'native-base';

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

    const isIOS = Platform.OS === 'ios';

    return (
        <Animated.View
            style={{
                position: 'absolute',
                width: '100%',
                zIndex: 9999,
                opacity,
            }}
        >
            <Box
                w="full"
                height={isIOS ? 66 : 6}
                pb={isIOS ? undefined : 1}
                justifyContent="flex-end"
                bg={netInfo.isInternetReachable ? 'success.500' : 'error.500'}
            >
                <Text textAlign="center" w="full" fontSize="xs" color="white">{`${
                    netInfo.isInternetReachable ? 'Connected' : 'No internet connection'
                }`}</Text>
            </Box>
        </Animated.View>
    );
};

export default ConnectionStatusBar;
