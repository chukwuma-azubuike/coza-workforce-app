import React, { useEffect } from 'react';
import { Dimensions, Image, Text, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Circle, Defs, Line, Pattern, Rect } from 'react-native-svg';

const logoColored = require('@assets/images/coza-coloured-logo.png');

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

function GeometricPattern({ dark }: { dark: boolean }) {
    const dotColor = dark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.12)';
    const lineColor = dark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.08)';

    return (
        <Svg width={SCREEN_W} height={SCREEN_H} style={{ position: 'absolute' }}>
            <Defs>
                <Pattern id="dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                    <Circle cx="20" cy="20" r="1.5" fill={dotColor} />
                </Pattern>
                <Pattern id="grid" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                    <Line x1="0" y1="0" x2="80" y2="0" stroke={lineColor} strokeWidth="0.5" />
                    <Line x1="0" y1="0" x2="0" y2="80" stroke={lineColor} strokeWidth="0.5" />
                </Pattern>
            </Defs>
            <Rect width={SCREEN_W} height={SCREEN_H} fill="url(#grid)" />
            <Rect width={SCREEN_W} height={SCREEN_H} fill="url(#dots)" />
        </Svg>
    );
}

function OrbBlob({ cx, cy, r, color, delay }: { cx: number; cy: number; r: number; color: string; delay: number }) {
    const opacity = useSharedValue(0.18);

    useEffect(() => {
        opacity.value = withDelay(
            delay,
            withRepeat(
                withSequence(
                    withTiming(0.35, { duration: 2800, easing: Easing.inOut(Easing.sin) }),
                    withTiming(0.18, { duration: 2800, easing: Easing.inOut(Easing.sin) })
                ),
                -1,
                true
            )
        );
    }, []);

    const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

    return (
        <Animated.View
            style={[
                {
                    position: 'absolute',
                    left: cx - r,
                    top: cy - r,
                    width: r * 2,
                    height: r * 2,
                    borderRadius: r,
                    backgroundColor: color,
                },
                style,
            ]}
        />
    );
}

const BootScreen: React.FC<{ isDark: boolean; animated?: boolean }> = ({ isDark, animated = true }) => {
    const logoOpacity = useSharedValue(animated ? 0 : 1);
    const logoScale = useSharedValue(animated ? 0.82 : 1);
    const taglineOpacity = useSharedValue(animated ? 0 : 1);

    useEffect(() => {
        if (!animated) return;
        logoOpacity.value = withDelay(300, withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) }));
        logoScale.value = withDelay(300, withTiming(1, { duration: 700, easing: Easing.out(Easing.back(1.4)) }));
        taglineOpacity.value = withDelay(900, withTiming(1, { duration: 600 }));
    }, []);

    const logoStyle = useAnimatedStyle(() => ({
        opacity: logoOpacity.value,
        transform: [{ scale: logoScale.value }],
    }));
    const taglineStyle = useAnimatedStyle(() => ({ opacity: taglineOpacity.value }));

    const gradientColors = isDark
        ? (['#0D001A', '#2D0060', '#1A003A'] as const)
        : (['#3A006F', '#6200BE', '#4A007A'] as const);

    return (
        <View style={{ flex: 1, position: 'relative' }}>
            <LinearGradient
                colors={gradientColors as [string, string, string]}
                start={{ x: 0.1, y: 0 }}
                end={{ x: 0.9, y: 1 }}
                style={{ flex: 1 }}
            >
                <GeometricPattern dark={isDark} />

                <OrbBlob cx={SCREEN_W * 0.15} cy={SCREEN_H * 0.12} r={130} color="#9B30FF" delay={0} />
                <OrbBlob cx={SCREEN_W * 0.85} cy={SCREEN_H * 0.25} r={100} color="#6200BE" delay={600} />
                <OrbBlob cx={SCREEN_W * 0.1} cy={SCREEN_H * 0.78} r={110} color="#7B00E0" delay={1200} />
                <OrbBlob cx={SCREEN_W * 0.88} cy={SCREEN_H * 0.82} r={140} color="#4A0090" delay={300} />

                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <Animated.View style={logoStyle}>
                        <Image
                            alt="COZA logo"
                            source={logoColored}
                            style={{ width: 100, height: 100 }}
                            resizeMode="contain"
                        />
                    </Animated.View>

                    {/* <Animated.View style={taglineStyle}>
                        <Text
                            style={{
                                color: '#FFF',
                                fontSize: 18,
                                letterSpacing: 5,
                                textTransform: 'uppercase',
                                marginTop: 20,
                                fontWeight: '200',
                            }}
                        >
                            Workforce
                        </Text>
                    </Animated.View> */}
                </View>

                <Animated.View
                    style={[
                        taglineStyle,
                        {
                            position: 'absolute',
                            bottom: 48,
                            alignSelf: 'center',
                            alignItems: 'center',
                            gap: 6,
                        },
                    ]}
                >
                    <View
                        style={{
                            width: 32,
                            height: 2,
                            borderRadius: 1,
                            backgroundColor: 'rgba(255,255,255,0.3)',
                        }}
                    />
                </Animated.View>
            </LinearGradient>
        </View>
    );
};

export default BootScreen;
