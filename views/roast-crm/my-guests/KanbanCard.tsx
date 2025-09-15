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
    const [isDragging, setIsDragging] = useState(false);
    const translateX = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(0)).current;    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
            },
            onPanResponderGrant: () => {
                setIsDragging(true);
                onDragStart?.();
                
                // Reset values to current position
                translateX.setValue(0);
                translateY.setValue(0);
            },
            onPanResponderMove: (_, gesture) => {
                Animated.event(
                    [
                        null,
                        {
                            dx: translateX,
                            dy: translateY
                        }
                    ],
                    { useNativeDriver: true }
                )(_, gesture);
            },
            onPanResponderRelease: (_, gesture) => {
                onDrop(guest._id, gesture.moveX, gesture.moveY);
                
                Animated.parallel([
                    Animated.spring(translateX, {
                        toValue: 0,
                        tension: 40,
                        friction: 5,
                        useNativeDriver: true
                    }),
                    Animated.spring(translateY, {
                        toValue: 0,
                        tension: 40,
                        friction: 5,
                        useNativeDriver: true
                    })
                ]).start(() => {
                    setIsDragging(false);
                });
            },
            onPanResponderTerminate: () => {
                Animated.parallel([
                    Animated.spring(translateX, {
                        toValue: 0,
                        tension: 40,
                        friction: 5,
                        useNativeDriver: true
                    }),
                    Animated.spring(translateY, {
                        toValue: 0,
                        tension: 40,
                        friction: 5,
                        useNativeDriver: true
                    })
                ]).start(() => {
                    setIsDragging(false);
                });
            }
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
                    transform: [
                        { translateX: translateX },
                        { translateY: translateY }
                    ],
                    elevation: isDragging ? 5 : 2,
                    zIndex: isDragging ? 1000 : 1,
                    shadowColor: '#000',
                    shadowOffset: {
                        width: 0,
                        height: isDragging ? 3 : 1,
                    },
                    shadowOpacity: isDragging ? 0.3 : 0.2,
                    shadowRadius: isDragging ? 4.65 : 2.22,
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
