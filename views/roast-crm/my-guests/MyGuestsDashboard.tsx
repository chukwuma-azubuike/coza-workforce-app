import React, { ReactNode, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { View, Dimensions, ScrollView } from 'react-native';

import { AssimilationStage, AssimilationStagePosition, Guest } from '~/store/types';
import { useGetGuestsQuery } from '~/store/services/roast-crm';
import useRole from '~/hooks/role';

import { Text } from '~/components/ui/text';
import { FloatButton } from '~/components/atoms/button';

import { router } from 'expo-router';
import Loading from '~/components/atoms/loading';
import { columnDataType, HeaderParams } from '../../../components/Kanban/types';

import { ScreenWidth } from '@rneui/base';
import ReactNativeKanbanBoard from '~/components/Kanban';
import groupBy from 'lodash/groupBy';
import SearchAndFilter from '../components/SearchAndFilter';
import StatsCard from '../components/StatsCard';

const KanbanColumn = React.lazy(() => import('../components/KanbanColumn'));
const KanbanUICard = React.lazy(() => import('../components/KanbanCard'));
const GuestListView = React.lazy(() => import('../components/GuestListView'));
const AddGuestModal = React.lazy(() => import('./AddGuest'));

import { assimilationStages } from '../data/assimilationStages';
import { RefreshControl } from 'react-native';

function MyGuestsDashboard() {
    const { user: currentUser } = useRole();
    const [searchTerm, setSearchTerm] = useState('');

    const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
    const [stageFilter, setStageFilter] = useState<Guest['assimilationStage'] | 'all'>('all');
    const [modalVisible, setModalVisible] = useState(false);

    const { data: guests = [], isLoading, refetch } = useGetGuestsQuery({ workerId: currentUser._id, zoneId: '' });

    // Filter guests by current user and search term
    const userGuests = useMemo(
        () => guests?.filter(guest => guest.name.toLowerCase().includes(searchTerm.toLowerCase())),
        [guests, searchTerm]
    );

    const [statefulUserGuests, setStatefulUserGuests] = useState<Guest[]>(userGuests);

    // Categorize guests by stage
    const categorizedGuests = {
        all: statefulUserGuests,
        invited: useMemo(
            () => statefulUserGuests?.filter(guest => guest.assimilationStage === AssimilationStage.INVITED),
            [statefulUserGuests]
        ),
        attended: useMemo(
            () => statefulUserGuests?.filter(guest => guest.assimilationStage.includes('attended')),
            [statefulUserGuests]
        ),
        MGI: useMemo(
            () => statefulUserGuests?.filter(guest => guest.assimilationStage === AssimilationStage.MGI),
            [statefulUserGuests]
        ),
        joined: useMemo(
            () => statefulUserGuests?.filter(guest => guest.assimilationStage === AssimilationStage.JOINED),
            [statefulUserGuests]
        ),
    };

    const handleViewGuest = useCallback((guestId: string) => {
        router.push({ pathname: '/roast-crm/guests/profile', params: { guestId } });
    }, []);

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

    const mappedGuests: columnDataType<Guest, HeaderParams>[] = useMemo(
        () =>
            Object.entries(groupBy<Guest>(guests, 'assimilationStage'))?.map(([key, value]) => {
                return {
                    header: {
                        title: key,
                        subtitle: '',
                        count: value?.length,
                        position: AssimilationStagePosition[key as any] as unknown as number,
                    },
                    items: value.map(val => {
                        return { ...val, id: val._id };
                    }),
                };
            }),
        [guests]
    );

    const [statefulMappedGuests, setMappedGuests] = useState<columnDataType<Guest, HeaderParams>[]>(assimilationStages);

    const onDragEnd = useCallback((params: { fromColumnIndex: number; toColumnIndex: number; itemId: string }) => {
        const { fromColumnIndex, toColumnIndex, itemId } = params;

        // no-op if dropped in same column
        if (fromColumnIndex === toColumnIndex) return;

        setMappedGuests(prev => {
            // create shallow copy of columns
            const next = prev.map(c => ({ ...c, items: [...c.items] }));

            // find and remove the item from source column
            const sourceItems = next[fromColumnIndex].items;
            const itemIndex = sourceItems.findIndex(it => it._id === itemId || it.id === itemId);
            if (itemIndex === -1) return prev; // item not found - keep previous

            const [removed] = sourceItems.splice(itemIndex, 1);

            // compute new stage name from destination column's header
            const destStage = next[toColumnIndex]?.header?.title as Guest['assimilationStage'];

            // create updated item with new assimilationStage
            const updatedRemoved: Guest = {
                ...removed,
                assimilationStage: destStage,
            };

            // append to destination column (change to unshift or splice to insert at other position)
            next[toColumnIndex].items.push(updatedRemoved);

            // update flattened stateful users so UI and derived lists reflect the change
            setStatefulUserGuests(next.flatMap(stage => stage.items));

            return next;
        });
    }, []);

    const handleAddGuest = () => {
        setModalVisible(prev => !prev);
    };

    useEffect(() => {
        if (
            statefulMappedGuests &&
            statefulMappedGuests[0]?.items.length < 1 &&
            mappedGuests &&
            mappedGuests.length > 0
        ) {
            // Concatenate only the stages that are not present in the mapped guest headers
            setMappedGuests(
                assimilationStages
                    .filter(stage => !mappedGuests.map(guests => guests.header.title).includes(stage.header.title))
                    .concat(mappedGuests)
                    .sort((a, b) => a.header.position - b.header.position)
            );
        }
    }, [statefulMappedGuests, mappedGuests, assimilationStages]);

    useEffect(() => {
        if (statefulUserGuests && statefulMappedGuests[0]?.items.length < 1 && guests && guests?.length > 1) {
            setStatefulUserGuests(guests);
        }
    }, [guests]);

    const renderContentContainer = useCallback(
        (child: ReactNode, props: HeaderParams) => (
            <KanbanColumn
                title={props.title}
                isLoading={isLoading}
                guestCount={props.count}
                stage={props.title as AssimilationStage}
            >
                {child}
            </KanbanColumn>
        ),
        [isLoading]
    );

    const handleProfileView = (guest: Guest) => {
        router.push({ pathname: '/roast-crm/guests/profile', params: guest as any });
    };

    const displayGuests = useMemo(() => getFilteredGuests(), [getFilteredGuests]);
    const kanbanContainerHeight = Dimensions.get('window').height - 620;

    return (
        <View className="flex-1 bg-background">
            <View className="h-[15.3rem]">
                <ScrollView
                    className="mb-0"
                    refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
                >
                    {/* Header with Stats */}
                    <View className="gap-4 px-2 pt-2">
                        <Text className="text-2xl font-bold">My Guests</Text>
                        <View className="flex-row flex-wrap gap-3">
                            <StatsCard stage={AssimilationStage.INVITED} count={categorizedGuests?.invited?.length} />
                            <StatsCard stage={'attended' as any} count={categorizedGuests?.attended?.length} />
                            <StatsCard stage={AssimilationStage.MGI} count={categorizedGuests?.MGI?.length} />
                            <StatsCard stage={AssimilationStage.JOINED} count={categorizedGuests?.joined?.length} />
                        </View>
                    </View>

                    <View className="mt-6 mx-2">
                        <SearchAndFilter
                            viewMode={viewMode}
                            searchTerm={searchTerm}
                            stageFilter={stageFilter}
                            setSearchTerm={setSearchTerm}
                            setStageFilter={setStageFilter}
                            setViewMode={setViewMode as any}
                        />
                    </View>
                </ScrollView>
            </View>
            {/* Content */}
            <View className="flex-1 bg-red-30">
                {viewMode === 'kanban' ? (
                    <Suspense fallback={<Loading cover />}>
                        <ReactNativeKanbanBoard<Guest, HeaderParams>
                            gapBetweenColumns={8}
                            onDragEnd={onDragEnd}
                            onPressCard={handleProfileView}
                            columnWidth={ScreenWidth - 80}
                            columnData={statefulMappedGuests}
                            columnContainerStyle={{ flex: 1 }}
                            renderColumnContainer={renderContentContainer}
                            renderItem={guest => <KanbanUICard guest={guest} />}
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

            <Suspense fallback={null}>
                <AddGuestModal modalVisible={modalVisible} setModalVisible={handleAddGuest} />
            </Suspense>
        </View>
    );
}

export default MyGuestsDashboard;
