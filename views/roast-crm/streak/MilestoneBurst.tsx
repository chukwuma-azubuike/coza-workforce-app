import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Canvas, RoundedRect } from '@shopify/react-native-skia';
import * as Haptics from 'expo-haptics';
import { Easing, useDerivedValue, useSharedValue, withTiming } from 'react-native-reanimated';

import useReduceMotion from '~/hooks/roast-engagement/use-reduce-motion';

/**
 * The milestone celebration — a confetti burst that plays exactly once.
 *
 * Skia rather than Lottie, and not for performance this time: it plays for a second and a
 * half. It is Skia because the alternative is shipping a confetti JSON into `assets/json`
 * for a single one-and-a-half-second moment, and the ember and the heatmap have already
 * paid for the canvas. One rendering technology across the feature is worth more than a
 * marginally prettier burst.
 *
 * Every particle is a property animation off a single `progress` value — no `entering`,
 * no `layout`, nothing that would trip the Fabric crash this app has.
 */

const PARTICLE_COUNT = 26;
const DURATION = 1500;

const COLOURS = ['#F59E0B', '#FB923C', '#6366F1', '#22C55E', '#EC4899', '#FDE68A'];

/**
 * Fixed, not random.
 *
 * A burst reseeded on every render flickers, and a `Math.random()` inside a component that
 * a state change re-runs is exactly how that happens. Deriving the spread from the index
 * gives an even fan and a stable one.
 */
const PARTICLES = Array.from({ length: PARTICLE_COUNT }, (_, index) => {
    const angle = (index / PARTICLE_COUNT) * Math.PI * 2;
    const wobble = ((index * 37) % 11) / 11;

    return {
        angle,
        distance: 70 + wobble * 90,
        size: 5 + wobble * 5,
        spin: (index % 2 === 0 ? 1 : -1) * (2 + wobble * 3),
        delay: wobble * 0.16,
        colour: COLOURS[index % COLOURS.length],
    };
});

interface ParticleProps {
    progress: { value: number };
    particle: (typeof PARTICLES)[number];
    originX: number;
    originY: number;
}

const Particle: React.FC<ParticleProps> = ({ progress, particle, originX, originY }) => {
    const transform = useDerivedValue(() => {
        // Each particle starts a little after the last, so the burst blooms rather than
        // detonating as one ring.
        const t = Math.max(0, Math.min(1, (progress.value - particle.delay) / (1 - particle.delay)));

        // Ease-out on the way out, gravity on the way down — the two together are what
        // separate confetti from a firework.
        const travel = 1 - Math.pow(1 - t, 3);
        const gravity = 130 * t * t;

        return [
            { translateX: originX + Math.cos(particle.angle) * particle.distance * travel },
            { translateY: originY + Math.sin(particle.angle) * particle.distance * travel + gravity },
            { rotate: particle.spin * t },
        ];
    });

    const opacity = useDerivedValue(() => {
        const t = Math.max(0, Math.min(1, (progress.value - particle.delay) / (1 - particle.delay)));

        return t < 0.7 ? 1 : 1 - (t - 0.7) / 0.3;
    });

    return (
        <RoundedRect
            x={-particle.size / 2}
            y={-particle.size / 2}
            width={particle.size}
            height={particle.size * 1.6}
            r={1.5}
            color={particle.colour}
            opacity={opacity}
            transform={transform}
        />
    );
};

interface MilestoneBurstProps {
    /** The milestone crossed. Non-null starts the burst; the parent then marks it seen. */
    milestone: number | null;
    /** Fired when the burst has finished, so the parent can record it as celebrated. */
    onFinished: () => void;
    width: number;
    height: number;
}

const MilestoneBurst: React.FC<MilestoneBurstProps> = ({ milestone, onFinished, width, height }) => {
    const reduceMotion = useReduceMotion();
    const progress = useSharedValue(0);

    useEffect(() => {
        if (milestone === null) {
            return;
        }

        // The haptic fires either way. Reduce Motion is a request about movement on the
        // screen, not about being told something good happened.
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        if (reduceMotion) {
            onFinished();
            return;
        }

        progress.value = 0;
        progress.value = withTiming(1, { duration: DURATION, easing: Easing.out(Easing.quad) });

        const timer = setTimeout(onFinished, DURATION);

        return () => clearTimeout(timer);
    }, [milestone, onFinished, progress, reduceMotion]);

    if (milestone === null || reduceMotion) {
        return null;
    }

    return (
        <View
            pointerEvents="none"
            style={[StyleSheet.absoluteFillObject, { width, height }]}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
        >
            <Canvas style={{ flex: 1 }}>
                {PARTICLES.map((particle, index) => (
                    <Particle
                        key={index}
                        particle={particle}
                        progress={progress}
                        originX={width / 2}
                        originY={height / 2}
                    />
                ))}
            </Canvas>
        </View>
    );
};

export default MilestoneBurst;
