import React from 'react';
import { View } from 'react-native';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Progress } from '~/components/ui/progress';
import { Skeleton } from '~/components/ui/skeleton';
import { Text } from '~/components/ui/text';
import { cn } from '~/lib/utils';
import { getTrendIcon } from '../../utils/icons';
import type {
    ActiveVsInactiveTrendPoint,
    StageDropOffPoint,
    StageFunnelPoint,
    WeeklyGuestTrendPoint,
    WorkerLeaderboardTrend,
} from '~/store/types/roast-crm';

const dropOffColor = (rate?: number) => (!rate || rate < 1 ? 'bg-green-500' : rate < 30 ? 'bg-yellow-500' : 'bg-destructive');

function InsightCard({
    title,
    isLoading,
    isEmpty,
    emptyMessage,
    children,
}: {
    title: string;
    isLoading?: boolean;
    isEmpty?: boolean;
    emptyMessage: string;
    children: React.ReactNode;
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className="gap-3">
                {isLoading ? (
                    <View className="gap-3">
                        {[...Array(3)].map((_, i) => (
                            <Skeleton key={i} className="w-full h-8" />
                        ))}
                    </View>
                ) : isEmpty ? (
                    <Text className="text-muted-foreground">{emptyMessage}</Text>
                ) : (
                    children
                )}
            </CardContent>
        </Card>
    );
}

export function StageFunnelCard({ data, isLoading }: { data?: StageFunnelPoint[]; isLoading?: boolean }) {
    return (
        <InsightCard
            title="Stage Funnel"
            isLoading={isLoading}
            isEmpty={!data?.length}
            emptyMessage="No funnel data for this period."
        >
            {data?.map((point, index) => (
                <View key={point.stage ?? index} className="gap-1">
                    <View className="flex-row items-center justify-between">
                        <Text className="font-medium">{point.label ?? point.stage ?? `Stage ${index + 1}`}</Text>
                        <Text className="text-muted-foreground">{point.count ?? 0} guests</Text>
                    </View>
                    <Progress value={point.conversionRate ?? 0} />
                </View>
            ))}
        </InsightCard>
    );
}

export function WeeklyGuestTrendCard({ data, isLoading }: { data?: WeeklyGuestTrendPoint[]; isLoading?: boolean }) {
    const maxTotal = Math.max(1, ...(data?.map(point => point.total ?? 0) ?? [0]));

    return (
        <InsightCard
            title="Weekly Guest Trend"
            isLoading={isLoading}
            isEmpty={!data?.length}
            emptyMessage="No weekly trend data for this period."
        >
            {data?.map((point, index) => (
                <View key={index} className="gap-1">
                    <View className="flex-row items-center justify-between">
                        <Text className="text-muted-foreground">{point.weekLabel ?? `Week ${index + 1}`}</Text>
                        <Text className="font-medium">{point.total ?? 0}</Text>
                    </View>
                    <Progress value={((point.total ?? 0) / maxTotal) * 100} />
                </View>
            ))}
        </InsightCard>
    );
}

export function WorkerLeaderboardTrendCard({
    data,
    isLoading,
}: {
    data?: WorkerLeaderboardTrend;
    isLoading?: boolean;
}) {
    const workers = data?.workers ?? [];

    return (
        <InsightCard
            title="Top Worker Trends"
            isLoading={isLoading}
            isEmpty={!workers.length}
            emptyMessage="No historical score data yet - check back once weekly snapshots start accumulating."
        >
            {workers.map((worker, index) => {
                const points = worker.points ?? [];
                const latest = points[points.length - 1]?.score ?? 0;
                const earliest = points[0]?.score ?? latest;
                const trend = latest > earliest ? 'up' : latest < earliest ? 'down' : 'flat';

                return (
                    <View key={worker.workerId ?? index} className="flex-row items-center justify-between">
                        <Text className="font-medium flex-1">{worker.name ?? `Worker ${index + 1}`}</Text>
                        <View className="flex-row items-center gap-2">
                            <Text className="font-bold">{latest}</Text>
                            {getTrendIcon(trend)}
                        </View>
                    </View>
                );
            })}
        </InsightCard>
    );
}

export function ActiveVsInactiveTrendCard({
    data,
    isLoading,
}: {
    data?: ActiveVsInactiveTrendPoint[];
    isLoading?: boolean;
}) {
    return (
        <InsightCard
            title="Active vs Inactive Workers"
            isLoading={isLoading}
            isEmpty={!data?.length}
            emptyMessage="No historical worker-activity data yet - check back once weekly snapshots start accumulating."
        >
            {data?.map((point, index) => {
                const total = (point.active ?? 0) + (point.inactive ?? 0);

                return (
                    <View key={index} className="gap-1">
                        <View className="flex-row items-center justify-between">
                            <Text className="text-muted-foreground">{point.weekLabel ?? `Week ${index + 1}`}</Text>
                            <Text>
                                <Text className="text-green-600 font-medium">{point.active ?? 0} active</Text>
                                {'  '}
                                <Text className="text-red-600 font-medium">{point.inactive ?? 0} inactive</Text>
                            </Text>
                        </View>
                        <Progress value={total ? ((point.active ?? 0) / total) * 100 : 0} indicatorClassName="bg-green-600" />
                    </View>
                );
            })}
        </InsightCard>
    );
}

export function StageDropOffCard({ data, isLoading }: { data?: StageDropOffPoint[]; isLoading?: boolean }) {
    return (
        <InsightCard
            title="Stage Drop-off"
            isLoading={isLoading}
            isEmpty={!data?.length}
            emptyMessage="No drop-off data for this period."
        >
            {data?.map((point, index) => (
                <View key={index} className="gap-1">
                    <View className="flex-row items-center justify-between">
                        <Text className="font-medium">
                            {point.from ?? '—'} → {point.to ?? '—'}
                        </Text>
                        <Text className={cn('font-bold', dropOffColor(point.dropOffRate).replace('bg-', 'text-'))}>
                            {point.dropOffRate ?? 0}%
                        </Text>
                    </View>
                    <Progress value={point.dropOffRate ?? 0} indicatorClassName={dropOffColor(point.dropOffRate)} />
                </View>
            ))}
        </InsightCard>
    );
}
