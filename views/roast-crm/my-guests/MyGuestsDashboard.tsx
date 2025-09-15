import React, { useMemo, useState } from 'react';
import { View, ScrollView, Linking, Dimensions } from 'react-native';
import { Phone, MessageCircle, Search, List, MoreVertical } from 'lucide-react-native';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Badge } from '~/components/ui/badge';
import { Avatar, AvatarFallback } from '~/components/ui/avatar';
import { ToggleGroup, ToggleGroupItem } from '~/components/ui/toggle-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';

// import { toast } from 'sonner';

import { AssimilationStage, Guest, MilestoneStatus, View as ViewEnum, ViewType } from '~/store/types';
import { useGetGuestsQuery } from '~/store/services/roast-crm';
import useRole from '~/hooks/role';
import { THEME_CONFIG } from '~/config/appConfig';
import { Icon } from '@rneui/themed';
import ViewWrapper from '~/components/layout/viewWrapper';
import { Text } from '~/components/ui/text';
import { FloatButton } from '~/components/atoms/button';
import KanbanBoard from './KanbanBoard';

function MyGuestsDashboard() {
    const { user: currentUser } = useRole();
    const [searchTerm, setSearchTerm] = useState('');

    const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
    const [stageFilter, setStageFilter] = useState<Guest['assimilationStage'] | 'all'>('all');
    const [selectedGuest, setSelectedGuest] = useState<string | null>(null);
    const [currentView, setCurrentView] = useState<ViewType>(ViewEnum.MY_GUESTS);

    const { data: guests, isLoading } = useGetGuestsQuery({ workerId: currentUser._id, zoneId: '' });

    // Filter guests by current user and search term
    const userGuests = useMemo(
        () => guests?.filter(guest => guest.name.toLowerCase().includes(searchTerm.toLowerCase())),
        [guests, searchTerm]
    );

    // Categorize guests by stage
    const categorizedGuests = {
        all: userGuests,
        invited: userGuests?.filter(guest => guest.assimilationStage === AssimilationStage.INVITED),
        attended: userGuests?.filter(guest => guest.assimilationStage === AssimilationStage.ATTENDED),
        discipled: userGuests?.filter(guest => guest.assimilationStage === AssimilationStage.DISCIPLED),
        joined: userGuests?.filter(guest => guest.assimilationStage === AssimilationStage.JOINED),
    };

    // Group guests by stage for Kanban view
    // const guestsByStage = {
    //     invited: userGuests?.filter(g => g.assimilationStage === 'invited'),
    //     attended: userGuests?.filter(g => g.assimilationStage === 'attended'),
    //     discipled: userGuests?.filter(g => g.assimilationStage === 'discipled'),
    //     joined: userGuests?.filter(g => g.assimilationStage === 'joined'),
    // };

    const handleViewGuest = (guestId: string) => {
        setSelectedGuest(guestId);
        setCurrentView(ViewEnum.PROFILE);
    };

    const handleGuestMove = (guestId: string, newStage: Guest['assimilationStage']) => {
        // TODO: Update guest stage in backend
        // setGuests(prev =>
        //     prev.map(guest => (guest._id === guestId ? { ...guest, stage: newStage, lastContact: new Date() } : guest))
        // );
        // toast.success(`Guest moved to ${newStage} stage`);
    };

    const getStageColor = (stage: Guest['assimilationStage']) => {
        switch (stage) {
            case 'invited':
                return 'bg-blue-100 text-blue-800';
            case 'attended':
                return 'bg-green-100 text-green-800';
            case 'discipled':
                return 'bg-purple-100 text-purple-800';
            case 'joined':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStageText = (stage: Guest['assimilationStage']) => {
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
        const completed = milestones.filter(m => m.status === MilestoneStatus.COMPLETED).length;
        return Math.round((completed / milestones.length) * 100);
    };

    const getDaysSinceContact = (lastContact: Date) => {
        const today = new Date();
        const diffTime = today.getTime() - lastContact?.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const ListView = ({ displayGuests }: { displayGuests: Guest[] }) => {
        return (
            <View>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex-row items-center justify-between">
                            <Text className="text-base font-medium">My Guests</Text>
                            <Badge variant="outline">{displayGuests?.length} guests</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ScrollView horizontal>
                            <View className="flex-1">
                                {/* Header Row */}
                                <View className="flex-row bg-gray-50 px-4 py-2">
                                    <View className="w-[200] px-2">
                                        <Text className="font-medium">Guest</Text>
                                    </View>
                                    <View className="w-[150] px-2">
                                        <Text className="font-medium">Contact</Text>
                                    </View>
                                    <View className="w-[120] px-2">
                                        <Text className="font-medium">Stage</Text>
                                    </View>
                                    <View className="w-[120] px-2">
                                        <Text className="font-medium">Progress</Text>
                                    </View>
                                    <View className="w-[120] px-2">
                                        <Text className="font-medium">Last Contact</Text>
                                    </View>
                                    <View className="w-[150] px-2">
                                        <Text className="font-medium">Next Action</Text>
                                    </View>
                                    <View className="w-[80] px-2">
                                        <Text className="font-medium">Actions</Text>
                                    </View>
                                </View>

                                {/* Guest Rows */}
                                {displayGuests?.map(guest => {
                                    const progress = getProgressPercentage(guest.milestones);
                                    const daysSinceContact = getDaysSinceContact(guest.lastContact as Date);

                                    return (
                                        <View key={guest._id} className="flex-row border-b border-gray-200 px-4 py-2">
                                            {/* Guest Info */}
                                            <View className="w-[200] px-2 flex-row items-center space-x-3">
                                                <Avatar alt="profile-avatar" className="w-8 h-8">
                                                    <AvatarFallback className="text-xs">
                                                        {guest.name
                                                            .split(' ')
                                                            .map(n => n[0])
                                                            .join('')}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <View>
                                                    <Text className="font-medium">{guest.name}</Text>
                                                    {guest.address && (
                                                        <Text className="text-xs text-gray-500">{guest.address}</Text>
                                                    )}
                                                </View>
                                            </View>

                                            {/* Contact */}
                                            <View className="w-[150] px-2 space-y-1">
                                                <Text className="">{guest.phone}</Text>
                                                <View className="flex-row space-x-1">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-6 px-2"
                                                        onPress={() => Linking.openURL(`tel:${guest.phone}`)}
                                                    >
                                                        <Phone className="w-3 h-3" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-6 px-2"
                                                        onPress={() =>
                                                            Linking.openURL(
                                                                `https://wa.me/${guest.phone.replace(/\D/g, '')}`
                                                            )
                                                        }
                                                    >
                                                        <MessageCircle className="w-3 h-3" />
                                                    </Button>
                                                </View>
                                            </View>

                                            {/* Stage */}
                                            <View className="w-[120] px-2">
                                                <Select
                                                    value={guest.assimilationStage as any}
                                                    onValueChange={newStage =>
                                                        handleGuestMove(guest._id, newStage as any)
                                                    }
                                                >
                                                    <SelectTrigger className="w-32 !h-10">
                                                        <SelectValue placeholder="Select stage">
                                                            <Badge className={getStageColor(guest.assimilationStage)}>
                                                                <Text>{getStageText(guest.assimilationStage)}</Text>
                                                            </Badge>
                                                        </SelectValue>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem label="Invited" value="invited">
                                                            <View className="flex-row items-center space-x-2">
                                                                <View className="w-3 h-3 bg-blue-500 rounded" />
                                                                <Text>Invited</Text>
                                                            </View>
                                                        </SelectItem>
                                                        <SelectItem label="Attended" value="attended">
                                                            <View className="flex-row items-center space-x-2">
                                                                <View className="w-3 h-3 bg-green-500 rounded" />
                                                                <Text>Attended</Text>
                                                            </View>
                                                        </SelectItem>
                                                        <SelectItem label="Discipled" value="discipled">
                                                            <View className="flex-row items-center space-x-2">
                                                                <View className="w-3 h-3 bg-purple-500 rounded" />
                                                                <Text>Discipled</Text>
                                                            </View>
                                                        </SelectItem>
                                                        <SelectItem label="Joined Workforce" value="joined">
                                                            <View className="flex-row items-center space-x-2">
                                                                <View className="w-3 h-3 bg-gray-500 rounded" />
                                                                <Text>Joined Workforce</Text>
                                                            </View>
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </View>

                                            {/* Progress */}
                                            <View className="w-[120] px-2 space-y-1">
                                                <Text className="">{progress}% complete</Text>
                                                <View className="w-full bg-gray-200 rounded-full h-2">
                                                    <View
                                                        className="bg-blue-600 h-2 rounded-full"
                                                        style={{ width: `${progress}%` }}
                                                    />
                                                </View>
                                            </View>

                                            {/* Last Contact */}
                                            <View className="w-[120] px-2">
                                                <Text className="text-foreground">
                                                    {daysSinceContact === 0
                                                        ? 'Today'
                                                        : daysSinceContact === 1
                                                        ? 'Yesterday'
                                                        : `${daysSinceContact} days ago`}
                                                </Text>
                                            </View>

                                            {/* Next Action */}
                                            <View className="w-[150] px-2">
                                                <View className="bg-yellow-50 border border-yellow-200 rounded px-2 py-1">
                                                    <Text className="">{guest.nextAction}</Text>
                                                </View>
                                            </View>

                                            {/* Actions */}
                                            <View className="w-[80] px-2">
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
                                                        <DropdownMenuItem onPress={() => handleViewGuest(guest._id)}>
                                                            View Profile
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>
                        </ScrollView>
                    </CardContent>
                </Card>
            </View>
        );
    };

    const SearchAndFilter = () => {
        return (
            <View className="flex-row items-center gap-4">
                <View className="flex-1 relative">
                    <View className="absolute left-2 top-2 z-10">
                        <Search className="w-4 h-4 text-foreground" color="gray" />
                    </View>
                    <Input
                        placeholder="Search by name, phone, or address..."
                        value={searchTerm}
                        onChangeText={e => setSearchTerm(e)}
                        className="pl-10 !h-10"
                    />
                </View>
                {viewMode == 'list' && (
                    <Select value={stageFilter as any} onValueChange={value => setStageFilter(value as any)}>
                        <SelectTrigger className="w-32">
                            <SelectValue placeholder="Filter by stage" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem label="" value="all">
                                <Text>All Stages</Text>
                            </SelectItem>
                            <SelectItem label="" value="invited">
                                <Text>Invited</Text>
                            </SelectItem>
                            <SelectItem label="" value="attended">
                                <Text>Attended</Text>
                            </SelectItem>
                            <SelectItem label="" value="discipled">
                                <Text>Discipled</Text>
                            </SelectItem>
                            <SelectItem label="" value="joined">
                                <Text>Joined Workforce</Text>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                )}

                <ToggleGroup
                    value={viewMode}
                    onValueChange={value => value && setViewMode(value as 'kanban' | 'list')}
                    variant="outline"
                    type="single"
                    className="w-max"
                >
                    <ToggleGroupItem isFirst value="kanban" aria-label="Kanban view">
                        <Icon size={22} name="th-large" type="font-awesome" color={THEME_CONFIG.gray} />
                    </ToggleGroupItem>
                    <ToggleGroupItem isLast value="list" aria-label="List view">
                        <List className="w-4 h-4 text-foreground" color="gray" />
                    </ToggleGroupItem>
                </ToggleGroup>
            </View>
        );
    };

    const getFilteredGuests = () => {
        let filtered = userGuests;

        if (searchTerm) {
            filtered = filtered?.filter(
                guest =>
                    guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    guest.phone.includes(searchTerm) ||
                    (guest.address && guest.address.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        if (stageFilter !== 'all') {
            filtered = filtered?.filter(guest => guest.assimilationStage === stageFilter);
        }

        return filtered;
    };

    const displayGuests = getFilteredGuests();
    const kanbanContainerHeight = Dimensions.get('window').height - 420; // 4rem = 64px

    return (
        <View className="flex-1">
            <ViewWrapper avoidKeyboard scroll noPadding className="flex-1">
                {/* Header with Stats */}
                <View className="gap-4 px-2 pt-4">
                    <Text className="text-2xl font-bold">My Guests</Text>
                    <View className="flex-row flex-wrap gap-3">
                        <Card className="items-center flex-1 min-w-[20%]">
                            <CardContent className="p-4">
                                <Text className="text-3xl font-bold text-blue-600 text-center">
                                    {categorizedGuests?.invited?.length ?? 0}
                                </Text>
                                <Text className="text-foreground">Invited</Text>
                            </CardContent>
                        </Card>

                        <Card className="items-center flex-1 min-w-[20%]">
                            <CardContent className="p-4">
                                <Text className="text-3xl font-bold text-green-600 text-center">
                                    {categorizedGuests?.attended?.length ?? 0}
                                </Text>
                                <Text className="text-foreground">Attended</Text>
                            </CardContent>
                        </Card>

                        <Card className="items-center flex-1 min-w-[20%]">
                            <CardContent className="p-4">
                                <Text className="text-3xl font-bold text-purple-600 text-center">
                                    {categorizedGuests?.discipled?.length ?? 0}
                                </Text>
                                <Text className="text-foreground">Discipled</Text>
                            </CardContent>
                        </Card>

                        <Card className="items-center flex-1 min-w-[20%]">
                            <CardContent className="p-4">
                                <Text className="text-3xl font-bold text-foreground text-center">
                                    {categorizedGuests?.joined?.length ?? 0}
                                </Text>
                                <Text className="text-foreground">Joined</Text>
                            </CardContent>
                        </Card>
                    </View>
                </View>

                <View className="my-6 mx-2">
                    <SearchAndFilter />
                </View>

                {/* Content */}
                {viewMode === 'kanban' ? (
                    // <ScrollView horizontal className="pl-2" showsHorizontalScrollIndicator={false}>
                    <View style={{ height: kanbanContainerHeight }}>
                        <KanbanBoard
                            guests={guests || []}
                            stages={[
                                AssimilationStage.INVITED,
                                AssimilationStage.ATTENDED,
                                AssimilationStage.DISCIPLED,
                                AssimilationStage.JOINED,
                            ]}
                        />
                    </View>
                ) : (
                    // </ScrollView>
                    <View className="flex-1">
                        <ListView displayGuests={displayGuests as Guest[]} />
                    </View>
                )}
            </ViewWrapper>
            <FloatButton iconName="plus" iconType="font-awesome-5" className="!p-2" iconClassname="!w-4 !h-4">
                Add Guest
            </FloatButton>
        </View>
    );
}

export default MyGuestsDashboard;
