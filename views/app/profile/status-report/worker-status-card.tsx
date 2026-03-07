import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Pressable, Animated } from 'react-native';

// Note: If you aren't using Expo, swap this for your preferred icon library
import { Ionicons } from '@expo/vector-icons';
import { IUserStatus } from '~/store/types';
import { Text } from '~/components/ui/text';
import Loading from '~/components/atoms/loading';
import { cn } from '~/lib/utils';

interface WorkerStatusCardProps {
    onPress: () => void;
    status: IUserStatus;
    loading: boolean;
}

const WorkerStatusCard = ({ onPress, status, loading }: WorkerStatusCardProps) => {
    // 1. Setup Animation Values
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const opacityAnim = useRef(new Animated.Value(0.6)).current;
    const slideAnim = useRef(new Animated.Value(0)).current;

    // 2. Loop the Idle Animations (Breathing text & Sliding Chevron)
    useEffect(() => {
        // Breathing opacity effect
        Animated.loop(
            Animated.sequence([
                Animated.timing(opacityAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
                Animated.timing(opacityAnim, { toValue: 0.6, duration: 1500, useNativeDriver: true }),
            ])
        ).start();

        // Subtle 4px slide for the chevron
        Animated.loop(
            Animated.sequence([
                Animated.timing(slideAnim, { toValue: 4, duration: 500, useNativeDriver: true }),
                Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
            ])
        ).start();
    }, [opacityAnim, slideAnim]);

    // 4. Sheen / reflection animation
    const [cardWidth, setCardWidth] = useState(0);
    const sheenAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (cardWidth <= 0) return;

        // start the sheen off the left side
        sheenAnim.setValue(-cardWidth);

        const sheenLoop = Animated.loop(
            Animated.timing(sheenAnim, {
                duration: 2800,
                toValue: cardWidth * 1.5,
                useNativeDriver: true,
            })
        );

        sheenLoop.start();

        return () => sheenLoop.stop();
    }, [cardWidth, sheenAnim]);

    // 3. Tactile Press Animations
    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.98, // Shrinks slightly when pressed
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1, // Bounces back
            friction: 4,
            useNativeDriver: true,
        }).start();
    };

    return (
        <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={onPress}>
            <Animated.View
                className="bg-muted-background !border-muted-foreground/20"
                onLayout={e => setCardWidth(e.nativeEvent.layout.width)}
                style={[styles.card, { transform: [{ scale: scaleAnim }], overflow: 'hidden' }]}
            >
                {/* Sheen / glossy reflection overlay */}
                <Animated.View
                    pointerEvents="none"
                    className="z-10 bg-muted-foreground/20"
                    style={[
                        styles.sheen,
                        {
                            width: cardWidth ? cardWidth * 1.6 : 0,
                            transform: [{ translateX: sheenAnim }, { rotate: '-25deg' }],
                            opacity: 0.65,
                        },
                    ]}
                />
                {/* Top Row: Title and Badge */}
                <View style={styles.topRow}>
                    <Text className="font-semibold text-muted-foreground">Worker Status</Text>

                    {loading ? (
                        <Loading />
                    ) : (
                        <View
                            style={styles.badgeContainer}
                            className={cn(
                                status === 'ACTIVE'
                                    ? 'bg-green-500/20 border-green-500/40 shadow-green-500/60'
                                    : status === 'INACTIVE'
                                      ? 'bg-yellow-500/20 border-yellow-500/40 shadow-yellow-500/60'
                                      : status === 'DORMANT'
                                        ? 'bg-gray-500/20 border-gray-500/40 shadow-gray-500/60'
                                        : status === 'BLACKLISTED'
                                          ? 'bg-red-500/20 border-red-500/40 shadow-red-500/60'
                                          : 'bg-gray-500/20 border-gray-500/40 shadow-gray-500/60'
                            )}
                        >
                            <Text
                                style={styles.badgeText}
                                className={cn(
                                    'text-sm',
                                    status === 'ACTIVE'
                                        ? 'text-green-500'
                                        : status === 'INACTIVE'
                                          ? 'text-yellow-500'
                                          : status === 'DORMANT'
                                            ? 'text-gray-500'
                                            : status === 'BLACKLISTED'
                                              ? 'text-red-500'
                                              : 'text-gray-400'
                                )}
                            >
                                {status}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Bottom Row: Call to Action */}
                <View style={styles.actionRow} className="w-full bg-muted-foreground/10 p-4 justify-center rounded-xl">
                    <Animated.Text className="!text-foreground" style={[styles.actionText, { opacity: opacityAnim }]}>
                        Tap to see full report
                    </Animated.Text>
                    <Animated.View style={{ transform: [{ translateX: slideAnim }] }}>
                        <Ionicons name="chevron-forward" size={18} color={'gray'} />
                    </Animated.View>
                </View>
            </Animated.View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    badgeContainer: {
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 16,
        borderWidth: 1,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    actionText: {
        fontSize: 14,
        marginRight: 6,
    },
    sheen: {
        position: 'absolute',
        top: -20,
        bottom: -20,
        left: -200,
        shadowColor: '#FFFFFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
});

export default WorkerStatusCard;
