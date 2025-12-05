import React, { useState, useCallback } from 'react';
import { View, ScrollView } from 'react-native';
import { BarChart3, Users, Award, Calendar } from 'lucide-react-native';
import { Option } from '~/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { useGetGlobalAnalyticsQuery, useGetZonesQuery } from '~/store/services/roast-crm';
import { Text } from '~/components/ui/text';
import { DistributionChart } from './charts/DistributionChart';
import { ZonePerformanceChart } from './charts/ZonePerformanceChart';
import { TrendChart } from './charts/TrendChart';
import { TopPerformingWorkers, TopPerformingZones } from './performers/TopPerformers';
import { DropoffAnalysis } from './analytics/DropoffAnalysis';
import { RecommendationsCard } from './analytics/RecommendationsCard';
import { StatsCard } from './StatsCard';
import PickerSelect from '~/components/ui/picker-select';
import dayjs from 'dayjs';
import { Skeleton } from '~/components/ui/skeleton';
import ErrorBoundary from '~/components/composite/error-boundary';
import { LeaderboardPayload } from '~/store/types';
import Error from '~/components/atoms/error';
import useRole from '~/hooks/role';

type TimeRange = '1-month' | '3-month' | '6-months' | '1-year';
type TabValues = 'overview' | 'zones' | 'trends' | 'analytics';

