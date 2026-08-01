import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { Card, CardContent } from '~/components/ui/card';
import {
    useGetActiveWorkersQuery,
    useGetAssimilationStagesQuery,
    useGetInactiveWorkersQuery,
    useGetZeroEngagementWorkersQuery,
    useGetZoneDashboardQuery,
    useGetZonesQuery,
} from '~/store/services/roast-crm';

import { Text } from '~/components/ui/text';

import { AssimilationFunnel, StatCard, ZoneStats } from './components/ZoneStats';
import useRole from '~/hooks/role';

import { router } from 'expo-router';

import PickerSelect from '~/components/ui/picker-select';
import { FloatButton } from '~/components/atoms/button';
import useZoneIndex from '../hooks/use-zone-index';

const AddGuestModal = React.lazy(() => import('../my-guests/AddGuest'));

const ZoneDashboard: React.FC = () => {
    const { user, isZonalCoordinator, isHOD, isAHOD } = useRole();
    const hasZoneRights = isZonalCoordinator || isHOD || isAHOD;
    const { data: departmentZones } = useGetZonesQuery({ departmentId: user.department._id }); //TODO: departmentId query param is yet to work
    const [selectedCampus] = useState<string | undefined>();
    // Undefined = "All Zones". Seeded once from the user's own zone by the effect below.
    const [selectedZone, setSelectedZone] = useState<string | undefined>();
    // Once the user has picked a zone themselves - including deliberately picking "All Zones" -
    // the default must never re-apply, otherwise selecting "All Zones" would snap straight back.
    const zoneDefaultApplied = useRef(false);

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
        zoneDefaultApplied.current = true;
        setSelectedZone(value === 'null' ? undefined : value);
    };

    useEffect(() => {
        // Everyone lands on their own zone. Zone-scoped roles only ever see their department's
        // zones in the picker, so their default has to come from that list or the control would
        // render blank - prefer their own zone when it's in there, else the first one.
        // Falls through to "All Zones" if nothing resolves. Runs once - see zoneDefaultApplied.
        if (zoneDefaultApplied.current || selectedZone) return;

        const ownZoneId = user?.zoneIds?.[0];
        const defaultZoneId = hasZoneRights
            ? ((userZones as any)?.find((zone: any) => zone?._id === ownZoneId)?._id ?? (userZones as any)?.[0]?._id)
            : ownZoneId;

        if (!defaultZoneId) return;

        zoneDefaultApplied.current = true;
        setSelectedZone(defaultZoneId);
    }, [hasZoneRights, userZones, selectedZone, user?.zoneIds]);

    const [modalVisible, setModalVisible] = useState(false);

    const { data: assimilationStagesRaw = [] } = useGetAssimilationStagesQuery();
    const assimilationStages = useMemo(
        () => [...assimilationStagesRaw].sort((a, b) => a.order - b.order),
        [assimilationStagesRaw]
    );

    const { data: zones = [], isLoading: loadingZones } = useGetZonesQuery({
        campusId: selectedCampus ?? user?.campus?._id,
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

    const handleSelectAssimilationStage = useCallback(
        (stageId: string | undefined) => {
            if (!stageId) return;
            router.push({
                pathname: '/roast-crm/zone-guests',
                params: { zoneId: selectedZone, zoneName: selectedZoneName, stageId },
            } as any);
        },
        [selectedZone, selectedZoneName]
    );

    const handleAddGuest = () => {
        setModalVisible(prev => !prev);
    };

    return (
        <View className="flex-1 bg-background pt-2">
            <ScrollView contentContainerStyle={{ padding: 8, paddingBottom: 24 }}>
                <View className="gap-4 pb-3">
                    <View className="flex-row items-start gap-4">
                        {/* Zone Selector */}
                        <View className="flex-1 gap-1">
                            <Text className="text-xs font-medium text-muted-foreground">Zone</Text>
                            <PickerSelect
                                valueKey="_id"
                                labelKey="name"
                                className="!h-10"
                                disabled={hasZoneRights}
                                value={selectedZone}
                                placeholder="All Zones"
                                isLoading={loadingZones}
                                onValueChange={handleSelectZone}
                                items={
                                    hasZoneRights ? (userZones ?? []) : [{ _id: 'null', name: 'All Zones' }, ...zones]
                                }
                            />
                        </View>
                    </View>

                    <View className="gap-1.5">
                        <Text className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                            Overview
                        </Text>
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
                                                    {zeroEngagementWorkers.length === 1 ? '' : 's'} with zero
                                                    engagement
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
                        <Text className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                            Guests by Stage
                        </Text>
                        <AssimilationFunnel
                            stages={assimilationStages}
                            breakdown={zoneDashboard?.conversionRates?.breakdown}
                            selectedStageId={undefined}
                            onSelectStage={handleSelectAssimilationStage}
                        />
                    </View>
                </View>
            </ScrollView>

            <FloatButton
                iconName="plus"
                className="!p-2"
                onPress={handleAddGuest}
                iconType="font-awesome-5"
                iconClassname="!w-4 !h-4"
            >
                Add Guest
            </FloatButton>

            <React.Suspense fallback={null}>
                <AddGuestModal modalVisible={modalVisible} setModalVisible={handleAddGuest} />
            </React.Suspense>
        </View>
    );
};

export default ZoneDashboard;
