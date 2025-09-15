import React, { memo } from 'react';
import { Linking, View, Text } from 'react-native';
import { Phone, MessageCircle, Clock, MoreVertical } from 'lucide-react-native';

import { Card, CardContent } from '~/components/ui/card';
import { Avatar, AvatarFallback } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import { Guest } from '~/store/types';
import { formatTimeAgo } from '~/utils/formatTimeAgo';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';

interface GuestCardProps {
    guest: Guest;
    onViewGuest: (guestId: string) => void;
    onDragStart?: (e: React.DragEvent, guestId: string) => void;
    className?: string;
}

export const GuestCard = memo(function GuestCard({ guest, onViewGuest, onDragStart, className }: GuestCardProps) {
    const progress = React.useMemo(() => {
        const completed = guest.milestones.filter(m => m.status === 'COMPLETED').length;
        return Math.round((completed / guest.milestones.length) * 100);
    }, [guest.milestones]);

    const handleCall = () => {
        Linking.openURL(`tel:${guest.phone}`);
    };

    const handleWhatsApp = () => {
        Linking.openURL(`https://wa.me/${guest.phone.replace(/\D/g, '')}`);
    };

    const handleViewProfile = () => {
        onViewGuest(guest._id);
    };

    return (
        <Card className={`bg-white ${className || ''}`}>
            <CardContent className="p-3">
                <View className="flex-row items-start justify-between mb-2">
                    <View className="flex-row items-center space-x-2">
                        <Avatar alt="guest-avatar" className="w-8 h-8">
                            <AvatarFallback className="text-xs">
                                {guest.name.split(' ')[0]}
                                {guest.name.split(' ')[1]}
                            </AvatarFallback>
                        </Avatar>
                        <View>
                            <Text className="font-medium text-sm">{`${guest.name || ''}`}</Text>
                            <Text className="text-xs text-gray-500">{guest.phone}</Text>
                        </View>
                    </View>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                className="items-center justify-center rounded-md h-6 w-6 p-0"
                                variant="ghost"
                            >
                                <MoreVertical className="w-3 h-3" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onPress={handleViewProfile}>View Profile</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </View>

                <View className="space-y-2">
                    <View className="flex-row items-center justify-between">
                        <Text className="text-xs text-gray-600">Progress</Text>
                        <Text className="text-xs text-gray-500">{progress}% complete</Text>
                    </View>

                    <View className="w-full bg-gray-200 rounded-full h-2">
                        <View
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${progress}%` }}
                        />
                    </View>

                    {guest.nextAction && (
                        <View className="bg-yellow-50 border border-yellow-200 rounded p-2">
                            <Text className="text-xs">
                                <Text className="font-bold">Next:</Text> {guest.nextAction}
                            </Text>
                        </View>
                    )}

                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center space-x-1">
                            <Clock className="w-3 h-3 text-gray-600" />
                            <Text className="text-xs text-gray-600">
                                {guest.lastContact ? formatTimeAgo(new Date(guest.lastContact)) : 'No contact yet'}
                            </Text>
                        </View>
                        <View className="flex-row space-x-1">
                            <Button size="sm" variant="outline" className="h-6 px-2" onPress={handleCall}>
                                <Phone className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline" className="h-6 px-2" onPress={handleWhatsApp}>
                                <MessageCircle className="w-3 h-3" />
                            </Button>
                        </View>
                    </View>
                </View>
            </CardContent>
        </Card>
    );
});
