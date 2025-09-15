import React, { useCallback, useMemo, useState } from 'react';
import { View, Linking, Dimensions, TouchableOpacity } from 'react-native';
import { Phone, MessageCircle, Search, List, MoreVertical, Clock } from 'lucide-react-native';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Badge } from '~/components/ui/badge';
import { Avatar, AvatarFallback } from '~/components/ui/avatar';
import { ToggleGroup, ToggleGroupItem } from '~/components/ui/toggle-group';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import FlatListComponent from '@components/composite/flat-list';

// import { toast } from 'sonner';

import { AssimilationStage, Guest, MilestoneStatus } from '~/store/types';
import { useGetGuestsQuery } from '~/store/services/roast-crm';
import useRole from '~/hooks/role';
import { THEME_CONFIG } from '~/config/appConfig';
import { Icon } from '@rneui/themed';
import ViewWrapper from '~/components/layout/viewWrapper';
import { Text } from '~/components/ui/text';
import { FloatButton } from '~/components/atoms/button';
import KanbanBoard from './KanbanBoard';
import PickerSelect from '~/components/ui/picker-select';
import { router } from 'expo-router';

export const GuestRow: React.FC<{ guest: Guest; index: number; onViewGuest: (guestId: string) => void }> = ({
    guest,
    onViewGuest,
}) => {
    const handleCall = () => {
        Linking.openURL(`tel:${guest.phone}`);
    };

    const handleWhatsApp = () => {
        Linking.openURL(`https://wa.me/${guest.phone.replace(/\D/g, '')}`);
    };

    const getProgressPercentage = useCallback((milestones: Guest['milestones']) => {
        if (!milestones || milestones.length === 0) return 0;
        const completed = milestones.filter(m => m.status === MilestoneStatus.COMPLETED).length;
        return Math.round((completed / milestones.length) * 100);
    }, []);

    const getDaysSinceContact = useCallback((lastContact: Date | undefined | null) => {
        if (!lastContact) return null;
        const today = new Date();
        const contactDate = new Date(lastContact);
        const diffTime = today.getTime() - contactDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }, []);

    const handleGuestMove = (guestId: string, newStage: Guest['assimilationStage']) => {
        // TODO: Update guest stage in backend
        // setGuests(prev =>
        //     prev.map(guest => (guest._id === guestId ? { ...guest, stage: newStage, lastContact: new Date() } : guest))
        // );
        // toast.success(`Guest moved to ${newStage} stage`);
    };

    const progress = useMemo(() => getProgressPercentage(guest.milestones), [guest.milestones, getProgressPercentage]);
    const daysSinceContact = useMemo(
        () => getDaysSinceContact(guest?.lastContact as any),
        [guest?.lastContact, getDaysSinceContact]
    );

    return (
        <View className="py-4 w-full border-t border-t-border">
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

                <View className="flex-row gap-4 items-center">
                    <PickerSelect
                        valueKey="value"
                        labelKey="label"
                        value={guest?.assimilationStage}
                        className="!w-28 !h-10"
                        items={[
                            { label: 'All', value: 'all' },
                            { label: 'Invited', value: 'invited' },
                            { label: 'Attended', value: 'attended' },
                            { label: 'Discipled', value: 'discipled' },
                            { label: 'Joined', value: 'joined' },
                        ]}
                        placeholder="Select stage"
                        onValueChange={value => handleGuestMove(guest._id, value)}
                    />
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
                </View>
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
                        <Button size="sm" variant="outline" className="h-6 px-2" onPress={handleCall}>
                            <Phone className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="h-6 px-2" onPress={handleWhatsApp}>
                            <MessageCircle className="w-3 h-3" />
                        </Button>
                    </View>
                </View>
            </View>
        </View>
    );
};

function MyGuestsDashboard() {
    const { user: currentUser } = useRole();
    const [searchTerm, setSearchTerm] = useState('');

    const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
    const [stageFilter, setStageFilter] = useState<Guest['assimilationStage'] | 'all'>('all');

    const { data: guests, isLoading, refetch } = useGetGuestsQuery({ workerId: currentUser._id, zoneId: '' });

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

    const handleViewGuest = (guestId: string) => {
        router.push({ pathname: '/(roast-crm)/guests/profile', params: { guestId } });
    };

    const ListView = ({ displayGuests }: { displayGuests: Guest[] }) => {
        const renderItemComponent = useCallback(
            ({ item }: { item: any; index: number }) => (
                <GuestRow onViewGuest={handleViewGuest} guest={item} index={0} />
            ),
            [GuestRow, handleViewGuest]
        );

        return (
            <View className="px-2 flex-1">
                <View className="flex-row items-center justify-between">
                    <Text className="font-semibold">My Guests</Text>
                    <Badge variant="outline">
                        <Text className="text-base">{displayGuests?.length} guests</Text>
                    </Badge>
                </View>

                <FlatListComponent
                    itemHeight={231.7}
                    onRefresh={refetch}
                    data={displayGuests}
                    isLoading={isLoading}
                    refreshing={isLoading}
                    style={{ height: kanbanContainerHeight }}
                    renderItemComponent={renderItemComponent}
                    ListFooterComponentStyle={{ marginVertical: 20 }}
                />
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
                    <PickerSelect
                        valueKey="value"
                        labelKey="label"
                        value={stageFilter}
                        className="!w-28 !h-10"
                        items={[
                            { label: 'All', value: 'all' },
                            { label: 'Invited', value: 'invited' },
                            { label: 'Attended', value: 'attended' },
                            { label: 'Discipled', value: 'discipled' },
                            { label: 'Joined', value: 'joined' },
                        ]}
                        placeholder="Select stage"
                        onValueChange={setStageFilter}
                    />
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

    const getFilteredGuests = useCallback(() => {
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
    }, [userGuests, searchTerm, stageFilter]);

    const displayGuests = useMemo(() => getFilteredGuests(), [getFilteredGuests]);
    const kanbanContainerHeight = Dimensions.get('window').height - 406;

    return (
        <View className="flex-1 bg-background">
            <ViewWrapper avoidKeyboard scroll onRefresh={refetch} noPadding className="flex-1  mb-0">
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

                <View className="mt-6 mx-2">
                    <SearchAndFilter />
                </View>
            </ViewWrapper>

            {/* Content */}
            <View style={{ height: kanbanContainerHeight }}>
                {viewMode === 'kanban' ? (
                    <KanbanBoard
                        isLoading={isLoading}
                        guests={guests || []}
                        stages={[
                            AssimilationStage.INVITED,
                            AssimilationStage.ATTENDED,
                            AssimilationStage.DISCIPLED,
                            AssimilationStage.JOINED,
                        ]}
                    />
                ) : (
                    <ListView displayGuests={displayGuests as Guest[]} />
                )}
            </View>

            <FloatButton iconName="plus" iconType="font-awesome-5" className="!p-2" iconClassname="!w-4 !h-4">
                Add Guest
            </FloatButton>
        </View>
    );
}

export default MyGuestsDashboard;
