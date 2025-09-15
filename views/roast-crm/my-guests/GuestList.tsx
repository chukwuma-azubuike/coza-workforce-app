import React, { memo } from 'react';
import { Badge } from '~/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';

import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '~/components/ui/select';
import { Button } from '~/components/ui/button';
import { Phone, MessageCircle, MoreVertical } from 'lucide-react-native';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuItem,
    DropdownMenuContent,
} from '~/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '~/components/ui/avatar';
import { AssimilationStage, Guest } from '~/store/types';
import { Linking, View } from 'react-native';
import { formatTimeAgo } from '~/utils/formatTimeAgo';
import { Text } from '~/components/ui/text';

interface GuestListProps {
    guests: Guest[];
    onStageChange: (guestId: string, newStage: AssimilationStage) => void;
    onViewGuest: (guestId: string) => void;
}

export const GuestList = memo(function GuestList({ guests, onStageChange, onViewGuest }: GuestListProps) {
    const getStageColor = (stage: AssimilationStage) => {
        switch (stage) {
            case 'invited':
                return 'bg-blue-100 text-blue-800';
            case 'attended':
                return 'bg-green-100 text-green-800';
            case 'discipled':
                return 'bg-purple-100 text-purple-800';
            case 'joined':
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStageText = (stage: AssimilationStage) => {
        switch (stage) {
            case 'invited':
                return 'Invited';
            case 'attended':
                return 'Attended';
            case 'discipled':
                return 'Discipled';
            case 'joined':
                return 'Joined Workforce';
        }
    };

    const getProgressPercentage = (milestones: Guest['milestones']) => {
        const completed = milestones.filter(m => m.status === 'COMPLETED').length;
        return Math.round((completed / milestones.length) * 100);
    };

    const hasCall = (guest: Guest) => () => {
        Linking.openURL(`tel:${guest.phone}`);
    };

    const handleOpenWhatsApp = (guest: Guest) => () => {
        Linking.openURL(`https://wa.me/${guest.phone.replace(/\D/g, '')}`);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <Text>My Guests</Text>
                    <Badge variant="outline">{guests.length} guests</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Guest</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Stage</TableHead>
                            <TableHead>Progress</TableHead>
                            <TableHead>Last Contact</TableHead>
                            <TableHead>Next Action</TableHead>
                            <TableHead className="w-20">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {guests.map(guest => {
                            const progress = getProgressPercentage(guest.milestones);

                            return (
                                <TableRow key={guest._id}>
                                    <TableCell>
                                        <View className="flex items-center space-x-3">
                                            <Avatar alt="profile-avatar" className="w-8 h-8">
                                                <AvatarFallback className="text-xs">
                                                    {guest.name.split(' ')[0]}
                                                    {guest.name.split(' ')[1]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <View>
                                                <View className="font-medium">{`${guest.name || ''}`}</View>
                                                {guest.address && (
                                                    <View className="text-xs text-gray-500">{guest.address}</View>
                                                )}
                                            </View>
                                        </View>
                                    </TableCell>
                                    <TableCell>
                                        <View className="space-y-1">
                                            <View className="text-sm">{guest.phone}</View>
                                            <View className="flex space-x-1">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-6 px-2"
                                                    onPress={hasCall(guest)}
                                                >
                                                    <Phone className="w-3 h-3" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-6 px-2"
                                                    onPress={handleOpenWhatsApp(guest)}
                                                >
                                                    <MessageCircle className="w-3 h-3" />
                                                </Button>
                                            </View>
                                        </View>
                                    </TableCell>
                                    <TableCell>
                                        <Select
                                            value={guest.assimilationStage as any}
                                            onValueChange={newStage => onStageChange(guest._id, newStage as any)}
                                        >
                                            <SelectTrigger className="w-32">
                                                <SelectValue placeholder="Select stage">
                                                    <Badge className={getStageColor(guest.assimilationStage)}>
                                                        {getStageText(guest.assimilationStage)}
                                                    </Badge>
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem label="" value="invited">
                                                    <View className="flex items-center space-x-2">
                                                        <View className="w-3 h-3 bg-blue-500 rounded"></View>
                                                        <Text>Invited</Text>
                                                    </View>
                                                </SelectItem>
                                                <SelectItem label="" value="attended">
                                                    <View className="flex items-center space-x-2">
                                                        <View className="w-3 h-3 bg-green-500 rounded"></View>
                                                        <Text>Attended</Text>
                                                    </View>
                                                </SelectItem>
                                                <SelectItem label="" value="discipled">
                                                    <View className="flex items-center space-x-2">
                                                        <View className="w-3 h-3 bg-purple-500 rounded"></View>
                                                        <Text>Discipled</Text>
                                                    </View>
                                                </SelectItem>
                                                <SelectItem label="" value="joined">
                                                    <View className="flex items-center space-x-2">
                                                        <View className="w-3 h-3 bg-gray-500 rounded"></View>
                                                        <Text>Joined Workforce</Text>
                                                    </View>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell>
                                        <View className="space-y-1">
                                            <View className="text-sm">{progress}% complete</View>
                                            <View className="w-full bg-gray-200 rounded-full h-2">
                                                <View
                                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </View>
                                        </View>
                                    </TableCell>
                                    <TableCell>
                                        <View className="text-sm text-gray-600">
                                            {guest.lastContact
                                                ? formatTimeAgo(new Date(guest.lastContact))
                                                : 'No contact yet'}
                                        </View>
                                    </TableCell>
                                    <TableCell>
                                        {guest.nextAction && (
                                            <View className="text-sm bg-yellow-50 border border-yellow-200 rounded px-2 py-1">
                                                {guest.nextAction}
                                            </View>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-6 w-6 p-0">
                                                    <MoreVertical className="w-3 h-3" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onPress={() => onViewGuest(guest._id)}>
                                                    View Profile
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
});
