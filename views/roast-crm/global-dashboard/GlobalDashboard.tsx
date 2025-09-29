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
import { TopPerformers } from './performers/TopPerformers';
import { DropoffAnalysis } from './analytics/DropoffAnalysis';
import { RecommendationsCard } from './analytics/RecommendationsCard';
import Loading from '~/components/atoms/loading';
import { StatsCard } from './StatsCard';
import PickerSelect from '~/components/ui/picker-select';
import dayjs from 'dayjs';
import { Skeleton } from '~/components/ui/skeleton';
import ErrorBoundary from '~/components/composite/error-boundary';

type TimeRange = '1 month' | '3 months' | '6 months' | '1 year';
type ZoneId = 'all' | 'central' | 'north' | 'south' | 'east' | 'west';
type TabValues = 'overview' | 'zones' | 'trends' | 'analytics';

const TIME_RANGE = [
    {
        label: '1 month',
        value: {
            startDate: dayjs().subtract(1, 'month').toISOString(),
            endDate: dayjs().toISOString(),
        },
    },
    {
        label: '3 month',
        value: {
            startDate: dayjs().subtract(3, 'month').toISOString(),
            endDate: dayjs().toISOString(),
        },
    },
    {
        label: '6 month',
        value: {
            startDate: dayjs().subtract(6, 'month').toISOString(),
            endDate: dayjs().toISOString(),
        },
    },
    {
        label: '1 year',
        value: {
            startDate: dayjs().subtract(1, 'year').toISOString(),
            endDate: dayjs().toISOString(),
        },
    },
];

const GlobalDashboard: React.FC = () => {
    const [selectedZone, setSelectedZone] = useState<ZoneId>('all');
    const [selectedTimeRange, setSelectedTimeRange] = useState<(typeof TIME_RANGE)[0]>(TIME_RANGE[0]);
    const [selectedTab, setSelectedTab] = useState<TabValues>('overview');

    const { data: zones = [] } = useGetZonesQuery();

    const handleTimeRangeChange = useCallback((option: (typeof TIME_RANGE)[0]) => {
        setSelectedTimeRange(option.value as any);
    }, []);

    const handleZoneChange = useCallback((option: Option) => {
        setSelectedZone(option?.value as ZoneId);
    }, []);

    const handleTabChange = useCallback((value: string) => {
        setSelectedTab(value as any);
    }, []);

    const {
        data: analytics,
        isLoading,
        error,
    } = useGetGlobalAnalyticsQuery({
        startDate: selectedTimeRange.value.startDate,
        endDate: selectedTimeRange.value.endDate,
        zoneId: 'all',
    });

    if (isLoading) {
        return (
            <View className="p-4 gap-6 flex-1">
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

    if (error) {
        return <Loading cover />;
    }

    if (!analytics) {
        return null;
    }

    const recommendations = [
        {
            title: 'Improve Follow-up Process',
            description: "30% of invited guests aren't being followed up. Consider automated reminders.",
            type: 'info' as const,
        },
        {
            title: 'Small Group Integration',
            description: 'South Zone shows best attendance-to-discipleship conversion. Replicate their model.',
            type: 'success' as const,
        },
        {
            title: 'Mentorship Program',
            description: '36% drop-off from discipled to joined suggests need for better mentorship matching.',
            type: 'warning' as const,
        },
    ];

    return (
        <ScrollView className="p-4 flex-1">
            <View className="gap-6 pb-6">
                {/* Header */}
                <View className="flex-row items-center justify-between">
                    <Text className="text-2xl font-bold">Global Dashboard</Text>
                    <View className="flex-row" style={{ gap: 8 }}>
                        <PickerSelect
                            valueKey="value"
                            items={TIME_RANGE}
                            labelKey="label"
                            value={selectedZone}
                            className="!w-28 !h-10"
                            placeholder="Select time range"
                            onValueChange={handleTimeRangeChange}
                        />
                        <PickerSelect
                            valueKey="_id"
                            items={zones}
                            labelKey="name"
                            value={selectedZone}
                            className="!w-28 !h-10"
                            placeholder="Select zone"
                            onValueChange={option => {
                                if (option?.value) {
                                    handleZoneChange(option.value);
                                }
                            }}
                        />
                    </View>
                </View>

                {/* Key Metrics */}
                <View className="flex-row flex-wrap" style={{ gap: 16 }}>
                    <View style={{ flex: 1, minWidth: 150 }}>
                        <StatsCard
                            title="Total Guests"
                            value={analytics.totalGuests}
                            icon={Users}
                            trend={{ value: 12, label: '% this month', direction: 'up' }}
                            iconColor="text-blue-500"
                        />
                    </View>
                    <View style={{ flex: 1, minWidth: 150 }}>
                        <StatsCard
                            title="Conversion Rate"
                            value={`${analytics.conversionRate}%`}
                            icon={BarChart3}
                            trend={{ value: 3, label: '% this month', direction: 'up' }}
                            iconColor="text-green-500"
                        />
                    </View>
                    <View style={{ flex: 1, minWidth: 150 }}>
                        <StatsCard
                            title="Avg. Conversion Time"
                            value={`${analytics.avgTimeToConversion}d`}
                            icon={Calendar}
                            trend={{ value: -5, label: 'd this month', direction: 'down' }}
                            iconColor="text-purple-500"
                        />
                    </View>
                    <View style={{ flex: 1, minWidth: 150 }}>
                        <StatsCard
                            title="Active Workers"
                            value={analytics.activeWorkers}
                            icon={Award}
                            trend={{ value: 2, label: ' this month', direction: 'up' }}
                            iconColor="text-orange-500"
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
                        <View className="gap-6">
                            <ErrorBoundary>
                                <DistributionChart data={analytics.stageDistribution} />
                            </ErrorBoundary>
                            <ErrorBoundary>
                                <TopPerformers performers={analytics.topPerformers} />
                            </ErrorBoundary>
                        </View>
                    </TabsContent>

                    <TabsContent value="zones">
                        <ErrorBoundary>
                            <ZonePerformanceChart data={analytics.zonePerformance} />
                        </ErrorBoundary>
                    </TabsContent>

                    <TabsContent value="trends">
                        <ErrorBoundary>
                            <TrendChart data={analytics.monthlyTrends} />
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
                                    <RecommendationsCard recommendations={recommendations} />
                                </ErrorBoundary>
                            </View>
                        </View>
                    </TabsContent>
                </Tabs>
            </View>
        </ScrollView>
    );
};

export default GlobalDashboard;
