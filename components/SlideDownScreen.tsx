import React, { useEffect, useCallback } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, runOnJS } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { SpringConfig } from 'react-native-reanimated/lib/typescript/animation/springUtils';

const { height } = Dimensions.get('window');

const DEFAULT_SPRING: SpringConfig = {
    stiffness: 120,
    damping: 20,
    mass: 1,
    // duration: 500,
    overshootClamping: false,
    restDisplacementThreshold: 0.001,
    restSpeedThreshold: 0.001,
} as any;

type Props = {
    children: React.ReactNode;
    onExit?: () => void; // optional callback to navigate away
};

export default function SlideDownScreen({ children, onExit }: Props) {
    const router = useRouter();

    const translateY = useSharedValue(-height);
    const opacity = useSharedValue(0);

    useEffect(() => {
        translateY.value = withSpring(0, DEFAULT_SPRING);
        opacity.value = withTiming(1, { duration: 500 });
    }, []);

    const runExitAnimation = useCallback(() => {
        translateY.value = withSpring(-height, DEFAULT_SPRING, finished => {
            if (finished) {
                runOnJS(() => {
                    if (onExit) onExit();
                    else router.back(); // fallback to default back navigation
                })();
            }
        });
        opacity.value = withTiming(0, { duration: 120 });
    }, [router, onExit]);

    const style = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
        opacity: opacity.value,
    }));

    return (
        <Animated.View style={[styles.container, style]}>
            {/* pass down runExitAnimation to child via context or props if you need */}
            {children}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
});
