import { useCallback, useEffect, useMemo, useState } from 'react';
import { InteractionManager, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Tabs, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { Text } from '~/components/ui/text';
import PickerSelect from '~/components/ui/picker-select';
import { FlatListSkeleton } from '~/components/layout/skeleton';
import useRole from '~/hooks/role';
import useDebounce from '~/hooks/debounce/use-debounce';
import useInfiniteData from '~/hooks/fetch-more-data/use-infinite-data';
import SearchAndFilter from '../components/SearchAndFilter';
import GuestListView from '../components/GuestListView';
import { BulkActions } from '../zone-dashboard/components/BulkActions';
import {
    useGetAssimilationStagesQuery,
    useGetAssimilationSubStagesQuery,
    useGetGuestsQuery,
    useGetZoneUsersQuery,
    useReassignGuestMutation,
    useUpdateGuestMutation,
} from '~/store/services/roast-crm';
import type { Guest } from '~/store/types';
import type { GetGuestPayload } from '~/store/types/roast-crm';

const ALL_WORKERS = 'all';

export function ZoneGuests() {
    const { zoneId, stageId } = useLocalSearchParams<{
        zoneId?: string;
        zoneName?: string;
        stageId?: string;
    }>();
    const { user, isZonalCoordinator, isHOD, isAHOD } = useRole();
    const hasZoneRights = isZonalCoordinator || isHOD || isAHOD;

    // Nothing that costs a frame runs until the push animation has settled - the list and its
    // queries are the expensive part, and mounting them during the transition is what made
    // tapping a stage pill feel laggy.
    const [interactionsDone, setInteractionsDone] = useState(false);
    useEffect(() => {
        const handle = InteractionManager.runAfterInteractions(() => setInteractionsDone(true));
        return () => handle.cancel();
    }, []);

    const { data: assimilationStagesRaw = [] } = useGetAssimilationStagesQuery();
    const assimilationStages = useMemo(
        () => [...assimilationStagesRaw].sort((a, b) => a.order - b.order),
        [assimilationStagesRaw]
    );
    const { data: assimilationSubStages = [] } = useGetAssimilationSubStagesQuery();

    const [activeTab, setActiveTab] = useState<string | undefined>(stageId);
    // The tapped stage arrives as a route param, so the correct tab is known on first render -
    // no need to block the screen waiting for the stages list to resolve.
    const currentTab = activeTab ?? stageId ?? assimilationStages[0]?._id;

    const [selectedWorker, setSelectedWorker] = useState<string>(ALL_WORKERS);
    const [stageFilter, setStageFilter] = useState<Guest['assimilationSubStageId'] | 'all'>('all');
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(setSearch);
    const [, setViewMode] = useState<'kanban' | 'list'>('list');

    const [bulkReassignMode, setBulkReassignMode] = useState(false);
    const [selectedGuests, setSelectedGuests] = useState<string[]>([]);
    const [reassignGuest] = useReassignGuestMutation();

    const handleSelectTab = useCallback((value: string) => {
        setActiveTab(value);
        // A bulk selection made in one stage tab shouldn't silently carry into another.
        setBulkReassignMode(false);
        setSelectedGuests([]);
    }, []);

    const handleBulkReassignStart = useCallback(() => setBulkReassignMode(true), []);
    const handleBulkReassignCancel = useCallback(() => {
        setBulkReassignMode(false);
        setSelectedGuests([]);
    }, []);
    const handleToggleSelectGuest = useCallback((guestId: string) => {
        setSelectedGuests(prev => (prev.includes(guestId) ? prev.filter(id => id !== guestId) : [...prev, guestId]));
    }, []);
    const handleBulkWorkerSelect = useCallback(
        async (toWorkerId: string) => {
            await Promise.allSettled(selectedGuests.map(guestId => reassignGuest({ guestId, toWorkerId }).unwrap()));
            setBulkReassignMode(false);
            setSelectedGuests([]);
        },
        [selectedGuests, reassignGuest]
    );

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
            assignedToId: selectedWorker === ALL_WORKERS ? undefined : selectedWorker,
            zoneId,
            assimilationStageId: currentTab,
            assimilationSubStageId: stageFilter === 'all' ? undefined : stageFilter,
        },
        useGetGuestsQuery as any,
        '_id',
        !interactionsDone || !zoneId || !currentTab
    );

    const {
        data: workers = [],
        isLoading: loadingWorkers,
        isFetching: fetchingWorkers,
    } = useGetZoneUsersQuery(
        { zoneId, campusId: user?.campus?._id, page: 1, limit: 100 },
        { skip: !interactionsDone }
    );

    const workerOptions = useMemo(
        () => [{ _id: ALL_WORKERS, firstName: 'All', lastName: 'Workers' }, ...workers],
        [workers]
    );

    const [updateGuest] = useUpdateGuestMutation();
    const onGuestUpdate = useCallback(async (guestId: string, assimilationSubStageId: string) => {
        try {
            await updateGuest({ _id: guestId, assimilationSubStageId });
        } catch (error) {}
    }, []);

    const handleViewGuest = useCallback((guest: Guest) => {
        router.push({ pathname: '/roast-crm/guests/profile', params: guest as any });
    }, []);

    return (
        <Tabs value={currentTab ?? ''} onValueChange={handleSelectTab} className="flex-1 bg-background">
            {/* Anchored chrome: stage tabs, worker filter and search stay put while the list scrolls. */}
            <View className="px-4 pt-4 pb-2 gap-3">
                <TabsList>
                    {assimilationStages.map(stage => (
                        <TabsTrigger key={stage._id} value={stage._id}>
                            <Text>{stage.name}</Text>
                        </TabsTrigger>
                    ))}
                </TabsList>

                <PickerSelect
                    valueKey="_id"
                    className="!h-10"
                    labelKey="firstName"
                    items={workerOptions}
                    value={selectedWorker}
                    placeholder="All Workers"
                    onValueChange={setSelectedWorker}
                    isLoading={loadingWorkers || fetchingWorkers}
                    customLabel={({ firstName, lastName }) => `${firstName} ${lastName}`}
                />

                <View className="flex-row items-center gap-2 w-full justify-between">
                    <View className="flex-1">
                        <SearchAndFilter
                            viewMode="list"
                            searchTerm={search}
                            showSelector={false}
                            showModeToggle={false}
                            stageFilter={stageFilter}
                            setSearchTerm={debouncedSearch}
                            setStageFilter={setStageFilter}
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

            <View className="flex-1 px-2">
                {interactionsDone ? (
                    <GuestListView
                        key={currentTab}
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
                    />
                ) : (
                    <FlatListSkeleton />
                )}
            </View>
        </Tabs>
    );
}
