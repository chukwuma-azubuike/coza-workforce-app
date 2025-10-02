import React, { useCallback, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';

import { useGetWorkerLeaderboardQuery, useGetZoneLeaderboardQuery } from '~/store/services/roast-crm';
import { LeaderboardPayload, WorkerLeaderboardEntry } from '~/store/types';
import { View } from 'react-native';
import { Text } from '~/components/ui/text';
import useRole from '~/hooks/role';
import PickerSelect from '~/components/ui/picker-select';
import { Skeleton } from '~/components/ui/skeleton';
import FlatListComponent from '~/components/composite/flat-list';
import { WorkerListView } from './WorkerListView';
import Loading from '~/components/atoms/loading';
import dayjs from 'dayjs';

const Leaderboards: React.FC = () => {
    const { user: currentUser, isSuperAdmin, isGlobalPastor } = useRole();
    const [date, setDate] = useState<Pick<LeaderboardPayload, 'endDate' | 'startDate'> | undefined>({
        startDate: dayjs().subtract(7, 'day').toISOString(),
        endDate: dayjs().toISOString(),
    });
    const [selectedPeriodCode, setSelectedPeriodCode] = useState<string>();
    const [activeTab, setActiveTab] = useState('workers');

    const handleDateRangeChange = useCallback((period: '7d' | '30d' | '90d') => {
        setSelectedPeriodCode(period);

        if (typeof period !== 'object') return setDate(undefined);

        setDate({
            startDate: dayjs()
                ?.subtract(Number((period as any)?.replace('d', '')), 'day')
                ?.toISOString(),
            endDate: dayjs()?.toISOString(),
        });
    }, []);

    const { data: workerLeaderboard = [] } = useGetWorkerLeaderboardQuery({
        campusId: isGlobalPastor || isSuperAdmin ? undefined : currentUser?.campus?._id,
        limit: 10,
        ...date,
    });
    const { data: zoneLeaderboard = [], isLoading: isLoadingZones } = useGetZoneLeaderboardQuery({
        campusId: isGlobalPastor || isSuperAdmin ? undefined : currentUser?.campus?._id,
        limit: 10,
        ...date,
    });

    const renderWorkerItem = React.useCallback(
        ({ item }: { item: WorkerLeaderboardEntry; index: number }) => <WorkerListView {...item} />,
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
                        { _id: '', name: 'All Time' },
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

            <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-1">
                <TabsList>
                    <TabsTrigger value="workers">
                        <Text>Workers</Text>
                    </TabsTrigger>
                    <TabsTrigger value="zones">
                        <Text>Zones</Text>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="workers" className="pb-64">
                    <FlatListComponent
                        itemHeight={216}
                        style={{ flex: 0 }}
                        data={workerLeaderboard}
                        emptyComponent={<Loading className="mt-8" />}
                        renderItemComponent={renderWorkerItem}
                    />
                </TabsContent>

                <TabsContent value="zones" className="pb-64">
                    <FlatListComponent
                        itemHeight={219.7}
                        style={{ flex: 0 }}
                        data={zoneLeaderboard}
                        emptyComponent={<Loading className="mt-8" />}
                        renderItemComponent={renderWorkerItem}
                    />
                </TabsContent>
            </Tabs>
        </View>
    );
};

export default Leaderboards;
