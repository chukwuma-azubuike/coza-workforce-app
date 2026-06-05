import React from 'react';
import { View } from 'react-native';
import { Separator } from '~/components/ui/separator';
import { Text } from '~/components/ui/text';
import { useGetGspGuestsQuery } from '@store/services/gsp-dashboard';
import { THEME_CONFIG } from '@config/appConfig';
import Section from '../components/section';
import { GuestsSkeleton, SectionCard, SectionEmpty, SectionError } from '../components/states';
import KpiCard from '../components/kpi-card';
import LeagueTable, { LeagueRow } from '../components/league-table';
import TrendChart from '../components/trend-chart';
import { IUseGspFilters } from '../use-gsp-filters';
import { gspRoutes } from '../routes';
import { campusColor, formatCompactNumber } from '../lib';

interface GuestsSectionProps {
    filters: IUseGspFilters;
    onCheckCompleteness: () => void;
}

const GuestsSection: React.FC<GuestsSectionProps> = ({ filters, onCheckCompleteness }) => {
    const { data, isLoading, isError, refetch } = useGetGspGuestsQuery(filters.params);

    const win = {
        startDate: filters.window.start,
        endDate: filters.window.end,
        campusId: filters.isGlobal ? undefined : filters.campusId,
    };

    const rows: LeagueRow[] = React.useMemo(
        () =>
            (data?.byCampus ?? []).map(c => ({
                id: c.campusId,
                label: c.campusName,
                value: c.firstTimers + c.newConverts,
                secondary: `${formatCompactNumber(c.firstTimers)} FT · ${formatCompactNumber(c.newConverts)} NC`,
                color: campusColor(c.campusId),
            })),
        [data]
    );

    const trendPoints = React.useMemo(
        () => (data?.trend ?? []).map(p => ({ key: p.key, label: p.label, value: p.firstTimers + p.newConverts })),
        [data]
    );

    const isEmpty = !isLoading && !isError && !data?.totals.totalGuests;

    return (
        <Section
            title="Guests"
            subtitle="First timers & new converts"
            actionLabel="First timers"
            onActionPress={() => gspRoutes.metric('firstTimers', 'campus', win)}
        >
            <SectionCard className="gap-4">
                {isLoading ? (
                    <GuestsSkeleton />
                ) : isError ? (
                    <SectionError onRetry={refetch} />
                ) : isEmpty ? (
                    <SectionEmpty onCheckCompleteness={onCheckCompleteness} />
                ) : (
                    <>
                        <View className="flex-row gap-4">
                            <KpiCard
                                compact
                                label="First Timers"
                                value={data?.totals.firstTimers}
                                accentColor={THEME_CONFIG.warning}
                                onPress={() => gspRoutes.metric('firstTimers', 'campus', win)}
                            />
                            <KpiCard
                                compact
                                label="New Converts"
                                value={data?.totals.newConverts}
                                accentColor={THEME_CONFIG.success}
                                onPress={() => gspRoutes.metric('newConverts', 'campus', win)}
                            />
                        </View>

                        {filters.isGlobal && rows.length > 0 && (
                            <>
                                <Separator />
                                <Text className="text-md font-semibold text-foreground">Guests by campus</Text>
                                <LeagueTable rows={rows} onRowPress={r => gspRoutes.campus(r.id, win)} />
                            </>
                        )}

                        {trendPoints.length > 0 && (
                            <>
                                <Separator />
                                <Text className="text-md font-semibold text-foreground">Total guests trend</Text>
                                <TrendChart data={trendPoints} color={THEME_CONFIG.warning} maxPoints={6} />
                            </>
                        )}
                    </>
                )}
            </SectionCard>
        </Section>
    );
};

export default React.memo(GuestsSection);
