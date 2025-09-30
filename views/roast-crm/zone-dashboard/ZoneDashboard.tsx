import React, { ReactNode, Suspense, useCallback, useMemo, useState } from 'react';
import { Dimensions, View } from 'react-native';
import { AssimilationStage, Guest, Zone } from '~/store/types';
import {
    useGetAssimilationSubStagesQuery,
    useGetGuestsQuery,
    useGetZoneDashboardQuery,
    useGetZonesQuery,
    useGetZoneUsersQuery,
    useUpdateGuestMutation,
} from '~/store/services/roast-crm';

import { Text } from '~/components/ui/text';

import { ZoneStats } from './components/ZoneStats';
import useRole, { ROLES } from '~/hooks/role';
import Loading from '~/components/atoms/loading';

import { columnDataType, DragEndParams, HeaderParams } from '~/components/Kanban/types';

import { ScreenWidth } from '@rneui/base';
import { router } from 'expo-router';

import SearchAndFilter from '../components/SearchAndFilter';
import PickerSelect from '~/components/ui/picker-select';
import groupBy from 'lodash/groupBy';

import ReactNativeKanbanBoard from '~/components/Kanban';
import useDebounce from '~/hooks/debounce/use-debounce';
import useAssimilationStageIndex from '../hooks/use-assimilation-stage-index';
import { FloatButton } from '~/components/atoms/button';

const KanbanColumn = React.lazy(() => import('../components/KanbanColumn'));
const KanbanUICard = React.lazy(() => import('../components/KanbanCard'));
const GuestListView = React.lazy(() => import('../components/GuestListView'));
const AddGuestModal = React.lazy(() => import('../my-guests/AddGuest'));

const ZoneDashboard: React.FC = () => {
    const { role, user, isZonalCoordinator } = useRole();
    const [selectedZone, setSelectedZone] = useState<string>();
    const [selectedWorker, setSelectedWorker] = useState<string>();
    const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
    const [stageFilter, setStageFilter] = useState<Guest['assimilationSubStageId'] | 'all'>('all');

    const [search, setSearch] = useState('');
    const denouncedSearch = useDebounce(setSearch);

    const [modalVisible, setModalVisible] = useState(false);

    const { data: assimilationSubStages = [] } = useGetAssimilationSubStagesQuery();
    const {
        refetch,
        isLoading,
        isFetching,
        data: guests = [],
    } = useGetGuestsQuery({ assignedToId: selectedWorker, search, zoneId: selectedZone });
    const { data: zones = [], isLoading: loadingZones } = useGetZonesQuery({
        departmentId: isZonalCoordinator ? user?.department?._id : undefined, // Restrict zonal coordinators from loading other zones
        campusId: user.campus._id,
    });
    const [updateGuest] = useUpdateGuestMutation();
    const { data: workers = [] } = useGetZoneUsersQuery({
        zoneId: selectedZone,
        campusId: user?.campus?._id,
        page: 1,
        limit: 100,
    });

    const { data: zoneDashboard } = useGetZoneDashboardQuery({ zoneId: selectedZone });

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

    const onGuestUpdate = async (guestId: string, assimilationSubStageId: string) => {
        try {
            await updateGuest({ _id: guestId, assimilationSubStageId });
        } catch (error) {}
    };

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

    const handleAddGuest = () => {
        setModalVisible(prev => !prev);
    };

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

    const selectedZoneOption = zones.find((zone: Zone) => zone._id === selectedZone);

    return (
        <View className="flex-1 bg-background pt-2 gap-6">
            {/* Header */}
            <View className="gap-4 px-2">
                <View className="flex-row items-center gap-4">
                    <Text className="text-2xl font-bold !w-[35%]">{selectedZoneOption?.name ?? 'All Zones'}</Text>

                    {/* Zone Selector */}
                    {(role === ROLES.superAdmin || role === ROLES.campusPastor) && (
                        <View className="flex-1">
                            <PickerSelect
                                valueKey="_id"
                                items={zones}
                                labelKey="name"
                                className="!h-10"
                                value={selectedZone}
                                placeholder="All Zones"
                                isLoading={loadingZones}
                                onValueChange={setSelectedZone}
                            />
                        </View>
                    )}

                    {/* Worker Selector */}
                    <View className="flex-1">
                        <PickerSelect
                            valueKey="_id"
                            items={workers}
                            className="!h-10"
                            labelKey="firstName"
                            isLoading={isFetching}
                            value={selectedWorker}
                            placeholder="All Workers"
                            onValueChange={setSelectedWorker}
                            customLabel={({ firstName, lastName }) => `${firstName} ${lastName}`}
                        />
                    </View>
                </View>

                <ZoneStats
                    totalGuests={zoneDashboard?.totalGuests ?? 0}
                    conversionRate={zoneDashboard?.conversionRates.discipleToJoined ?? 0}
                    activeThisWeek={zoneDashboard?.totalActiveUsers ?? 0}
                    totalWorkers={zoneDashboard?.totalWorker ?? 0}
                />
            </View>

            <View className="px-2 flex-row items-center gap-2 w-full justify-between mb-1">
                <View className="flex-1">
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

            {/* View Guests */}
            <View className="flex-1">
                {viewMode === 'kanban' ? (
                    <Suspense fallback={<Loading cover />}>
                        <ReactNativeKanbanBoard<Guest, HeaderParams>
                            gapBetweenColumns={8}
                            onDragEnd={onDragEnd}
                            onPressCard={handleProfileView}
                            columnWidth={ScreenWidth - 80}
                            columnContainerStyle={{ flex: 1 }}
                            columnData={transformedAssimilationSubStages}
                            renderColumnContainer={renderContentContainer}
                            renderItem={guest => <KanbanUICard guest={guest} />}
                        />
                    </Suspense>
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
};

export default ZoneDashboard;
