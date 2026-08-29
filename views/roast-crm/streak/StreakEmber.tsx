import React, { useEffect } from 'react';
import { View } from 'react-native';
import { BlurMask, Canvas, Circle, Group } from '@shopify/react-native-skia';
import {
    Easing,
    cancelAnimation,
    useDerivedValue,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';

import { useColorScheme } from '~/lib/useColorScheme';
import useReduceMotion from '~/hooks/roast-engagement/use-reduce-motion';

/**
 * The streak ember.
 *
 * A procedural flame in Skia rather than a Lottie loop, for one reason: this thing sits at
 * the top of a scrolling list and animates for as long as the screen is open. A Lottie
 * loop is a rasterised sequence being blitted every frame next to a virtualised list;
 * four blurred circles on a Skia canvas are four draw calls. At 60fps behind a `FlashList`
 * that difference is the whole design.
 *
 * ⚠️ **Property animations only.** Reanimated's `entering` / `exiting` / `layout` props
 * crash Android under Fabric in this app (`dispatchGetDisplayList` NPE). Everything here
 * is a shared value read through `useDerivedValue` into a Skia prop — a different
 * subsystem entirely, and safe.
 */

export type EmberState = 'healthy' | 'atRisk' | 'extinguished';

/**
 * Three states, and they are read at a glance rather than counted.
 *
 * `extinguished` is deliberately not "sad" — it is a grey outline of the same shape, so a
 * worker on day zero sees a place for something to go, not a failure notice.
 */
const PALETTE = {
    light: {
        healthy: { glow: '#F59E0B', body: '#FB923C', core: '#FDE68A' },
        atRisk: { glow: '#A16207', body: '#B45309', core: '#FCD34D' },
    },
    // The amber blooms on a dark background — the glow reads as a halo rather than a
    // flame — so the dark variants step down in saturation rather than in lightness.
    dark: {
        healthy: { glow: '#D97706', body: '#F97316', core: '#FDE68A' },
        atRisk: { glow: '#78350F', body: '#92400E', core: '#FBBF24' },
    },
} as const;

const EXTINGUISHED = '#9CA3AF';

export const emberStateFor = (current: number, isAtRisk: boolean): EmberState =>
    current === 0 ? 'extinguished' : isAtRisk ? 'atRisk' : 'healthy';

interface StreakEmberProps {
    /** The current streak. Zero extinguishes the flame. */
    current: number;
    isAtRisk?: boolean;
    /** Canvas edge in points. The flame's proportions are all relative to it. */
    size?: number;
}

const StreakEmber: React.FC<StreakEmberProps> = ({ current, isAtRisk = false, size = 64 }) => {
    const { isDarkColorScheme } = useColorScheme();
    const reduceMotion = useReduceMotion();

    const state = emberStateFor(current, isAtRisk);
    const isLive = state !== 'extinguished';

    const colours = PALETTE[isDarkColorScheme ? 'dark' : 'light'][state === 'atRisk' ? 'atRisk' : 'healthy'];

    /**
     * One phase value drives everything.
     *
     * A single oscillator keeps the flame coherent — the glow, the body and the core all
     * breathe together. Independent timers on each layer look like three things wobbling
     * near each other rather than one flame.
     */
    const phase = useSharedValue(0);

    useEffect(() => {
        cancelAnimation(phase);

        if (!isLive || reduceMotion) {
            // Parked mid-cycle rather than at zero, so the static glyph is the flame at
            // its resting size instead of its smallest.
            phase.value = 0.5;
            return;
        }

        phase.value = 0;
        phase.value = withRepeat(
            // At-risk burns slower as well as dimmer. Speed carries as much of the signal
            // as colour does, and it survives being looked at out of the corner of an eye.
            withTiming(1, { duration: isAtRisk ? 2600 : 1500, easing: Easing.inOut(Easing.sin) }),
            -1,
            true
        );

        return () => cancelAnimation(phase);
    }, [isAtRisk, isLive, phase, reduceMotion]);

    // At-risk shrinks a little. Not enough to move the layout — the canvas is fixed — just
    // enough that the flame reads as guttering.
    const scale = state === 'atRisk' ? 0.86 : 1;

    const centreX = size / 2;
    const baseY = size * 0.58;
    const glowR = size * 0.4 * scale;
    const bodyR = size * 0.28 * scale;
    const coreR = size * 0.15 * scale;
    const tipR = size * 0.12 * scale;

    const glowRadius = useDerivedValue(() => glowR * (0.92 + 0.12 * phase.value));
    const glowOpacity = useDerivedValue(() => 0.34 + 0.22 * phase.value);
    const bodyRadius = useDerivedValue(() => bodyR * (0.94 + 0.1 * phase.value));
    const coreY = useDerivedValue(() => baseY + size * 0.04 - size * 0.02 * phase.value);
    const tipY = useDerivedValue(() => baseY - size * 0.24 - size * 0.06 * phase.value);
    const tipRadius = useDerivedValue(() => tipR * (0.7 + 0.4 * phase.value));

    return (
        <View
            style={{ width: size, height: size }}
            // Purely decorative. The day count next to it carries the label — see
            // `StreakHeader` — so a screen reader announces "12 day streak, active" once
            // rather than describing a flame.
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
        >
            <Canvas style={{ flex: 1 }}>
                {state === 'extinguished' ? (
                    <Group>
                        <Circle
                            cx={centreX}
                            cy={baseY}
                            r={bodyR}
                            color={EXTINGUISHED}
                            style="stroke"
                            strokeWidth={size * 0.03}
                            opacity={0.55}
                        />
                        <Circle
                            cx={centreX}
                            cy={baseY - size * 0.24}
                            r={tipR}
                            color={EXTINGUISHED}
                            style="stroke"
                            strokeWidth={size * 0.03}
                            opacity={0.35}
                        />
                    </Group>
                ) : (
                    <Group>
                        <Circle cx={centreX} cy={baseY} r={glowRadius} color={colours.glow} opacity={glowOpacity}>
                            <BlurMask blur={size * 0.22} style="normal" />
                        </Circle>

                        <Circle cx={centreX} cy={tipY} r={tipRadius} color={colours.body} opacity={0.75}>
                            <BlurMask blur={size * 0.1} style="normal" />
                        </Circle>

                        <Circle cx={centreX} cy={baseY} r={bodyRadius} color={colours.body}>
                            <BlurMask blur={size * 0.08} style="normal" />
                        </Circle>

                        <Circle cx={centreX} cy={coreY} r={coreR} color={colours.core}>
                            <BlurMask blur={size * 0.05} style="normal" />
                        </Circle>
                    </Group>
                )}
            </Canvas>
        </View>
    );
};

export default StreakEmber;
