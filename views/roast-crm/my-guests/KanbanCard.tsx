import React, { useRef, useState } from 'react';
import { Animated, PanResponder, View, Linking, TouchableOpacity, Platform } from 'react-native';
import { Guest } from '~/store/types';

import { Phone, MessageCircle, Clock, MoreVertical } from 'lucide-react-native';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { Avatar, AvatarFallback } from '~/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { MilestoneStatus } from '~/store/types';
import { Text } from '~/components/ui/text';

interface KanbanCardProps {
    guest: Guest;
    onDragStart?: () => void;
    onViewGuest: (guestId: string) => void;
    onDrop: (guestId: string, x: number, y: number) => void;
    onGuestMove?: (guestId: string, newStage: Guest['assimilationStage']) => void;
}

export function KanbanCard({ guest, onDrop, onGuestMove, onDragStart, onViewGuest }: KanbanCardProps) {
    const pan = useRef(new Animated.ValueXY()).current;
    const [isDragging, setIsDragging] = useState(false);
    const scale = useRef(new Animated.Value(1)).current;
    const opacity = useRef(new Animated.Value(1)).current;

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, gestureState) => {
                // Only activate pan responder if user has moved more than 5 pixels
                // This prevents conflict with touch events on buttons
                return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
            },
            onMoveShouldSetPanResponderCapture: (_, gestureState) => {
                // Capture movement only after threshold
                return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
            },
            onPanResponderGrant: () => {
                setIsDragging(true);

                // Notify parent that drag has started
                onDragStart?.();

                // Animate scale and opacity for visual feedback
                Animated.parallel([
                    Animated.spring(scale, {
                        toValue: 1.05,
                        useNativeDriver: true,
                    }),
                    Animated.timing(opacity, {
                        toValue: 0.9,
                        duration: 200,
                        useNativeDriver: true,
                    }),
                ]).start();

                // Set pan offset
                pan.setOffset({
                    x: (pan.x as any)._value || 0,
                    y: (pan.y as any)._value || 0,
                });
                pan.setValue({ x: 0, y: 0 });
            },
            onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
                useNativeDriver: false,
                // listener: (event, gestureState) => {
                //     // Optional: Add visual feedback while dragging
                //     // You could highlight potential drop zones here
                // },
            }),
            onPanResponderRelease: (_, gesture) => {
                setIsDragging(false);

                // Call drop handler with final position
                onDrop(guest._id, gesture.moveX, gesture.moveY);

                // Animate back to original position
                Animated.parallel([
                    Animated.spring(pan, {
                        toValue: { x: 0, y: 0 },
                        useNativeDriver: false,
                        friction: 5,
                    }),
                    Animated.spring(scale, {
                        toValue: 1,
                        useNativeDriver: true,
                    }),
                    Animated.timing(opacity, {
                        toValue: 1,
                        duration: 200,
                        useNativeDriver: true,
                    }),
                ]).start(() => {
                    // Clean up
                    pan.flattenOffset();
                });
            },
            onPanResponderTerminate: () => {
                // Handle gesture cancellation
                setIsDragging(false);
                Animated.parallel([
                    Animated.spring(pan, {
                        toValue: { x: 0, y: 0 },
                        useNativeDriver: false,
                    }),
                    Animated.spring(scale, {
                        toValue: 1,
                        useNativeDriver: true,
                    }),
                    Animated.timing(opacity, {
                        toValue: 1,
                        duration: 200,
                        useNativeDriver: true,
                    }),
                ]).start();
            },
        })
    ).current;

    const handleCall = () => {
        if (!isDragging) {
            Linking.openURL(`tel:${guest.phone}`);
        }
    };

    const handleWhatsApp = () => {
        if (!isDragging) {
            Linking.openURL(`https://wa.me/${guest.phone.replace(/\D/g, '')}`);
        }
    };

    const getProgressPercentage = (milestones: Guest['milestones']) => {
        if (!milestones || milestones.length === 0) return 0;
        const completed = milestones.filter(m => m.status === MilestoneStatus.COMPLETED).length;
        return Math.round((completed / milestones.length) * 100);
    };

    const getDaysSinceContact = (lastContact: Date | undefined | null) => {
        if (!lastContact) return null;
        const today = new Date();
        const contactDate = new Date(lastContact);
        const diffTime = today.getTime() - contactDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const progress = getProgressPercentage(guest.milestones);
    const daysSinceContact = getDaysSinceContact(guest?.lastContact as any);

    return (
        <Animated.View
            {...panResponder.panHandlers}
            style={[
                {
                    transform: [{ translateX: pan.x }, { translateY: pan.y }, { scale: scale }],
                    opacity: opacity,
                    elevation: isDragging ? 5 : 2,
                    zIndex: isDragging ? 1000 : 1,
                },
            ]}
            className="bg-background rounded-3xl"
        >
            <Card className={isDragging ? 'shadow-lg' : 'shadow-sm'}>
                <CardContent className="p-4">
                    <View className="flex-row items-start justify-between mb-2">
                        <View className="flex-row items-center gap-2">
                            <Avatar alt="profile-avatar" className="w-12 h-12">
                                <AvatarFallback className="text-xs">
                                    <Text>
                                        {guest.name
                                            .split(' ')
                                            .map(n => n[0])
                                            .join('')
                                            .toUpperCase()}
                                    </Text>
                                </AvatarFallback>
                            </Avatar>
                            <View>
                                <Text className="font-medium">{guest.name}</Text>
                                <Text className="text-xs text-foreground">{guest.phone}</Text>
                            </View>
                        </View>

                        {!isDragging && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <TouchableOpacity
                                        className="items-center justify-center p-2 rounded-full"
                                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                    >
                                        <MoreVertical className="w-4 h-4" color="gray" />
                                    </TouchableOpacity>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" alignOffset={8} className="rounded-2xl">
                                    <DropdownMenuItem onPress={() => onViewGuest(guest._id)}>
                                        <Text>View Profile</Text>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </View>

                    <View className="gap-3">
                        <View className="flex-row items-center justify-between text-xs">
                            <Text className="text-foreground">Progress</Text>
                            <Text className="text-foreground">{progress}% complete</Text>
                        </View>

                        <View className="w-full bg-secondary rounded-full h-2">
                            <View
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </View>

                        {guest.nextAction && (
                            <View className="text-xs bg-yellow-50 dark:bg-yellow-400/20 border border-yellow-200 dark:border-yellow-500/20 rounded p-2 flex-row">
                                <Text className="font-bold">Next: </Text>
                                <Text>{guest.nextAction}</Text>
                            </View>
                        )}

                        <View className="flex-row items-center justify-between text-xs">
                            <View className="flex-row items-center gap-2 text-foreground">
                                <Clock className="w-3 h-3" />
                                <Text>
                                    {daysSinceContact === null
                                        ? 'No contact'
                                        : daysSinceContact === 0
                                        ? 'Today'
                                        : daysSinceContact === 1
                                        ? 'Yesterday'
                                        : `${daysSinceContact} days ago`}
                                </Text>
                            </View>
                            {!isDragging && (
                                <View className="flex-row gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-6 px-2"
                                        onPress={handleCall}
                                        disabled={isDragging}
                                    >
                                        <Phone className="w-3 h-3" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-6 px-2"
                                        onPress={handleWhatsApp}
                                        disabled={isDragging}
                                    >
                                        <MessageCircle className="w-3 h-3" />
                                    </Button>
                                </View>
                            )}
                        </View>
                    </View>
                </CardContent>
            </Card>
        </Animated.View>
    );
}
