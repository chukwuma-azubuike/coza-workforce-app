import React, { useCallback, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';

import { useGetWorkerLeaderboardQuery, useGetZoneLeaderboardQuery } from '~/store/services/roast-crm';
import { LeaderboardPayload, WorkerLeaderboardEntry, ZoneLeaderboardEntry } from '~/store/types';
import { View } from 'react-native';
import { Text } from '~/components/ui/text';
import useRole from '~/hooks/role';
import PickerSelect from '~/components/ui/picker-select';
import { Alert } from '~/components/ui/alert';
import { Skeleton } from '~/components/ui/skeleton';
import FlatListComponent from '~/components/composite/flat-list';
import { WorkerListView } from './WorkerListView';
import dayjs from 'dayjs';
import { ZoneListView } from './ZoneListView';

// Matches the same cool -> warm -> green funnel-progress convention used for the assimilation
// funnel/stage cards elsewhere in Roast CRM (see STAGE_BAR_COLOR in zone-dashboard/components/ZoneStats.tsx).
// `engagement` isn't a pipeline stage - it's scored per-contact-logged, not per-guest - so it
// gets its own indigo dot rather than reusing a funnel color.
const LEGEND_DOT_COLOR: Record<string, string> = {
    invited: 'bg-blue-600',
    attended: 'bg-cyan-600',
    discipled: 'bg-amber-600',
    assimilated: 'bg-green-600',
    engagement: 'bg-indigo-600',
};

// The backend only gives us a label + points value per stage, so the "conversational"
// framing here is a fixed action-clause per known stage key (falls back to the raw label for
// any stage this app doesn't recognize yet).
const LEGEND_ACTION: Record<string, string> = {
    invited: 'Invite a guest',
    attended: 'Get them to attend a service',
    discipled: 'Walk with them through discipleship',
    assimilated: 'See them fully assimilated',
    engagement: "Update the engagement timeline with a guest",
};

// Most stages score `pointsPerGuest`; `engagement` scores `pointsPerEngagement` instead.
const legendPoints = (entry: { pointsPerGuest?: number; pointsPerEngagement?: number }) =>
    entry.pointsPerGuest ?? entry.pointsPerEngagement ?? 0;

const Leaderboards: React.FC = () => {
    const { user: currentUser, isSuperAdmin, isGlobalPastor } = useRole();
    const [date, setDate] = useState<Pick<LeaderboardPayload, 'endDate' | 'startDate'> | undefined>({
        startDate: dayjs().subtract(7, 'day').valueOf(),
        endDate: dayjs().valueOf(),
    });
    // Must match the `date` default above, so the control always states the filter that's applied.
    const [selectedPeriodCode, setSelectedPeriodCode] = useState<string>('7d');
    const [activeTab, setActiveTab] = useState('workers');

    const handleDateRangeChange = useCallback((period: 'all' | '7d' | '30d' | '90d') => {
        setSelectedPeriodCode(period);

        if (period === 'all') return setDate(undefined);

        setDate({
            startDate: dayjs()
                ?.subtract(Number(period.replace('d', '')), 'day')
                ?.valueOf(),
            endDate: dayjs()?.valueOf(),
        });
    }, []);

    const { data: workerLeaderboardData, isLoading: isLoadingWorkers } = useGetWorkerLeaderboardQuery({
        campusId: isGlobalPastor || isSuperAdmin ? undefined : currentUser?.campus?._id,
        limit: 10,
        ...date,
    });
    const workerLeaderboard = workerLeaderboardData?.entries ?? [];
    const scoringLegend = workerLeaderboardData?.scoringLegend;
    const { data: zoneLeaderboard = [], isLoading: isLoadingZones } = useGetZoneLeaderboardQuery({
        campusId: isGlobalPastor || isSuperAdmin ? undefined : currentUser?.campus?._id,
        limit: 10,
        ...date,
    });

    const renderWorkerItem = React.useCallback(
        ({ item, index }: { item: WorkerLeaderboardEntry; index: number }) => (
            <WorkerListView {...item} position={index + 1} />
        ),
        []
    );

    const renderZoneItem = React.useCallback(
        ({ item, index }: { item: ZoneLeaderboardEntry; index: number }) => (
            <ZoneListView {...item} position={index + 1} />
        ),
        []
    );

    if (isLoadingZones) {
        return (
            <View className="p-4 gap-6 flex-1">
                <Skeleton className="w-2/5 h-7" />
                <Skeleton className="w-full h-8 rounded-2xl" />
                <View className="gap-8">
                    {[...Array(5)].map((_, i) => (
                        <View className="flex-row gap-4 items-start" key={i}>
                            <Skeleton className="w-16 h-16 rounded-full" />
                            <Skeleton className="flex-1 h-36" />
                        </View>
                    ))}
                </View>
            </View>
        );
    }

    return (
        <View className="py-4 px-2 gap-6">
            {/* Header */}
            <View className="flex-row items-center justify-between">
                <Text className="text-2xl flex-1 font-bold">Leaderboards</Text>
                {/* <View className="flex-1"> */}
                <PickerSelect
                    valueKey="_id"
                    labelKey="name"
                    items={[
                        { _id: 'all', name: 'All Time' },
                        { _id: '7d', name: 'Last 7 Days' },
                        { _id: '30d', name: 'Last 30 Days' },
                        { _id: '90d', name: 'Last 90 Days' },
                    ]}
                    className="w-40 !h-10"
                    value={selectedPeriodCode}
                    placeholder="Select Period"
                    onValueChange={handleDateRangeChange}
                />
                {/* </View> */}
            </View>

            {activeTab === 'workers' && !!scoringLegend && (
                <View className="gap-3">
                    <Text className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        How workers earn points
                    </Text>
                    <View className="gap-1">
                        {Object.entries(scoringLegend).map(([key, entry]) =>
                            entry ? (
                                <View key={key} className="flex-row items-center gap-1.5">
                                    <View
                                        className={`w-2.5 h-2.5 rounded-full ${LEGEND_DOT_COLOR[key] ?? 'bg-muted'}`}
                                    />
                                    <Text className="text-muted-foreground text-sm line-clamp-none flex-1">
                                        {LEGEND_ACTION[key] ?? entry.label}
                                    </Text>
                                    <Text className="text-sm font-semibold">+{legendPoints(entry)} pts</Text>
                                </View>
                            ) : null
                        )}
                    </View>
                    <Alert className="rounded-lg !p-3 border-l-4 border-l-yellow-400 bg-yellow-50 dark:bg-yellow-300/30">
                        <Text className="text-sm line-clamp-none">
                            Points are only awarded for updates made in the app - a call, visit, or stage change
                            that isn't logged here won't count.
                        </Text>
                    </Alert>
                </View>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-1 pb-[620px]">
                <TabsList>
                    <TabsTrigger value="workers">
                        <Text>Workers</Text>
                    </TabsTrigger>
                    <TabsTrigger value="zones">
                        <Text>Zones</Text>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="workers">
                    <FlatListComponent
                        itemHeight={216}
                        style={{ flex: 0 }}
                        refreshing={false}
                        isLoading={isLoadingWorkers}
                        data={workerLeaderboard}
                        renderItemComponent={renderWorkerItem}
                        emptyComponent={
                            <Text className="text-muted-foreground text-center my-4">Insufficient data</Text>
                        }
                    />
                </TabsContent>

                <TabsContent value="zones">
                    <FlatListComponent
                        refreshing={false}
                        itemHeight={219.7}
                        style={{ flex: 0 }}
                        data={zoneLeaderboard}
                        isLoading={isLoadingZones}
                        renderItemComponent={renderZoneItem}
                        emptyComponent={
                            <Text className="text-muted-foreground text-center my-4">Insufficient data</Text>
                        }
                    />
                </TabsContent>
            </Tabs>
        </View>
    );
};

export default Leaderboards;
