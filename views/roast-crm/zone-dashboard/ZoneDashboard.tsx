import React, {
    // ReactNode,
    Suspense,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { Pressable, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { Card, CardContent } from '~/components/ui/card';
import {
    // AssimilationStage,
    Guest,
} from '~/store/types';
import {
    useGetActiveWorkersQuery,
    useGetAssimilationStagesQuery,
    useGetAssimilationSubStagesQuery,
    useGetGuestsQuery,
    useGetInactiveWorkersQuery,
    useGetZeroEngagementWorkersQuery,
    useGetZoneDashboardQuery,
    useGetZonesQuery,
    useGetZoneUsersQuery,
    useReassignGuestMutation,
    useUpdateGuestMutation,
} from '~/store/services/roast-crm';
import useInfiniteData from '~/hooks/fetch-more-data/use-infinite-data';
import type { GetGuestPayload } from '~/store/types/roast-crm';

import { Text } from '~/components/ui/text';

import { AssimilationFunnel, StatCard, ZoneStats } from './components/ZoneStats';
import useRole from '~/hooks/role';
import Loading from '~/components/atoms/loading';

// import {
// columnDataType,
//     DragEndParams,
//     HeaderParams,
// } from '~/components/Kanban/types';

import { router } from 'expo-router';

import SearchAndFilter from '../components/SearchAndFilter';
import { BulkActions } from './components/BulkActions';
import PickerSelect from '~/components/ui/picker-select';
// import groupBy from 'lodash/groupBy';

// import ReactNativeKanbanBoard from '~/components/Kanban';
import useDebounce from '~/hooks/debounce/use-debounce';
// import useAssimilationStageIndex from '../hooks/use-assimilation-stage-index';
import { FloatButton } from '~/components/atoms/button';
import useZoneIndex from '../hooks/use-zone-index';
// import KanbanColumnSkeleton from '../components/KanbanColumnSkeleton';

// import KanbanColumn from '../components/KanbanColumn';
// import KanbanUICard from '../components/KanbanCard';
// import Error from '~/components/atoms/error';

// import { useGetCampusesQuery } from '~/store/services/campus';

const GuestListView = React.lazy(() => import('../components/GuestListView'));
const AddGuestModal = React.lazy(() => import('../my-guests/AddGuest'));

const ZoneDashboard: React.FC = () => {
    const { user, isZonalCoordinator, isHOD, isAHOD } = useRole();
    const hasZoneRights = isZonalCoordinator || isHOD || isAHOD;
    const { data: departmentZones } = useGetZonesQuery({ departmentId: user.department._id }); //TODO: departmentId query param is yet to work
    const [selectedCampus, setSelectedCampus] = useState<string | undefined>();
    // Undefined = "All Zones". Zone-scoped roles (below) always get pinned to a real zone instead.
    const [selectedZone, setSelectedZone] = useState<string | undefined>();

    const userZones = useMemo(() => {
        // Only return zones that include the user's department id in their `departments` array

        return (
            departmentZones?.filter(zone =>
                zone.departments?.some(dep => dep?.id === user.department._id || dep?._id === user.department._id)
            ) ?? []
        );
    }, [departmentZones, hasZoneRights, user.department?._id]);

    const handleSelectZone = (value: any) => {
        // Prevent zonal coordinators from deselecting their zone and loading all zones
        if (hasZoneRights && value === 'null') {
            return;
        }
        setSelectedZone(value === 'null' ? undefined : value);
    };

    useEffect(() => {
        // Only zone-scoped roles get force-selected into a zone - everyone else defaults to "All Zones".
        if (hasZoneRights && !selectedZone && userZones.length) {
            setSelectedZone((userZones as any)?.[0]?._id);
        }
    }, [hasZoneRights, userZones, selectedZone]);

    const [selectedWorker, setSelectedWorker] = useState<string>();
    const [
        ,
        // viewMode
        setViewMode,
    ] = useState<'kanban' | 'list'>('kanban');
    const [stageFilter, setStageFilter] = useState<Guest['assimilationSubStageId'] | 'all'>('all');
    const [stageIdFilter, setStageIdFilter] = useState<string | undefined>();

    const handleSubStageFilterChange = useCallback((value: Guest['assimilationSubStageId'] | 'all') => {
        setStageFilter(value);
        setStageIdFilter(undefined);
    }, []);

    const handleSelectAssimilationStage = useCallback((stageId: string | undefined) => {
        setStageIdFilter(stageId);
        setStageFilter('all');
    }, []);

    const [search, setSearch] = useState('');
    const denouncedSearch = useDebounce(setSearch);
    const [modalVisible, setModalVisible] = useState(false);

    const [bulkReassignMode, setBulkReassignMode] = useState(false);
    const [selectedGuests, setSelectedGuests] = useState<string[]>([]);
    const [reassignGuest] = useReassignGuestMutation();

    const handleBulkReassignStart = useCallback(() => {
        setBulkReassignMode(true);
    }, []);

    const handleBulkReassignCancel = useCallback(() => {
        setBulkReassignMode(false);
        setSelectedGuests([]);
    }, []);

    const handleToggleSelectGuest = useCallback((guestId: string) => {
        setSelectedGuests(prev => (prev.includes(guestId) ? prev.filter(id => id !== guestId) : [...prev, guestId]));
    }, []);

    const handleBulkWorkerSelect = useCallback(
        async (toWorkerId: string) => {
            await Promise.allSettled(
                selectedGuests.map(guestId => reassignGuest({ guestId, toWorkerId }).unwrap())
            );
            setBulkReassignMode(false);
            setSelectedGuests([]);
        },
        [selectedGuests, reassignGuest]
    );

    const { data: assimilationStagesRaw = [] } = useGetAssimilationStagesQuery();
    const assimilationStages = useMemo(
        () => [...assimilationStagesRaw].sort((a, b) => a.order - b.order),
        [assimilationStagesRaw]
    );
    const {
        data: assimilationSubStages = [],
        // isLoading: subStagesLoading,
        // error: subStagesError,
    } = useGetAssimilationSubStagesQuery();
    const {
        refetch,
        isLoading,
        isFetching,
        hasNextPage,
        fetchNextPage,
        pagination,
        isFetchingNextPage,
        data: guests,
    } = useInfiniteData<Guest, GetGuestPayload>(
        {
            limit: 20,
            search,
            assignedToId: selectedWorker,
            zoneId: selectedZone ?? undefined,
            assimilationStageId: stageIdFilter,
            assimilationSubStageId: stageFilter === 'all' ? undefined : stageFilter,
        },
        useGetGuestsQuery as any,
        '_id'
    );

    // const { data: campuses = [], isLoading: loadingCampuses } = useGetCampusesQuery();
    const { data: zones = [], isLoading: loadingZones } = useGetZonesQuery({
        // departmentId: hasZoneRights ? user?.department?._id : undefined, // Restrict zonal coordinators from loading other zones
        campusId: selectedCampus ?? user?.campus?._id,
    });

    const [updateGuest] = useUpdateGuestMutation();
    const {
        data: workers = [],
        isLoading: loadingWorkers,
        isFetching: fetchingWorkers,
    } = useGetZoneUsersQuery({
        zoneId: selectedZone,
        campusId: user?.campus?._id,
        page: 1,
        limit: 100,
    });

    const { data: zoneDashboard } = useGetZoneDashboardQuery({ zoneId: selectedZone });

    const zoneIndex = useZoneIndex();
    const selectedZoneName = zoneIndex[selectedZone as string];

    const { data: activeWorkers = [] } = useGetActiveWorkersQuery(
        { zoneId: selectedZone as string },
        { skip: !selectedZone }
    );
    const { data: inactiveWorkers = [] } = useGetInactiveWorkersQuery(
        { zoneId: selectedZone as string },
        { skip: !selectedZone }
    );
    const { data: zeroEngagementWorkers = [] } = useGetZeroEngagementWorkersQuery({ zoneId: selectedZone });

    const handleViewZoneWorkers = useCallback(
        (filter: 'active' | 'inactive' | 'zero-engagement') => {
            router.push({
                pathname: '/roast-crm/zone-workers',
                params: { filter, zoneId: selectedZone, zoneName: selectedZoneName },
            });
        },
        [selectedZone, selectedZoneName]
    );

    // const assimilationStageIndex = useAssimilationStageIndex();
    // const groupedGuestsByAssimilationId = useMemo(() => groupBy<Guest>(guests?.data, 'assimilationSubStageId'), [guests?.data]);
    // const assimilationSubStagesIndex = useMemo(
    //     () => Object.fromEntries(assimilationSubStages?.map((stage, index) => [index, stage._id])),
    //     [assimilationSubStages]
    // );

    // const transformedAssimilationSubStages = useMemo(
    //     (): columnDataType<Guest, HeaderParams>[] =>
    //         assimilationSubStages.map((stage, index) => {
    //             return {
    //                 index,
    //                 _id: stage._id,
    //                 stageId: stage.assimilationStageId,
    //                 items: groupedGuestsByAssimilationId[stage?._id] ?? [],
    //                 header: {
    //                     _id: stage._id,
    //                     title: stage.name,
    //                     subtitle: stage.descriptions,
    //                     position: stage.order ?? index,
    //                     stageId: stage.assimilationStageId,
    //                     count: groupedGuestsByAssimilationId[stage?._id]?.length ?? 0,
    //                 },
    //             };
    //         }),
    //     [assimilationSubStages, groupedGuestsByAssimilationId]
    // );

    // Search, worker and stage filtering are applied server-side (see useInfiniteData params above),
    // so the paginated `guests` list is already the data we render.

    const handleViewGuest = useCallback((guest: Guest) => {
        router.push({ pathname: '/roast-crm/guests/profile', params: guest as any });
    }, []);

    const onGuestUpdate = useCallback(async (guestId: string, assimilationSubStageId: string) => {
        try {
            await updateGuest({ _id: guestId, assimilationSubStageId });
        } catch (error) { }
    }, []);

    // const onDragEnd = useCallback(
    //     async (params: DragEndParams) => {
    //         const { fromColumnIndex, toColumnIndex, itemId: guestId } = params;
    //         const assimilationSubStageId = assimilationSubStagesIndex[toColumnIndex];

    //         await onGuestUpdate(guestId, assimilationSubStageId as string);

    //         // no-op if dropped in same column
    //         if (fromColumnIndex === toColumnIndex) return;
    //     },
    //     [assimilationSubStagesIndex]
    // );

    const handleAddGuest = () => {
        setModalVisible(prev => !prev);
    };

    // const renderContentContainer = useCallback(
    //     (child: ReactNode, props: HeaderParams) => {
    //         return (
    //             <KanbanColumn
    //                 title={props.title}
    //                 isLoading={isLoading}
    //                 subTitle={props.subtitle}
    //                 guestCount={props.count}
    //                 stage={assimilationStageIndex[props.stageId as string] as AssimilationStage}
    //             >
    //                 {child}
    //             </KanbanColumn>
    //         );
    //     },
    //     [isLoading, assimilationStageIndex]
    // );

    // const handleProfileView = useCallback((guest: Guest) => {
    //     router.push({ pathname: '/roast-crm/guests/profile', params: guest as any });
    // }, []);

    const dashboardHeader = (
        <View className="gap-4 pb-3">
            <View className="flex-row items-start gap-4">
                {/* Campus Selector */}
                {/* TODO: Restore on full roll out */}
                {/* {!hasZoneRights && (
                    <View className="flex-1">
                        <PickerSelect
                            valueKey="_id"
                            labelKey="campusName"
                            className="!h-10"
                            value={selectedCampus}
                            placeholder="All Campuses"
                            isLoading={loadingCampuses}
                            onValueChange={setSelectedCampus}
                            items={campuses}
                        />
                    </View>
                )} */}

                {/* Zone Selector */}
                <View className="flex-1">
                    <PickerSelect
                        valueKey="_id"
                        labelKey="name"
                        className="!h-10"
                        disabled={hasZoneRights}
                        value={selectedZone}
                        placeholder="All Zones"
                        isLoading={loadingZones}
                        onValueChange={handleSelectZone}
                        items={hasZoneRights ? (userZones ?? []) : [{ _id: 'null', name: 'All Zones' }, ...zones]}
                    />
                </View>

                {/* Worker Selector */}
                <View className="flex-1">
                    <PickerSelect
                        valueKey="_id"
                        items={workers}
                        className="!h-10"
                        labelKey="firstName"
                        value={selectedWorker}
                        placeholder="All Workers"
                        onValueChange={setSelectedWorker}
                        isLoading={loadingWorkers || fetchingWorkers}
                        customLabel={({ firstName, lastName }) => `${firstName} ${lastName}`}
                    />
                </View>
            </View>

            <View className="gap-1.5">
                <Text className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Overview</Text>
                <ZoneStats
                    totalGuests={zoneDashboard?.totalGuests ?? 0}
                    totalWorkers={zoneDashboard?.totalWorker ?? 0}
                />
            </View>

            {!!selectedZone && (
                <View className="gap-4">
                    <Text className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        Workers
                    </Text>
                    <View className="flex-row flex-wrap gap-4">
                        <View className="flex-1">
                            <StatCard
                                value={activeWorkers.length}
                                label="Active this week"
                                color="text-green-600"
                                onPress={() => handleViewZoneWorkers('active')}
                            />
                        </View>
                        <View className="flex-1">
                            <StatCard
                                value={inactiveWorkers.length}
                                label="Inactive this week"
                                color="text-red-600"
                                onPress={() => handleViewZoneWorkers('inactive')}
                            />
                        </View>
                    </View>

                    {zeroEngagementWorkers.length > 0 && (
                        <Pressable onPress={() => handleViewZoneWorkers('zero-engagement')}>
                            <Card className="border-amber-400 dark:border-amber-500/40">
                                <CardContent className="p-4 flex-row items-center justify-between">
                                    <View>
                                        <Text className="font-semibold">Needs Attention</Text>
                                        <Text className="text-muted-foreground">
                                            {zeroEngagementWorkers.length} worker
                                            {zeroEngagementWorkers.length === 1 ? '' : 's'} with zero engagement
                                        </Text>
                                    </View>
                                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                </CardContent>
                            </Card>
                        </Pressable>
                    )}
                </View>
            )}

            <View className="gap-1.5">
                <Text className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Guests by Stage</Text>
                <AssimilationFunnel
                    stages={assimilationStages}
                    breakdown={zoneDashboard?.conversionRates?.breakdown}
                    selectedStageId={stageIdFilter}
                    onSelectStage={handleSelectAssimilationStage}
                />
            </View>

            <View className="flex-row items-center gap-2 w-full justify-between">
                <View className="flex-1">
                    <SearchAndFilter
                        viewMode="list"
                        searchTerm={search}
                        showSelector={false}
                        showModeToggle={false}
                        stageFilter={stageFilter}
                        setSearchTerm={denouncedSearch}
                        setStageFilter={handleSubStageFilterChange}
                        setViewMode={setViewMode as any}
                        loading={isFetching || isLoading}
                        assimilationSubStages={assimilationSubStages}
                    />
                </View>
                {hasZoneRights && (
                    <BulkActions
                        workers={workers}
                        bulkReassignMode={bulkReassignMode}
                        selectedGuests={selectedGuests}
                        onWorkerSelect={handleBulkWorkerSelect}
                        onBulkReassignStart={handleBulkReassignStart}
                        onBulkReassignCancel={handleBulkReassignCancel}
                    />
                )}
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-background pt-2">
            <Suspense fallback={<Loading cover />}>
                <GuestListView
                    type="zone"
                    refetch={refetch}
                    isLoading={isLoading}
                    hasNextPage={hasNextPage}
                    onGuestUpdate={onGuestUpdate}
                    fetchNextPage={fetchNextPage}
                    total={pagination?.total ?? 0}
                    handleViewGuest={handleViewGuest}
                    displayGuests={guests as Guest[]}
                    isFetchingNextPage={isFetchingNextPage}
                    assimilationSubStages={assimilationSubStages}
                    selectionMode={bulkReassignMode}
                    selectedIds={selectedGuests}
                    onToggleSelect={handleToggleSelectGuest}
                    ListHeaderComponent={dashboardHeader}
                />
            </Suspense>
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
