import React from 'react';
import { View } from 'react-native';
import { Text } from '~/components/ui/text';
import { Separator } from '~/components/ui/separator';
import { useGetGspWorkforceOverviewQuery, useGetGspWorkforceTrendQuery } from '@store/services/gsp-dashboard';
import { THEME_CONFIG } from '@config/appConfig';
import Section from '../components/section';
import { SectionCard, SectionEmpty, SectionError, WorkforceSkeleton } from '../components/states';
import LeagueTable, { LeagueRow } from '../components/league-table';
import ShareDonut from '../components/share-donut';
import SegmentedBar from '../components/segmented-bar';
import TrendChart from '../components/trend-chart';
import GroupByToggle from '../components/group-by-toggle';
import { IUseGspFilters } from '../use-gsp-filters';
import { gspRoutes } from '../routes';
import { campusColor, formatCompactNumber, formatPercent } from '../lib';

interface WorkforceSectionProps {
    filters: IUseGspFilters;
    onCheckCompleteness: () => void;
}

const WorkforceSection: React.FC<WorkforceSectionProps> = ({ filters, onCheckCompleteness }) => {
    const { data, isLoading, isError, refetch } = useGetGspWorkforceOverviewQuery(filters.params);
    const { data: trend } = useGetGspWorkforceTrendQuery({
        ...filters.params,
        groupBy: filters.trendGroupBy,
    });

    const win = filters.win;

    // Workforce trend points expose present/late/total — derive an attendance-rate %.
    const trendPoints = React.useMemo(
        () =>
            (trend?.series ?? []).map(p => ({
                key: p.key,
                label: p.label,
                value: p.total ? Math.round(((p.present + p.late) / p.total) * 100) : 0,
            })),
        [trend]
    );

    const rosterSlices = React.useMemo(
        () => [
            { id: 'active', label: 'Active', value: data?.roster.active ?? 0, color: THEME_CONFIG.success },
            { id: 'inactive', label: 'Inactive', value: data?.roster.inactive ?? 0, color: THEME_CONFIG.lightGray },
            { id: 'dormant', label: 'Dormant', value: data?.roster.dormant ?? 0, color: THEME_CONFIG.warning },
            { id: 'blacklisted', label: 'Blacklisted', value: data?.roster.blacklisted ?? 0, color: THEME_CONFIG.error },
        ],
        [data]
    );

    const attendanceSegments = React.useMemo(
        () => [
            { label: 'Present', value: data?.attendance.present ?? 0, color: THEME_CONFIG.success },
            { label: 'Late', value: data?.attendance.late ?? 0, color: THEME_CONFIG.warning },
            { label: 'Absent', value: data?.attendance.absent ?? 0, color: THEME_CONFIG.error },
        ],
        [data]
    );

    const rows: LeagueRow[] = React.useMemo(
        () =>
            (data?.byCampus ?? []).map(c => ({
                id: c.campusId,
                label: c.campusName,
                value: Math.round(c.rate * 100),
                secondary: `${formatCompactNumber(c.present)}/${formatCompactNumber(c.total)} present`,
                color: campusColor(c.campusId),
            })),
        [data]
    );

    const isEmpty = !isLoading && !isError && !data?.roster.total && !data?.attendance.present;

    return (
        <Section title="Workforce" subtitle="Roster health & service attendance">

            <SectionCard className="gap-4">
                {isLoading ? (
                    <WorkforceSkeleton />
                ) : isError ? (
                    <SectionError onRetry={refetch} />
                ) : isEmpty ? (
                    <SectionEmpty onCheckCompleteness={onCheckCompleteness} />
                ) : (
                    <>
                        <SegmentedBar
                            segments={attendanceSegments}
                            headline={formatPercent(data?.attendance.rate)}
                            headlineCaption="attendance rate"
                        />

                        <Separator />

                        <Text className="text-md font-semibold text-foreground">Roster health</Text>
                        <ShareDonut
                            slices={rosterSlices}
                            centerValue={formatCompactNumber(data?.roster.total)}
                            centerLabel="workers"
                        />

                        {filters.isGlobal && rows.length > 0 && (
                            <>
                                <Separator />
                                <Text className="text-md font-semibold text-foreground">Attendance rate by campus</Text>
                                <LeagueTable
                                    rows={rows}
                                    valueFormatter={v => `${v}%`}
                                    onRowPress={r => gspRoutes.campus(r.id, win)}
                                />
                            </>
                        )}

                        {!filters.hasService && trendPoints.length > 0 && (
                            <>
                                <Separator />
                                <View className="flex-row items-center justify-between">
                                    <Text className="text-md font-semibold text-foreground">Attendance trend</Text>
                                    <GroupByToggle value={filters.trendGroupBy} onChange={filters.setTrendGroupBy} />
                                </View>
                                <TrendChart
                                    data={trendPoints}
                                    color={THEME_CONFIG.info}
                                    maxPoints={filters.trendGroupBy === 'service' ? 12 : 6}
                                    valueFormatter={v => `${Math.round(v)}%`}
                                />
                            </>
                        )}
                    </>
                )}
            </SectionCard>
        </Section>
    );
};

export default React.memo(WorkforceSection);
