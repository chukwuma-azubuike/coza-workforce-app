import React from 'react';
import { View } from 'react-native';
import { CountUp } from 'use-count-up';
import { Text } from '~/components/ui/text';
import { Separator } from '~/components/ui/separator';
import { useGetGspAttendanceByCampusQuery, useGetGspAttendanceTrendQuery } from '@store/services/gsp-dashboard';
import { THEME_CONFIG } from '@config/appConfig';
import Section from '../components/section';
import { SectionCard, SectionEmpty, SectionError, SectionSkeleton } from '../components/states';
import LeagueTable, { LeagueRow } from '../components/league-table';
import ShareDonut from '../components/share-donut';
import TrendChart from '../components/trend-chart';
import GroupByToggle from '../components/group-by-toggle';
import { IUseGspFilters } from '../use-gsp-filters';
import { gspRoutes } from '../routes';
import { campusColor, formatCompactNumber } from '../lib';

interface AttendanceSectionProps {
    filters: IUseGspFilters;
    onCheckCompleteness: () => void;
}

const AttendanceSection: React.FC<AttendanceSectionProps> = ({ filters, onCheckCompleteness }) => {
    const { data, isLoading, isError, refetch } = useGetGspAttendanceByCampusQuery(filters.params);
    const { data: trend, isFetching: trendFetching } = useGetGspAttendanceTrendQuery({
        ...filters.params,
        groupBy: filters.trendGroupBy,
    });

    const win = {
        startDate: filters.window.start,
        endDate: filters.window.end,
        campusId: filters.isGlobal ? undefined : filters.campusId,
    };

    const rows: LeagueRow[] = React.useMemo(
        () =>
            (data?.breakdown ?? []).map(c => ({
                id: c.campusId,
                label: c.campusName,
                value: c.total,
                share: c.share,
                secondary: `${formatCompactNumber(c.men + c.women)} adults · ${formatCompactNumber(c.children)} children`,
            })),
        [data]
    );

    const donutSlices = React.useMemo(() => {
        if (filters.isGlobal) {
            return (data?.breakdown ?? []).map(c => ({
                id: c.campusId,
                label: c.campusName,
                value: c.total,
                color: campusColor(c.campusId),
            }));
        }
        const c = data?.breakdown?.[0];
        return [
            { id: 'men', label: 'Men', value: c?.men ?? 0, color: THEME_CONFIG.primary },
            { id: 'women', label: 'Women', value: c?.women ?? 0, color: THEME_CONFIG.rose },
            { id: 'children', label: 'Children', value: c?.children ?? 0, color: THEME_CONFIG.info },
        ];
    }, [data, filters.isGlobal]);

    const isEmpty = !isLoading && !isError && !data?.total;

    return (
        <Section
            title="Church Attendance"
            subtitle={filters.window.label}
            actionLabel="Breakdown"
            onActionPress={() => gspRoutes.metric('churchAttendanceTotal', 'campus', win)}
        >
            <SectionCard className="gap-4">
                {isLoading ? (
                    <SectionSkeleton rows={5} />
                ) : isError ? (
                    <SectionError onRetry={refetch} />
                ) : isEmpty ? (
                    <SectionEmpty onCheckCompleteness={onCheckCompleteness} />
                ) : (
                    <>
                        <View className="flex-row items-baseline gap-2">
                            <Text className="!text-[34px] font-bold text-foreground leading-none">
                                <CountUp isCounting duration={1.4} end={data?.total ?? 0} formatter={formatCompactNumber} />
                            </Text>
                            <Text className="text-md text-muted-foreground">total attendance</Text>
                        </View>

                        <ShareDonut
                            slices={donutSlices}
                            centerValue={formatCompactNumber(data?.total)}
                            centerLabel={filters.isGlobal ? 'campuses' : 'split'}
                        />

                        {filters.isGlobal && rows.length > 0 && (
                            <>
                                <Separator />
                                <LeagueTable
                                    rows={rows}
                                    onRowPress={r => gspRoutes.campus(r.id, win)}
                                />
                            </>
                        )}

                        {!!trend?.series?.length && (
                            <>
                                <Separator />
                                <View className="flex-row items-center justify-between">
                                    <Text className="text-md font-semibold text-foreground">Trend</Text>
                                    <GroupByToggle value={filters.trendGroupBy} onChange={filters.setTrendGroupBy} />
                                </View>
                                <TrendChart
                                    data={trend.series}
                                    color={THEME_CONFIG.primary}
                                    maxPoints={filters.trendGroupBy === 'service' ? 12 : 6}
                                />
                                {trendFetching && <Text className="!text-[11px] text-muted-foreground">Updating…</Text>}
                            </>
                        )}
                    </>
                )}
            </SectionCard>
        </Section>
    );
};

export default React.memo(AttendanceSection);
