import React, { useEffect } from 'react';
import { View } from 'react-native';
import { BlurMask, Canvas, Circle, Group, RadialGradient, vec } from '@shopify/react-native-skia';
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
 * a handful of circles on a Skia canvas are a handful of draw calls. At 60fps behind a
 * `FlashList` that difference is the whole design.
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

/**
 * Keeping the flame inside its own canvas.
 *
 * A Skia `Canvas` clips to its own rect, and `BlurMask` is not an infinite falloff: a
 * sigma has *hard* support at roughly 1.73σ (the inverse of Skia's own
 * `ConvertRadiusToSigma`), past which alpha is exactly zero — but everything inside that
 * radius is painted at full strength and gets guillotined along a straight line by the
 * canvas edge. With an animated radius the cut slides as the flame breathes, which reads
 * as a flame in a box rather than a flame.
 *
 * So the geometry below is authored in nominal units and scaled by `FIT` — the factor
 * that brings the widest painted extent, at the loudest point of the cycle, inside the
 * canvas. Nothing here is hand-tuned: change a proportion and the fit follows.
 */
const BLUR_SUPPORT = 1.73;

const GLOW_R = 0.48;
const BODY_R = 0.28;
const BODY_BLUR = 0.08;
const BODY_PEAK = 1.04;
const CORE_DY = 0.04;
const CORE_R = 0.15;
const CORE_BLUR = 0.05;
const TIP_DY = 0.3;
const TIP_R = 0.12;
const TIP_PEAK = 1.1;
const TIP_BLUR = 0.1;

/** How far a blurred layer actually paints, measured from its own centre. */
const reachOf = (radius: number, blur: number) => radius + BLUR_SUPPORT * blur;

// The glow is a gradient rather than a blurred disc: it reaches zero alpha exactly at its
// radius, so it costs nothing beyond it. That is what buys the flame its headroom — and
// it drops the most expensive layer, since a mask blur is an offscreen pass and a
// gradient is not.
const REACH_GLOW = GLOW_R;
const REACH_BODY = reachOf(BODY_R * BODY_PEAK, BODY_BLUR);
const REACH_CORE = reachOf(CORE_R, CORE_BLUR);
const REACH_TIP = reachOf(TIP_R * TIP_PEAK, TIP_BLUR);

// Painted extents measured from the flame's base, at the top of the pulse.
const REACH_UP = Math.max(TIP_DY + REACH_TIP, REACH_GLOW, REACH_BODY);
const REACH_DOWN = Math.max(REACH_GLOW, REACH_BODY, CORE_DY + REACH_CORE);
const REACH_SIDE = Math.max(REACH_GLOW, REACH_BODY, REACH_TIP, REACH_CORE);

const FIT = Math.min(1 / (REACH_UP + REACH_DOWN), 0.5 / REACH_SIDE);

// The flame is taller above the base than below it, so the base does not sit on the
// canvas centre — it sits wherever the painted bounds end up centred.
const BASE_Y = (1 - (REACH_UP + REACH_DOWN) * FIT) / 2 + REACH_UP * FIT;

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
    // enough that the flame reads as guttering. It only ever shrinks radii, so it stays
    // inside the fit computed above.
    const scale = state === 'atRisk' ? 0.86 : 1;

    const unit = size * FIT;
    const centreX = size / 2;
    const baseY = size * BASE_Y;
    const glowR = unit * GLOW_R * scale;
    const bodyR = unit * BODY_R * scale;
    const coreR = unit * CORE_R * scale;
    const tipR = unit * TIP_R * scale;

    // The glow holds its radius and breathes in opacity alone. Under a soft gradient a
    // radius pulse is imperceptible anyway, and a fixed radius is what the fit above is
    // measured against — the breathing still reads, through the body, tip and core.
    const glowOpacity = useDerivedValue(() => 0.34 + 0.22 * phase.value);
    const bodyRadius = useDerivedValue(() => bodyR * (0.94 + 0.1 * phase.value));
    const coreY = useDerivedValue(() => baseY + unit * CORE_DY - unit * 0.02 * phase.value);
    const tipY = useDerivedValue(() => baseY - unit * 0.24 - unit * 0.06 * phase.value);
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
                            strokeWidth={unit * 0.03}
                            opacity={0.55}
                        />
                        <Circle
                            cx={centreX}
                            cy={baseY - unit * 0.24}
                            r={tipR}
                            color={EXTINGUISHED}
                            style="stroke"
                            strokeWidth={unit * 0.03}
                            opacity={0.35}
                        />
                    </Group>
                ) : (
                    <Group>
                        <Circle cx={centreX} cy={baseY} r={glowR} opacity={glowOpacity}>
                            {/* Two full-strength stops then a fade to the same hue at zero
                                alpha: a plateau and a falloff, which is what a blurred disc
                                looked like, without the blur's painted overhang. The alpha-0
                                stop keeps the hue — fading to `transparent` would drag the
                                midpoint through black. */}
                            <RadialGradient
                                c={vec(centreX, baseY)}
                                r={glowR}
                                colors={[colours.glow, colours.glow, `${colours.glow}00`]}
                                positions={[0, 0.35, 1]}
                            />
                        </Circle>

                        <Circle cx={centreX} cy={tipY} r={tipRadius} color={colours.body} opacity={0.75}>
                            <BlurMask blur={unit * TIP_BLUR} style="normal" />
                        </Circle>

                        <Circle cx={centreX} cy={baseY} r={bodyRadius} color={colours.body}>
                            <BlurMask blur={unit * BODY_BLUR} style="normal" />
                        </Circle>

                        <Circle cx={centreX} cy={coreY} r={coreR} color={colours.core}>
                            <BlurMask blur={unit * CORE_BLUR} style="normal" />
                        </Circle>
                    </Group>
                )}
            </Canvas>
        </View>
    );
};

export default StreakEmber;
