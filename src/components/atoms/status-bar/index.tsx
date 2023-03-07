import React, { useRef } from 'react';
import { Animated } from 'react-native';
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
                    duration: 5000,
                    useNativeDriver: true,
                }).start();
            }, 2000);
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
            <Box bg={netInfo.isInternetReachable ? 'success.500' : 'error.500'} w="full">
                <Text textAlign="center" w="full" color="white">{`${
                    netInfo.isInternetReachable ? 'Connected' : 'No internet connection'
                }`}</Text>
            </Box>
        </Animated.View>
    );
};

export default ConnectionStatusBar;
