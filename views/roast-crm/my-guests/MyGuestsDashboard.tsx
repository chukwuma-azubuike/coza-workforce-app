import React, { ReactNode, Suspense, useCallback, useMemo, useState } from 'react';
import { View, Dimensions, ScrollView } from 'react-native';

import { AssimilationStage, Guest } from '~/store/types';
import {
    useGetAssimilationSubStagesQuery,
    useGetMyGuestsCountQuery,
    useGetMyGuestsQuery,
    useUpdateGuestMutation,
} from '~/store/services/roast-crm';

import { Text } from '~/components/ui/text';
import { FloatButton } from '~/components/atoms/button';

import { router } from 'expo-router';
import Loading from '~/components/atoms/loading';
import { columnDataType, DragEndParams, HeaderParams } from '../../../components/Kanban/types';

import { ScreenWidth } from '@rneui/base';
import ReactNativeKanbanBoard from '~/components/Kanban';
import groupBy from 'lodash/groupBy';
import SearchAndFilter from '../components/SearchAndFilter';
import StatsCard from '../components/StatsCard';

const KanbanColumn = React.lazy(() => import('../components/KanbanColumn'));
const KanbanUICard = React.lazy(() => import('../components/KanbanCard'));
const GuestListView = React.lazy(() => import('../components/GuestListView'));
const AddGuestModal = React.lazy(() => import('./AddGuest'));

import { RefreshControl } from 'react-native';
import useAssimilationStageIndex from '../hooks/use-assimilation-stage-index';
import { Skeleton } from '~/components/ui/skeleton';

function MyGuestsDashboard() {
    const [searchTerm, setSearchTerm] = useState('');

    const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
    const [stageFilter, setStageFilter] = useState<string | 'all'>('all');
    const [modalVisible, setModalVisible] = useState(false);

    //TODO: Return for testing purposes
    const { data: assimilationSubStages = [] } = useGetAssimilationSubStagesQuery();
    const { data: guests = [], isLoading, refetch } = useGetMyGuestsQuery();
    const { data: guestCounts, isLoading: loadingGuestCounts } = useGetMyGuestsCountQuery();
    const [updateGuest] = useUpdateGuestMutation();

    const assimilationStageIndex = useAssimilationStageIndex();
    const groupedGuestsByAssimilationId = useMemo(() => groupBy<Guest>(guests, 'assimilationSubStageId'), [guests]);
    const assimilationSubStagesIndex = useMemo(
        () => Object.fromEntries(assimilationSubStages?.map((stage, index) => [index, stage._id])),
        [assimilationSubStages]
    );
    const transformedAssimilationSubStages = useMemo(
        (): columnDataType<Guest, HeaderParams>[] =>
            assimilationSubStages.map((stage, index) => {
                return {
                    index,
                    _id: stage._id,
                    stageId: stage.assimilationStageId,
                    items: groupedGuestsByAssimilationId[stage?._id] ?? [],
                    header: {
                        _id: stage._id,
                        title: stage.name,
                        position: stage.order ?? index,
                        stageId: stage.assimilationStageId,
                        count: groupedGuestsByAssimilationId[stage?._id]?.length ?? 0,
                    },
                };
            }),
        [assimilationSubStages, groupedGuestsByAssimilationId]
    );

    // Filter guests by current user and search term
    const userGuests = useMemo(
        () =>
            guests?.filter(guest =>
                `${guest.firstName} ${guest.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
            ),
        [guests, searchTerm]
    );

    const handleViewGuest = useCallback((guestId: string) => {
        router.push({ pathname: '/roast-crm/guests/profile', params: { guestId } });
    }, []);

    const getFilteredGuests = useCallback(() => {
        let filtered = userGuests;

        if (searchTerm) {
            filtered = filtered?.filter(
                guest =>
                    `${guest.firstName} ${guest.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    guest.phoneNumber.includes(searchTerm) ||
                    (guest.address && guest.address.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        if (stageFilter !== 'all') {
            filtered = filtered?.filter(guest => guest.assimilationSubStageId === stageFilter);
        }

        return filtered;
    }, [userGuests, searchTerm, stageFilter]);

    const onDragEnd = useCallback(
        async (params: DragEndParams) => {
            const { fromColumnIndex, toColumnIndex, itemId: guestId } = params;
            const assimilationSubStageId = assimilationSubStagesIndex[toColumnIndex];

            // no-op if dropped in same column
            if (fromColumnIndex === toColumnIndex) return;

            try {
                const res = await updateGuest({ _id: guestId, assimilationSubStageId });
            } catch (error) {}
        },
        [assimilationSubStagesIndex]
    );

    const handleAddGuest = () => {
        setModalVisible(prev => !prev);
    };

    const renderContentContainer = useCallback(
        (child: ReactNode, props: HeaderParams) => {
            return (
                <KanbanColumn
                    title={props.title}
                    isLoading={isLoading}
                    guestCount={props.count}
                    stage={assimilationStageIndex[props.stageId as string] as AssimilationStage}
                >
                    {child}
                </KanbanColumn>
            );
        },
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
                            {loadingGuestCounts ? (
                                <>
                                    {[...Array(4)].map(i => (
                                        <Skeleton className="h-24 flex-1 rounded-2xl min-w-[20%]" />
                                    ))}
                                </>
                            ) : (
                                guestCounts?.count.map(stage => (
                                    <StatsCard
                                        count={stage.count}
                                        key={stage.assimilationStageId}
                                        stage={assimilationStageIndex[stage.assimilationStageId]}
                                    />
                                ))
                            )}
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
                            columnData={transformedAssimilationSubStages}
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
