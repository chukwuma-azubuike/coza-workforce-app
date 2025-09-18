import React, { useEffect } from 'react';
import { StyleSheet, ViewStyle, Pressable, StyleProp, GestureResponderEvent } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';

type Props = {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    onPress?: (e: GestureResponderEvent) => void;
    /**
     * How much the card should be elevated visually when pressed.
     * On Android you can pass a number and apply elevation via style prop.
     */
    pressScale?: number;
    /**
     * Optional spring config override
     */
    springConfig?: Partial<any>;
};

const DEFAULT_SPRING: any = {
    stiffness: 140,
    damping: 14,
    mass: 0.9,
    overshootClamping: false,
    restDisplacementThreshold: 0.001,
    restSpeedThreshold: 0.001,
};

export default function SpringCard({ children, style, onPress, pressScale = 0.97, springConfig }: Props) {
    // shared values for entrance + press
    const translateY = useSharedValue(18);
    const opacity = useSharedValue(0);
    const scale = useSharedValue(1);

    const springCfg = { ...DEFAULT_SPRING, ...(springConfig ?? {}) };

    // entrance animation (mount)
    useEffect(() => {
        // translateY springs to 0, opacity fades in
        translateY.value = withSpring(0, springCfg);
        opacity.value = withTiming(1, { duration: 220 });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: translateY.value }, { scale: scale.value }],
            opacity: opacity.value,
            // subtle shadow scaling via shadowOpacity (iOS) and elevation (Android can be static)
            // shadowOpacity is read by native view; set static values in stylesheet for best cross-platform.
        };
    }, []);

    // Press handlers: scale down and spring back
    const handlePressIn = () => {
        scale.value = withSpring(pressScale, springCfg);
    };
    const handlePressOut = () => {
        scale.value = withSpring(1, springCfg);
    };

    const handlePress = (e: GestureResponderEvent) => {
        if (onPress) {
            // call JS handler
            onPress(e);
        }
    };

    return (
        <Pressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handlePress}
            style={({ pressed }) => [
                // keep Pressable's pressed styling minimal; Animated handles the visual physics
            ]}
        >
            <Animated.View style={[styles.card, style, animatedStyle]}>{children}</Animated.View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        flex: 1,
        // iOS shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        // Android elevation (not animated reliably across versions)
        elevation: 3,
    },
});
