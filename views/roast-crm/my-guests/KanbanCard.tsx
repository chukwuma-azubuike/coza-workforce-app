import React, { useRef } from 'react';
import { Animated, PanResponder, View, Linking, TouchableOpacity } from 'react-native';
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

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                // notify board to re-measure columns
                onDragStart?.();
                // reset offset so animation starts fresh
                // use internal value access (safe for RN Animated.Value)
                const ox = (pan.x as any)._value ?? 0;
                const oy = (pan.y as any)._value ?? 0;
                pan.setOffset({ x: ox, y: oy });
                pan.setValue({ x: 0, y: 0 });
            },
            onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
                useNativeDriver: false,
            }),
            onPanResponderRelease: (_, gesture) => {
                // gesture.moveX / moveY are screen coords — board measured with measureInWindow (screen coords) so they match
                onDrop(guest._id, gesture.moveX, gesture.moveY);
                // reset animated position
                Animated.spring(pan, {
                    toValue: { x: 0, y: 0 },
                    useNativeDriver: false,
                }).start(() => {
                    pan.setOffset({ x: 0, y: 0 });
                    pan.setValue({ x: 0, y: 0 });
                });
            },
        })
    ).current;

    const handleCall = (guest: Guest) => () => {
        Linking.openURL(`tel:${guest.phone}`);
    };

    const handleWhatsApp = (guest: Guest) => () => {
        Linking.openURL(`https://wa.me/${guest.phone.replace(/\D/g, '')}`);
    };

    const getProgressPercentage = (milestones: Guest['milestones']) => {
        const completed = milestones.filter(m => m.status === MilestoneStatus.COMPLETED).length;
        return Math.round((completed / milestones.length) * 100);
    };

    const getDaysSinceContact = (lastContact: Date) => {
        const today = new Date();

        const diffTime = today.getTime() - lastContact?.getTime();
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
                    elevation: 2,
                },
                pan.getLayout(),
            ]}
            className="cursor-move hover:shadow-md transition-shadow bg-background rounded-3xl"
        >
            <Card>
                <CardContent className="p-4">
                    <View className="flex-row items-start justify-between mb-2">
                        <View className="flex-row items-center gap-2">
                            <Avatar alt="profile-avatar" className="w-12 h-12">
                                <AvatarFallback className="text-xs">
                                    <Text>
                                        {guest.name
                                            .split(' ')
                                            .map(n => n[0])
                                            .join('')}
                                    </Text>
                                </AvatarFallback>
                            </Avatar>
                            <View>
                                <Text className="font-medium">{guest.name}</Text>
                                <Text className="text-xs text-foreground">{guest.phone}</Text>
                            </View>
                        </View>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <TouchableOpacity className="items-center justify-center rounded-full">
                                    <MoreVertical className="w-2 h-2" color="gray" />
                                </TouchableOpacity>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" alignOffset={8} className="rounded-2xl py-0">
                                <DropdownMenuItem asChild className="active:bg-background">
                                    <TouchableOpacity
                                        activeOpacity={6}
                                        onPress={() => onViewGuest(guest._id)}
                                        className="items-center justify-center rounded-full"
                                    >
                                        <Text>View Profile</Text>
                                    </TouchableOpacity>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
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

                        <View className="text-xs bg-yellow-50 dark:bg-yellow-400/20 border border-yellow-200 dark:border-yellow-500/20 rounded p-2 flex-row">
                            <Text className="font-bold">Next: </Text>
                            <Text>{guest.nextAction}</Text>
                        </View>

                        <View className="flex-row items-center justify-between text-xs">
                            <View className="flex-row items-center gap-2 text-foreground">
                                <Clock className="w-3 h-3" />
                                <Text>
                                    {daysSinceContact === 0
                                        ? 'Today'
                                        : daysSinceContact === 1
                                        ? 'Yesterday'
                                        : `${daysSinceContact} days ago`}
                                </Text>
                            </View>
                            <View className="flex-row gap-2">
                                <Button size="sm" variant="outline" className="h-6 px-2" onPress={handleCall(guest)}>
                                    <Phone className="w-3 h-3" />
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-6 px-2"
                                    onPress={handleWhatsApp(guest)}
                                >
                                    <MessageCircle className="w-3 h-3" />
                                </Button>
                            </View>
                        </View>
                    </View>
                </CardContent>
            </Card>
        </Animated.View>
    );
}
