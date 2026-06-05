import React from 'react';
import { View } from 'react-native';
import { Skeleton } from '~/components/ui/skeleton';
import { Card } from '~/components/ui/card';
import { Separator } from '~/components/ui/separator';
import ViewWrapper from '@components/layout/viewWrapper';

const GreetingSkeleton: React.FC = () => (
    <View className="px-4 pt-4 pb-2 gap-2">
        <Skeleton className="h-7 w-3/5 rounded-lg" />
        <Skeleton className="h-4 w-2/5 rounded" />
    </View>
);

const ClockCardSkeleton: React.FC = () => (
    <Card className="min-h-[190px]">
        <View className="p-4 gap-4">
            <View className="flex-row items-center gap-2">
                <Skeleton className="w-4 h-4 rounded-full" />
                <Skeleton className="h-3.5 w-36 rounded" />
            </View>
            <View className="gap-2">
                <Skeleton className="h-4 w-4/5 rounded" />
                <Skeleton className="h-3.5 w-1/2 rounded" />
            </View>
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-3.5 w-36 rounded" />
        </View>
    </Card>
);

const KpiTileSkeleton: React.FC = () => (
    <Card className="flex-1 p-1">
        <View className="p-3.5 gap-3">
            <Skeleton className="h-3 w-3/4 rounded" />
            <Skeleton className="h-8 w-1/2 rounded" />
            <Skeleton className="h-5 w-20 rounded-full" />
        </View>
    </Card>
);

export const KpiGridSkeleton: React.FC = () => (
    <View className="gap-4">
        <View className="flex-row gap-4"><KpiTileSkeleton /><KpiTileSkeleton /></View>
        <View className="flex-row gap-4"><KpiTileSkeleton /><KpiTileSkeleton /></View>
    </View>
);

export const QuickActionsSkeleton: React.FC = () => (
    <View className="gap-3">
        <Skeleton className="h-5 w-28 rounded" />
        <View className="flex-row gap-3">
            {[1, 2, 3, 4].map(i => (
                <Card key={i} className="flex-1 items-center py-4 gap-2.5 bg-muted-background">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <Skeleton className="h-3 w-12 rounded" />
                </Card>
            ))}
        </View>
    </View>
);

export const ReportsStatusSkeleton: React.FC = () => (
    <View className="gap-3">
        <View className="flex-row items-center justify-between">
            <Skeleton className="h-5 w-40 rounded" />
            <Skeleton className="h-4 w-24 rounded" />
        </View>
        <Separator />
        <View className="gap-2">
            {[1, 2, 3].map(i => (
                <View key={i} className="flex-row items-center justify-between rounded-xl px-4 py-3 bg-muted-background" style={{ height: 48 }}>
                    <Skeleton className="h-4 w-2/5 rounded" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                </View>
            ))}
        </View>
    </View>
);

const HomeSkeleton: React.FC = () => (
    <ViewWrapper scroll noPadding refreshing={false} className="flex-1">
        <GreetingSkeleton />
        <View className="px-4 gap-5 pt-2 pb-8">
            <ClockCardSkeleton />
            <KpiGridSkeleton />
            <QuickActionsSkeleton />
            <Separator />
            <ReportsStatusSkeleton />
        </View>
    </ViewWrapper>
);

export default HomeSkeleton;
