import React, { Suspense, useCallback, useMemo, useState } from 'react';
import { View, Dimensions } from 'react-native';
import { Search, List } from 'lucide-react-native';
import { Card, CardContent } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '~/components/ui/toggle-group';

import { AssimilationStage, Guest } from '~/store/types';
import { useGetGuestsQuery } from '~/store/services/roast-crm';
import useRole from '~/hooks/role';
import { THEME_CONFIG } from '~/config/appConfig';
import { Icon } from '@rneui/themed';
import ViewWrapper from '~/components/layout/viewWrapper';
import { Text } from '~/components/ui/text';
import { FloatButton } from '~/components/atoms/button';
import PickerSelect from '~/components/ui/picker-select';
import { router } from 'expo-router';
import Loading from '~/components/atoms/loading';
const GuestListView = React.lazy(() => import('./GuestListView'));

const KanbanBoard = React.lazy(() => import('./KanbanBoard'));
const AddGuestModal = React.lazy(() => import('./AddGuest'));

function MyGuestsDashboard() {
    const { user: currentUser } = useRole();
    const [searchTerm, setSearchTerm] = useState('');

    const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
    const [stageFilter, setStageFilter] = useState<Guest['assimilationStage'] | 'all'>('all');
    const [modalVisible, setModalVisible] = useState(false);

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
        router.push({ pathname: '/roast-crm/guests/profile', params: { guestId } });
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

    const handleAddGuest = () => {
        setModalVisible(prev => !prev);
    };

    const displayGuests = useMemo(() => getFilteredGuests(), [getFilteredGuests]);
    const kanbanContainerHeight = Dimensions.get('window').height - 620;

    return (
        <View className="flex-1 bg-background">
            <View className="flex-auto">
                <ViewWrapper avoidKeyboard scroll onRefresh={refetch} noPadding className="flex-1 mb-0">
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
            </View>

            {/* Content */}
            <View
                style={{
                    height: kanbanContainerHeight,
                }}
                className="flex-auto"
            >
                {viewMode === 'kanban' ? (
                    <Suspense fallback={<Loading cover />}>
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
                    </Suspense>
                ) : (
                    <Suspense fallback={<Loading cover />}>
                        <GuestListView
                            refetch={refetch}
                            isLoading={isLoading}
                            handleViewGuest={handleViewGuest}
                            containerHeight={kanbanContainerHeight}
                            displayGuests={displayGuests as Guest[]}
                        />
                    </Suspense>
                )}
            </View>

            <FloatButton
                iconName="plus"
                className="!p-2"
                onPress={handleAddGuest}
                iconType="font-awesome-5"
                iconClassname="!w-4 !h-4"
            >
                Add Guest
            </FloatButton>

            <Suspense fallback={<Text>...</Text>}>
                <AddGuestModal modalVisible={modalVisible} setModalVisible={handleAddGuest} />
            </Suspense>
        </View>
    );
}

export default MyGuestsDashboard;
