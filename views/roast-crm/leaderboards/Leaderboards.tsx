import React, { useCallback, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';

import { useGetWorkerLeaderboardQuery, useGetZoneLeaderboardQuery } from '~/store/services/roast-crm';
import { LeaderboardPayload, WorkerLeaderboardEntry, ZoneLeaderboardEntry } from '~/store/types';
import { View } from 'react-native';
import { Text } from '~/components/ui/text';
import useRole from '~/hooks/role';
import PickerSelect from '~/components/ui/picker-select';
import { Skeleton } from '~/components/ui/skeleton';
import FlatListComponent from '~/components/composite/flat-list';
import { WorkerListView } from './WorkerListView';
import dayjs from 'dayjs';
import { ZoneListView } from './ZoneListView';
import { ScoringGuide } from './ScoringGuide';

// Breathing room under the last card so it clears the tab bar when scrolled to the end.
const LIST_CONTENT_STYLE = { paddingBottom: 24 };

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
        <View className="flex-1 pt-4 px-2 gap-4">
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

            {activeTab === 'workers' && !!scoringLegend && <ScoringGuide scoringLegend={scoringLegend} />}

            {/* The list owns the scroll: everything above is fixed chrome, so the tab panel takes the
                remaining height rather than being padded down to a guessed offset. */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 gap-2">
                <TabsList>
                    <TabsTrigger value="workers">
                        <Text>Workers</Text>
                    </TabsTrigger>
                    <TabsTrigger value="zones">
                        <Text>Zones</Text>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="workers" className="flex-1">
                    <FlatListComponent
                        itemHeight={216}
                        refreshing={false}
                        isLoading={isLoadingWorkers}
                        data={workerLeaderboard}
                        renderItemComponent={renderWorkerItem}
                        contentContainerStyle={LIST_CONTENT_STYLE}
                        emptyComponent={
                            <Text className="text-muted-foreground text-center my-4">Insufficient data</Text>
                        }
                    />
                </TabsContent>

                <TabsContent value="zones" className="flex-1">
                    <FlatListComponent
                        refreshing={false}
                        itemHeight={219.7}
                        data={zoneLeaderboard}
                        isLoading={isLoadingZones}
                        renderItemComponent={renderZoneItem}
                        contentContainerStyle={LIST_CONTENT_STYLE}
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
