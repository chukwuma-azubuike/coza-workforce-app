import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { CountUp } from 'use-count-up';
import { Text } from '~/components/ui/text';
import { Separator } from '~/components/ui/separator';
import ViewWrapper from '~/components/layout/viewWrapper';
import ErrorBoundary from '@components/composite/error-boundary';
import { useGetGspMetricQuery, getMetricMeta, IGspGroupBy } from '@store/services/gsp-dashboard';
import { THEME_CONFIG } from '@config/appConfig';
import { cn } from '~/lib/utils';

import LeagueTable, { LeagueRow } from '../components/league-table';
import ShareDonut from '../components/share-donut';
import TrendChart from '../components/trend-chart';
import { SectionCard, SectionEmpty, SectionError, SectionSkeleton } from '../components/states';
import { gspRoutes } from '../routes';
import { campusColor, formatCompactNumber, formatPercent } from '../lib';

const DIMENSIONS: { value: IGspGroupBy; label: string }[] = [
    { value: 'campus', label: 'By Campus' },
    { value: 'service', label: 'By Service' },
    { value: 'month', label: 'By Month' },
];

/** Generic any-metric / any-dimension explorer powering every KPI breakdown. */
const MetricExplorer: React.FC = () => {
    const params = useLocalSearchParams<{
        metricKey: string;
        groupBy?: IGspGroupBy;
        startDate?: string;
        endDate?: string;
        campusId?: string;
    }>();

    const [groupBy, setGroupBy] = React.useState<IGspGroupBy>(params.groupBy ?? 'campus');
    const meta = getMetricMeta(params.metricKey as string);
    const isRate = meta.format === 'rate';

    const startDate = params.startDate ? Number(params.startDate) : undefined;
    const endDate = params.endDate ? Number(params.endDate) : undefined;
    const campusId = params.campusId || undefined;

    const { data, isLoading, isError, isFetching, refetch } = useGetGspMetricQuery(
        { metricKey: params.metricKey as string, groupBy, startDate, endDate, campusId },
        { skip: !params.metricKey }
    );

    const win = { startDate, endDate, campusId };

    const fmt = (v: number) => (isRate ? `${Math.round(v <= 1 ? v * 100 : v)}%` : formatCompactNumber(v));

    const rows: LeagueRow[] = React.useMemo(
        () =>
            (data?.series ?? []).map(p => ({
                id: p.key,
                label: p.label,
                value: p.value,
                share: p.share,
                color: groupBy === 'campus' ? campusColor(p.key) : THEME_CONFIG.primary,
            })),
        [data, groupBy]
    );

    const trendPoints = React.useMemo(
        () => (data?.series ?? []).map(p => ({ key: p.key, label: p.label, value: p.value })),
        [data]
    );

    const isEmpty = !isLoading && !isError && rows.length === 0;

    return (
        <ViewWrapper scroll noPadding refreshing={false} onRefresh={refetch} className="flex-1">
            <View className="px-4 gap-5 pt-4 pb-10">
                <View className="gap-0.5">
                    <Text className="!text-[13px] font-semibold uppercase tracking-widest text-muted-foreground">
                        Metric
                    </Text>
                    <Text className="text-2xl font-bold text-foreground">{meta.label}</Text>
                </View>

                <View className="flex-row p-0.5 rounded-full bg-secondary self-start">
                    {DIMENSIONS.map(d => {
                        const active = d.value === groupBy;
                        return (
                            <TouchableOpacity
                                key={d.value}
                                activeOpacity={0.7}
                                onPress={() => setGroupBy(d.value)}
                                className={cn('px-3.5 h-9 rounded-full items-center justify-center', active && 'bg-background')}
                            >
                                <Text
                                    className={cn(
                                        '!text-[12px] font-semibold',
                                        active ? 'text-primary' : 'text-muted-foreground'
                                    )}
                                >
                                    {d.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <SectionCard className="gap-4">
                    {isLoading ? (
                        <SectionSkeleton rows={6} />
                    ) : isError ? (
                        <SectionError onRetry={refetch} />
                    ) : isEmpty ? (
                        <SectionEmpty />
                    ) : (
                        <ErrorBoundary>
                            <View className="flex-row items-baseline gap-2">
                                <Text className="!text-[34px] font-bold text-foreground leading-none">
                                    {isRate ? (
                                        formatPercent((data?.total ?? 0) <= 1 ? data?.total : (data?.total ?? 0) / 100)
                                    ) : (
                                        <CountUp isCounting duration={1.4} end={data?.total ?? 0} formatter={formatCompactNumber} />
                                    )}
                                </Text>
                                <Text className="text-md text-muted-foreground">total</Text>
                            </View>

                            {groupBy === 'campus' && !isRate && rows.length > 0 && (
                                <>
                                    <ShareDonut
                                        slices={rows.map(r => ({ id: r.id, label: r.label, value: r.value, color: r.color! }))}
                                        centerValue={formatCompactNumber(data?.total)}
                                        centerLabel="campuses"
                                    />
                                    <Separator />
                                </>
                            )}

                            {groupBy === 'month' ? (
                                <TrendChart data={trendPoints} valueFormatter={fmt} maxPoints={12} />
                            ) : (
                                <LeagueTable
                                    rows={rows}
                                    valueFormatter={fmt}
                                    maxRows={20}
                                    onRowPress={groupBy === 'campus' ? r => gspRoutes.campus(r.id, win) : undefined}
                                />
                            )}

                            {isFetching && <Text className="!text-[11px] text-muted-foreground">Updating…</Text>}
                        </ErrorBoundary>
                    )}
                </SectionCard>
            </View>
        </ViewWrapper>
    );
};

export default MetricExplorer;