const GlobalDashboard: React.FC = () => {
    const { user } = useRole();
    const [selectedZone, setSelectedZone] = useState<string>();
    const [selectedPeriodCode, setSelectedPeriodCode] = useState<string>();
    const [selectedTab, setSelectedTab] = useState<TabValues>('overview');

    const [date, setDate] = useState<Pick<LeaderboardPayload, 'endDate' | 'startDate'>>({
        startDate: dayjs().subtract(7, 'day').toISOString(),
        endDate: dayjs().toISOString(),
    });

    const handleDateRangeChange = useCallback((period: TimeRange) => {
        setSelectedPeriodCode(period);

        if (!period.includes('-')) return;

        const [number, category] = period.split('-');

        setDate({
            startDate: dayjs()
                .subtract(Number(number), category as 'month' | 'year')
                .toISOString(),
            endDate: dayjs().toISOString(),
        });
    }, []);

    const { data: zones = [] } = useGetZonesQuery({});

    const handleZoneChange = useCallback((option: Option) => {
        setSelectedZone((option as unknown as string) ?? undefined);
    }, []);

    const handleTabChange = useCallback((value: string) => {
        setSelectedTab(value as any);
    }, []);

    const {
        data: analytics,
        isLoading,
        error,
    } = useGetGlobalAnalyticsQuery({
        ...date,
        zoneId: selectedZone,
        campusId: user.campus?._id,
    });

    if (isLoading) {
        return (
            <View className="p-2 gap-6 flex-1">
                <Skeleton className="w-2/5 h-7" />
                <View className="gap-6 flex-row flex-wrap">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="min-w-[40%] h-28 flex-1" />
                    ))}
                </View>
                <Skeleton className="w-full h-6" />
                <Skeleton className="w-72 h-72 mx-auto rounded-full" />
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="w-full h-12" />
                    ))}
                </View>
            </View>
        );
    }

    // const recommendations = [
    //     {
    //         title: 'Improve Follow-up Process',
    //         description: "30% of invited guests aren't being followed up. Consider automated reminders.",
    //         type: 'info' as const,
    //     },
    //     {
    //         title: 'Small Group Integration',
    //         description: 'South Zone shows best attendance-to-discipleship conversion. Replicate their model.',
    //         type: 'success' as const,
    //     },
    //     {
    //         title: 'Mentorship Program',
    //         description: '36% drop-off from discipled to joined suggests need for better mentorship matching.',
    //         type: 'warning' as const,
    //     },
    // ];

    return (
        <View className="flex-1 bg-background gap-4 p-2">
            {/* Header */}
            <View className="flex-row items-center gap-4">
                <Text className="text-2xl !w-[45%] font-bold">Global Dashboard</Text>
                <View className="flex-1">
                    <PickerSelect
                        valueKey="_id"
                        items={[
                            { _id: '', name: 'All Time' },
                            { _id: '1-month', name: 'Past 1 Month' },
                            { _id: '3-month', name: 'Past 3 Months' },
                            { _id: '6-month', name: 'Past 6 Months' },
                            { _id: '1-year', name: 'Past 1 Year' },
                        ]}
                        labelKey="name"
                        className="!w-28 !h-10"
                        value={selectedPeriodCode}
                        placeholder="Date range"
                        onValueChange={handleDateRangeChange}
                    />
                </View>
                <View className="flex-1">
                    <PickerSelect
                        valueKey="_id"
                        items={zones}
                        labelKey="name"
                        value={selectedZone}
                        className="!w-28 !h-10"
                        placeholder="Zone"
                        onValueChange={handleZoneChange}
                    />
                </View>
            </View>
            {error || !analytics ? (
                <Error message={(error as any)?.data?.message} />
            ) : (
                <ScrollView className="flex-1">
                    <View className="gap-6 pb-6">
                        {/* Key Metrics */}
                        <View className="flex-row flex-wrap" style={{ gap: 16 }}>
                            <View style={{ flex: 1, minWidth: 150 }}>
                                <StatsCard
                                    icon={Users}
                                    title="Total Guests"
                                    iconColor="text-blue-500"
                                    value={analytics.totalGuests}
                                    // trend={{ value: 12, label: '% this month', direction: 'up' }}
                                />
                            </View>
                            <View style={{ flex: 1, minWidth: 150 }}>
                                <StatsCard
                                    icon={BarChart3}
                                    title="Conversion Rate"
                                    iconColor="text-green-500"
                                    value={`${analytics.conversionRate ?? 0}%`}
                                    // trend={{ value: 3, label: '% this month', direction: 'up' }}
                                />
                            </View>
                            <View style={{ flex: 1, minWidth: 150 }}>
                                <StatsCard
                                    title="Avg. Conversion Time"
                                    value={`${analytics.avgTimeToConversion ?? 0} days`}
                                    icon={Calendar}
                                    // trend={{ value: -5, label: 'd this month', direction: 'down' }}
                                    iconColor="text-purple-500"
                                />
                            </View>
                            <View style={{ flex: 1, minWidth: 150 }}>
                                <StatsCard
                                    icon={Award}
                                    title="Active Workers"
                                    iconColor="text-orange-500"
                                    value={analytics.totalActiveUsers ?? 0}
                                    // trend={{ value: 2, label: ' this month', direction: 'up' }}
                                />
                            </View>
                        </View>

                        <Tabs value={selectedTab} onValueChange={handleTabChange} className="gap-6">
                            <TabsList className="flex-row gap-1">
                                <TabsTrigger value="overview">
                                    <Text>Overview</Text>
                                </TabsTrigger>
                                <TabsTrigger value="zones">
                                    <Text>Zone Performance</Text>
                                </TabsTrigger>
                                <TabsTrigger value="trends">
                                    <Text>Trends</Text>
                                </TabsTrigger>
                                <TabsTrigger value="analytics">
                                    <Text>Analytics</Text>
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview">
                                <View className="gap-6 md:flex-row">
                                    <ErrorBoundary>
                                        <DistributionChart data={analytics.stageDistribution} />
                                    </ErrorBoundary>
                                    <ErrorBoundary>
                                        {selectedZone ? (
                                            <TopPerformingWorkers performers={analytics.topPerformingWorkers ?? []} />
                                        ) : (
                                            <TopPerformingZones performers={analytics.topPerformingZones ?? []} />
                                        )}
                                    </ErrorBoundary>
                                </View>
                            </TabsContent>

                            <TabsContent value="zones">
                                <ErrorBoundary>
                                    <ZonePerformanceChart data={analytics.zonePerformance as any} />
                                </ErrorBoundary>
                            </TabsContent>

                            <TabsContent value="trends">
                                <ErrorBoundary>
                                    <TrendChart
                                        date={`${dayjs(date.startDate).format('MMM, YYYY')} - ${dayjs(
                                            date.endDate
                                        ).format('MMM, YYYY')}`}
                                        data={analytics.monthlyTrends}
                                    />
                                </ErrorBoundary>
                            </TabsContent>

                            <TabsContent value="analytics">
                                <View className="flex-row flex-wrap" style={{ gap: 16 }}>
                                    <View style={{ flex: 1, minWidth: 300 }}>
                                        <ErrorBoundary>
                                            <DropoffAnalysis data={analytics.dropOffAnalysis} />
                                        </ErrorBoundary>
                                    </View>
                                    <View style={{ flex: 1, minWidth: 300 }}>
                                        <ErrorBoundary>
                                            <RecommendationsCard recommendations={[]} />
                                        </ErrorBoundary>
                                    </View>
                                </View>
                            </TabsContent>
                        </Tabs>
                    </View>
                </ScrollView>
            )}
        </View>
    );
};

export default GlobalDashboard;
