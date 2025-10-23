import React, { ReactNode, Suspense, useCallback, useMemo, useState } from 'react';
import { View, Dimensions, ScrollView } from 'react-native';

import { AssimilationStage, Guest } from '~/store/types';
import {
    useGetAssimilationSubStagesQuery,
    useGetGuestsQuery,
    useGetMyGuestsCountQuery,
    useUpdateGuestMutation,
} from '~/store/services/roast-crm';

import { Text } from '~/components/ui/text';
import { FloatButton } from '~/components/atoms/button';

import { router } from 'expo-router';
import Loading from '~/components/atoms/loading';
import { columnDataType, DragEndParams, HeaderParams } from '../../../components/Kanban/types';

import ReactNativeKanbanBoard from '~/components/Kanban';
import groupBy from 'lodash/groupBy';
import SearchAndFilter from '../components/SearchAndFilter';
import StatsCard from '../components/StatsCard';

import KanbanColumn from '../components/KanbanColumn';
import KanbanUICard from '../components/KanbanCard';
const GuestListView = React.lazy(() => import('../components/GuestListView'));
const AddGuestModal = React.lazy(() => import('./AddGuest'));

import { RefreshControl } from 'react-native';
import useAssimilationStageIndex from '../hooks/use-assimilation-stage-index';
import { Skeleton } from '~/components/ui/skeleton';
import useRole from '~/hooks/role';
import useDebounce from '~/hooks/debounce/use-debounce';
import KanbanColumnSkeleton from '../components/KanbanColumnSkeleton';

function MyGuestsDashboard() {
    const { user } = useRole();
    const [search, setSearch] = useState('');
    const denouncedSearch = useDebounce(setSearch);

    const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
    const [stageFilter, setStageFilter] = useState<string | 'all'>('all');
    const [modalVisible, setModalVisible] = useState(false);

    const { data: assimilationSubStages = [], isLoading: subStagesLoading } = useGetAssimilationSubStagesQuery();
    const {
        data: guests = [],
        isLoading,
        isFetching,
        refetch,
    } = useGetGuestsQuery({ assignedToId: user?._id, search }, { pollingInterval: 20000 });
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
                        subtitle: stage.descriptions,
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
                `${guest.firstName} ${guest.lastName}`.toLowerCase().includes(search.toLowerCase())
            ),
        [guests, search]
    );

    const handleViewGuest = useCallback((guest: Guest) => {
        router.push({ pathname: '/roast-crm/guests/profile', params: guest as any });
    }, []);

    const getFilteredGuests = useCallback(() => {
        let filtered = userGuests;

        if (search) {
            filtered = filtered?.filter(
                guest =>
                    `${guest.firstName} ${guest.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
                    guest.phoneNumber.includes(search) ||
                    (guest.address && guest.address.toLowerCase().includes(search.toLowerCase()))
            );
        }

        if (stageFilter !== 'all') {
            filtered = filtered?.filter(guest => guest.assimilationSubStageId === stageFilter);
        }

        return filtered;
    }, [userGuests, search, stageFilter]);

    const onGuestUpdate = useCallback(async (guestId: string, assimilationSubStageId: string) => {
        try {
            await updateGuest({ _id: guestId, assimilationSubStageId });
        } catch (error) {}
    }, []);

    const onDragEnd = useCallback(
        async (params: DragEndParams) => {
            const { fromColumnIndex, toColumnIndex, itemId: guestId } = params;
            const assimilationSubStageId = assimilationSubStagesIndex[toColumnIndex];

            await onGuestUpdate(guestId, assimilationSubStageId as string);

            // no-op if dropped in same column
            if (fromColumnIndex === toColumnIndex) return;
        },
        [assimilationSubStagesIndex]
    );

    const handleAddGuest = useCallback(() => {
        setModalVisible(prev => !prev);
    }, [setModalVisible]);

    const renderContentContainer = useCallback(
        (child: ReactNode, props: HeaderParams) => {
            return (
                <KanbanColumn
                    title={props.title}
                    isLoading={isLoading}
                    subTitle={props.subtitle}
                    guestCount={props.count}
                    stage={assimilationStageIndex[props.stageId as string] as AssimilationStage}
                >
                    {child}
                </KanbanColumn>
            );
        },
        [isLoading, assimilationStageIndex]
    );

    const handleProfileView = (guest: Guest) => {
        router.push({ pathname: '/roast-crm/guests/profile', params: guest as any });
    };

    const displayGuests = useMemo(() => getFilteredGuests(), [getFilteredGuests]);
    const kanbanContainerHeight = Dimensions.get('window').height - 620;

    return (
        <View className="flex-1 gap-4 bg-background">
            <View>
                <ScrollView refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}>
                    <View className="gap-4">
                        {/* Header with Stats */}
                        <View className="gap-4 px-2 pt-2">
                            <Text className="text-2xl font-bold leading-none">My Guests</Text>
                            <View className="flex-row flex-wrap gap-3">
                                {loadingGuestCounts ? (
                                    <>
                                        {[...Array(4)].map((_, index) => (
                                            <Skeleton key={index} className="h-24 flex-1 rounded-2xl min-w-[20%]" />
                                        ))}
                                    </>
                                ) : (
                                    guestCounts?.count.map(stage => (
                                        <StatsCard
                                            count={stage.count}
                                            key={stage.assimilationStageId}
                                            stage={assimilationStageIndex[stage.assimilationStageId] as any}
                                        />
                                    ))
                                )}
                            </View>
                        </View>

                        <View className="mx-2">
                            <SearchAndFilter
                                viewMode={viewMode}
                                searchTerm={search}
                                stageFilter={stageFilter}
                                setSearchTerm={denouncedSearch}
                                setStageFilter={setStageFilter}
                                setViewMode={setViewMode as any}
                                loading={isFetching || isLoading}
                                assimilationSubStages={assimilationSubStages}
                            />
                        </View>
                    </View>
                </ScrollView>
            </View>
            {/* Content */}
            <View className="flex-1">
                {viewMode === 'kanban' ? (
                    subStagesLoading ? (
                        <View className="flex-row gap-5 pl-2 flex-1 pb-2">
                            <KanbanColumnSkeleton />
                            <KanbanColumnSkeleton />
                        </View>
                    ) : (
                        <ReactNativeKanbanBoard<Guest, HeaderParams>
                            gapBetweenColumns={8}
                            onDragEnd={onDragEnd}
                            onPressCard={handleProfileView}
                            columnData={transformedAssimilationSubStages}
                            columnContainerStyle={{ flex: 1 }}
                            renderColumnContainer={renderContentContainer}
                            renderItem={guest => <KanbanUICard guest={guest} />}
                        />
                    )
                ) : (
                    <Suspense fallback={<Loading cover />}>
                        <GuestListView
                            refetch={refetch}
                            isLoading={isLoading}
                            onGuestUpdate={onGuestUpdate}
                            handleViewGuest={handleViewGuest}
                            containerHeight={kanbanContainerHeight}
                            displayGuests={displayGuests as Guest[]}
                            assimilationSubStages={assimilationSubStages}
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
