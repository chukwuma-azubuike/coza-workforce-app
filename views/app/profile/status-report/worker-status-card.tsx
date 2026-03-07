import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Pressable, Animated } from 'react-native';

// Note: If you aren't using Expo, swap this for your preferred icon library
import { Ionicons } from '@expo/vector-icons';
import { IUserStatus } from '~/store/types';
import { Text } from '~/components/ui/text';

interface WorkerStatusCardProps {
    onPress: () => void;
    status: IUserStatus;
}

const WorkerStatusCard = ({ onPress, status }: WorkerStatusCardProps) => {
    // 1. Setup Animation Values
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const opacityAnim = useRef(new Animated.Value(0.1)).current;
    const slideAnim = useRef(new Animated.Value(0)).current;

    // 2. Loop the Idle Animations (Breathing text & Sliding Chevron)
    useEffect(() => {
        // Breathing opacity effect
        Animated.loop(
            Animated.sequence([
                Animated.timing(opacityAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
                Animated.timing(opacityAnim, { toValue: 0.6, duration: 500, useNativeDriver: true }),
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

    // 3. Tactile Press Animations
    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.96, // Shrinks slightly when pressed
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
        <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={onPress} style={styles.container}>
            <Animated.View className="bg-muted-background" style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
                {/* Top Row: Title and Badge */}
                <View style={styles.topRow}>
                    <Text className="text-sm" style={styles.title}>
                        Worker Status
                    </Text>

                    <View style={styles.badgeContainer}>
                        <Text style={styles.badgeText} className="text-sm">
                            {status}
                        </Text>
                    </View>
                </View>

                {/* Bottom Row: Call to Action */}
                <View style={styles.actionRow}>
                    <Animated.Text className="!text-foregroun" style={[styles.actionText, { opacity: opacityAnim }]}>
                        Tap to see full report
                    </Animated.Text>
                    <Animated.View style={{ transform: [{ translateX: slideAnim }] }}>
                        <Ionicons name="chevron-forward" size={18} color="#4ADE80" />
                    </Animated.View>
                </View>
            </Animated.View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 16,
    },
    card: {
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#333333', // Subtle border to catch the light
        // Subtle shadow for depth
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    title: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    badgeContainer: {
        backgroundColor: 'rgba(74, 222, 128, 0.15)', // Highly transparent green
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(74, 222, 128, 0.3)',
        // The "LED Glow" effect
        shadowColor: '#4ADE80',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 6,
        elevation: 4,
    },
    badgeText: {
        color: '#4ADE80', // Tailwind green-400
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
        color: '#A0A0A0', // Soft gray
        fontSize: 14,
        marginRight: 6,
    },
});

export default WorkerStatusCard;
