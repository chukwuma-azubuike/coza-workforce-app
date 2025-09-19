import React, { memo, useCallback, useMemo } from 'react';
import { View, TouchableOpacity } from 'react-native';
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
import { Text } from '~/components/ui/text';
import { handleCall, handleWhatsApp } from '../utils/communication';
import { getDaysSinceContact, getProgressPercentage } from '../utils/milestones';
import { router } from 'expo-router';

interface KanbanCardProps {
    guest: Guest;
}

const KanbanUICard: React.FC<KanbanCardProps> = ({ guest }) => {
    const progress = useMemo(() => getProgressPercentage(guest.milestones), [guest.milestones]);
    const daysSinceContact = useMemo(() => getDaysSinceContact(guest?.lastContact as any), [guest?.lastContact]);

    const handleProfileView = useCallback(() => {
        router.push({ pathname: '/roast-crm/guests/profile', params: guest as any });
    }, [guest]);

    return (
        <View className="bg-background rounded-3xl">
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
                                            .join('')
                                            .toUpperCase()}
                                    </Text>
                                </AvatarFallback>
                            </Avatar>
                            <View>
                                <Text className="font-bold text-xl">{guest.name}</Text>
                                <Text className="text-xs text-foreground">{guest.phone}</Text>
                            </View>
                        </View>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <TouchableOpacity
                                    className="items-center justify-center p-2 rounded-full"
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <MoreVertical className="w-4 h-4" color="gray" />
                                </TouchableOpacity>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent side="top" align="end" alignOffset={-10} className="rounded-2xl">
                                <DropdownMenuItem onPress={handleProfileView}>
                                    <Text>View Profile</Text>
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
        </View>
    );
};

export default memo(KanbanUICard);

KanbanUICard.displayName = 'KanbanUICard';
