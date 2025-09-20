import React, { ReactNode, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { Dimensions, View } from 'react-native';
import { AssimilationStage, AssimilationStagePosition, Guest, Role, Zone } from '~/store/types';
import { useGetGuestsQuery, useGetZonesQuery, useUpdateGuestMutation } from '~/store/services/roast-crm';

import { Text } from '~/components/ui/text';

import { ZoneStats } from './components/ZoneStats';
// import { PipelineInstructions } from './components/PipelineInstructions';
// import { BulkActions } from './components/BulkActions';

import { useGuestFiltering } from './hooks/useGuestFiltering';
import useRole from '~/hooks/role';
import Loading from '~/components/atoms/loading';

import { columnDataType, HeaderParams } from '../../../components/Kanban/types';
import { assimilationStages } from '../data/assimilationStages';
import { ScreenWidth } from '@rneui/base';
import { router } from 'expo-router';
import { useGetUsersQuery } from '~/store/services/account';
import SearchAndFilter from '../components/SearchAndFilter';
import PickerSelect from '~/components/ui/picker-select';
import groupBy from 'lodash/groupBy';

const KanbanColumn = React.lazy(() => import('../components/KanbanColumn'));
const KanbanUICard = React.lazy(() => import('../components/KanbanCard'));
const GuestListView = React.lazy(() => import('../components/GuestListView'));
import ReactNativeKanbanBoard from '~/components/Kanban';

export function ZoneDashboard() {
    const { user: currentUser, role } = useRole();
    const [selectedZone, setSelectedZone] = useState<string>(currentUser.zoneIds?.[0] || '');
    const [bulkReassignMode, setBulkReassignMode] = useState(false);
    const [selectedGuests, setSelectedGuests] = useState<string[]>([]);
    const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
    const [searchTerm, setSearchTerm] = useState('');
    const [stageFilter, setStageFilter] = useState<Guest['assimilationStage'] | 'all'>('all');
    const [statefulMappedGuests, setMappedGuests] = useState<columnDataType<Guest, HeaderParams>[]>(assimilationStages);

    // RTK Queries
    const { data: guests = [], isLoading: loadingGuests, refetch } = useGetGuestsQuery({ zoneId: selectedZone });
    const { data: users = [] } = useGetUsersQuery({});
    const { data: zones = [] } = useGetZonesQuery();
    const [updateGuest] = useUpdateGuestMutation();

    // Filter guests by current user and search term
    const userGuests = useMemo(
        () => guests?.filter(guest => guest.name.toLowerCase().includes(searchTerm.toLowerCase())),
        [guests, searchTerm]
    );

    const [statefulUserGuests, setStatefulUserGuests] = useState<Guest[]>(userGuests);

    const { filteredGuests, groupedGuests, stats } = useGuestFiltering({
        guests,
        searchTerm,
        stageFilter,
        zoneId: selectedZone,
    });

    const handleGuestMove = async (guestId: string, newStage: Guest['assimilationStage']) => {
        try {
            await updateGuest({ _id: guestId, assimilationStage: newStage, lastContact: new Date().toISOString() });
            // toast.success(`Guest moved to ${newStage} stage`);
        } catch (error) {
            // toast.error('Failed to update guest stage');
        }
    };

    const handleProfileView = (guest: Guest) => {
        router.push({ pathname: '/roast-crm/guests/profile', params: guest as any });
    };

    const handleReassignWorker = async (guestId: string, workerId: string, zoneId?: string) => {
        try {
            await updateGuest({
                _id: guestId,
                assignedToId: workerId,
                zoneId: zoneId || selectedZone,
                lastContact: new Date().toISOString(),
            });

            // If guest was moved to a different zoneId, update selected zoneId to follow the guest
            if (zoneId && zoneId !== selectedZone && (role === Role.ADMIN || role === Role.PASTOR)) {
                setSelectedZone(zoneId);
            }

            // toast.success('Worker reassigned successfully');
        } catch (error) {
            // toast.error('Failed to reassign worker');
        }
    };

    const handleBulkReassign = async (workerId: string) => {
        if (selectedGuests.length === 0) {
            // toast.error('Please select guests to reassign');
            return;
        }

        try {
            await Promise.all(
                selectedGuests.map(guestId =>
                    updateGuest({
                        _id: guestId,
                        assignedToId: workerId,
                        lastContact: new Date().toISOString(),
                    })
                )
            );

            const worker = users.find(w => w._id === workerId);
            // toast.success(`${selectedGuests.length} guests reassigned to ${worker?.name}`);
            setSelectedGuests([]);
            setBulkReassignMode(false);
        } catch (error) {
            // toast.error('Failed to reassign some guests');
        }
    };

    const toggleGuestSelection = (guestId: string) => {
        setSelectedGuests(prev => (prev.includes(guestId) ? prev.filter(_id => _id !== guestId) : [...prev, guestId]));
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

    const handleViewGuest = useCallback((guestId: string) => {
        router.push({ pathname: '/roast-crm/guests/profile', params: { guestId } });
    }, []);

    const kanbanContainerHeight = Dimensions.get('window').height - 620;
    const displayGuests = useMemo(() => getFilteredGuests(), [getFilteredGuests]);

    const renderContentContainer = useCallback(
        (child: ReactNode, props: HeaderParams) => (
            <KanbanColumn
                title={props.title}
                isLoading={loadingGuests}
                guestCount={props.count}
                stage={props.title as AssimilationStage}
            >
                {child}
            </KanbanColumn>
        ),
        [loadingGuests]
    );

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

    const selectedZoneOption = zones.find((zone: Zone) => zone._id === selectedZone);

    return (
        <View className="flex-1 bg-background pt-2 gap-6">
            {/* Header */}
            <View className="gap-4 px-2">
                <View className="flex-row items-center justify-between">
                    <Text className="text-2xl font-bold">{selectedZoneOption?.name ?? 'Zone'} Dashboard</Text>

                    {/* Zone Selector */}
                    {(role === Role.ADMIN || role === Role.PASTOR) && (
                        <PickerSelect
                            valueKey="_id"
                            items={zones}
                            labelKey="name"
                            value={selectedZone}
                            className="!w-44 !h-10"
                            placeholder="Select zone"
                            onValueChange={option => {
                                if (option?.value) {
                                    setSelectedZone(option.value);
                                }
                            }}
                        />
                    )}
                </View>

                <ZoneStats
                    totalGuests={stats.totalGuests}
                    conversionRate={stats.conversionRate}
                    activeThisWeek={stats.activeThisWeek}
                    totalWorkers={users.filter((u: any) => u.role === Role.WORKER).length}
                />
            </View>

            {/* Instructions - Only show for Kanban view */}
            {/* TODO: Pipeline instructions might be unecessary */}
            {/* {viewMode === 'kanban' && <PipelineInstructions />} */}

            <View className="px-2 flex-row items-center gap-2 w-full justify-between mb-1">
                {/* TODO: Not sure how practical this is */}
                {/* <BulkActions
                    bulkReassignMode={bulkReassignMode}
                    selectedGuests={selectedGuests}
                    workers={users}
                    onBulkReassignStart={() => setBulkReassignMode(true)}
                    onBulkReassignCancel={() => {
                        setBulkReassignMode(false);
                        setSelectedGuests([]);
                    }}
                    onWorkerSelect={handleBulkReassign}
                /> */}

                <View className="flex-1">
                    <SearchAndFilter
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        stageFilter={stageFilter}
                        setStageFilter={setStageFilter}
                        viewMode={viewMode}
                        setViewMode={value => setViewMode(value as any)}
                    />
                </View>
            </View>

            {/* View Content */}
            <View className="flex-1">
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
                            isLoading={loadingGuests}
                            handleViewGuest={handleViewGuest}
                            containerHeight={kanbanContainerHeight}
                            displayGuests={displayGuests as Guest[]}
                        />
                    </Suspense>
                )}
            </View>
        </View>
    );
}
