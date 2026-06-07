import React from 'react';
import dayjs from 'dayjs';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { CountUp } from 'use-count-up';
import { Text } from '~/components/ui/text';
import ViewWrapper from '~/components/layout/viewWrapper';
import ErrorBoundary from '@components/composite/error-boundary';
import { useGetGspCampusQuery } from '@store/services/gsp-dashboard';
import { THEME_CONFIG } from '@config/appConfig';

import KpiCard from '../components/kpi-card';
import ShareDonut from '../components/share-donut';
import SegmentedBar from '../components/segmented-bar';
import LeagueTable, { LeagueRow } from '../components/league-table';
import { SectionCard, SectionEmpty, SectionError, SectionSkeleton } from '../components/states';
import Section from '../components/section';
import { formatCompactNumber, formatPercent } from '../lib';

/** Single-campus drill-down — the same metric rhythm scoped to one location. */
const CampusDrilldown: React.FC = () => {
    const { campusId, startDate, endDate, serviceId } = useLocalSearchParams<{
        campusId: string;
        startDate?: string;
        endDate?: string;
        serviceId?: string;
    }>();

    const { data, isLoading, isError, refetch } = useGetGspCampusQuery(
        {
            campusId: campusId as string,
            startDate: startDate ? Number(startDate) : undefined,
            endDate: endDate ? Number(endDate) : undefined,
            serviceId: serviceId || undefined,
        },
        { skip: !campusId }
    );

    const m = data?.metrics;

    const splitSlices = React.useMemo(
        () => [
            { id: 'adults', label: 'Adults', value: m?.churchAttendanceAdults ?? 0, color: THEME_CONFIG.primary },
            { id: 'children', label: 'Children', value: m?.childrenAttendance ?? 0, color: THEME_CONFIG.info },
        ],
        [m]
    );

    const serviceRows: LeagueRow[] = React.useMemo(
        () =>
            (data?.services ?? []).map(s => ({
                id: s.serviceId,
                label: s.label,
                value: s.churchAttendanceTotal,
                secondary: `${dayjs.unix(s.serviceTime).format('MMM D')} · ${formatCompactNumber(s.firstTimers)} FT`,
                color: THEME_CONFIG.primary,
            })),
        [data]
    );

    const isEmpty = !isLoading && !isError && !m?.churchAttendanceTotal;

    return (
        <ViewWrapper scroll noPadding refreshing={false} onRefresh={refetch} className="flex-1">
            <View className="px-4 gap-6 pt-4 pb-10">
                <View className="gap-0.5">
                    <Text className="!text-[13px] font-semibold uppercase tracking-widest text-muted-foreground">
                        Campus
                    </Text>
                    <Text className="text-2xl font-bold text-foreground">{data?.campus.campusName ?? 'Campus'}</Text>
                </View>

                {isLoading ? (
                    <SectionSkeleton rows={8} />
                ) : isError ? (
                    <SectionCard>
                        <SectionError onRetry={refetch} />
                    </SectionCard>
                ) : isEmpty ? (
                    <SectionCard>
                        <SectionEmpty />
                    </SectionCard>
                ) : (
                    <ErrorBoundary>
                        <Section title="Church Attendance">
                            <SectionCard className="gap-4">
                                <View className="flex-row items-baseline gap-2">
                                    <Text className="!text-[34px] font-bold text-foreground leading-none">
                                        <CountUp
                                            isCounting
                                            duration={1.4}
                                            end={m?.churchAttendanceTotal ?? 0}
                                            formatter={formatCompactNumber}
                                        />
                                    </Text>
                                    <Text className="text-md text-muted-foreground">total</Text>
                                </View>
                                <ShareDonut
                                    slices={splitSlices}
                                    centerValue={formatCompactNumber(m?.churchAttendanceTotal)}
                                    centerLabel="split"
                                />
                            </SectionCard>
                        </Section>

                        <View className="flex-row gap-4">
                            <KpiCard compact label="First Timers" value={m?.firstTimers} accentColor={THEME_CONFIG.warning} />
                            <KpiCard compact label="New Converts" value={m?.newConverts} accentColor={THEME_CONFIG.success} />
                        </View>
                        <View className="flex-row gap-4">
                            <KpiCard compact label="Cars" value={m?.cars} accentColor={THEME_CONFIG.blue} />
                            <KpiCard
                                compact
                                label="Workforce"
                                value={m?.workforce.total}
                                footnote={`${formatCompactNumber(m?.workforce.present)} present`}
                                accentColor={THEME_CONFIG.primaryLight}
                            />
                        </View>

                        <Section title="Workforce attendance">
                            <SectionCard>
                                <SegmentedBar
                                    headline={m?.workforce.rate !== undefined ? formatPercent(m.workforce.rate) : undefined}
                                    headlineCaption={
                                        m?.workforce.expected
                                            ? `${formatCompactNumber(
                                                  (m.workforce.present ?? 0) + (m.workforce.late ?? 0)
                                              )} of ${formatCompactNumber(m.workforce.expected)} expected`
                                            : undefined
                                    }
                                    segments={[
                                        { label: 'Present', value: m?.workforce.present ?? 0, color: THEME_CONFIG.success },
                                        { label: 'Late', value: m?.workforce.late ?? 0, color: THEME_CONFIG.warning },
                                        { label: 'Absent', value: m?.workforce.absent ?? 0, color: THEME_CONFIG.error },
                                    ]}
                                    footnote={
                                        m?.workforce.permitted
                                            ? `${formatCompactNumber(m.workforce.permitted)} on approved permission`
                                            : undefined
                                    }
                                />
                            </SectionCard>
                        </Section>

                        {serviceRows.length > 0 && (
                            <Section title="Services">
                                <SectionCard>
                                    <LeagueTable rows={serviceRows} maxRows={12} />
                                </SectionCard>
                            </Section>
                        )}
                    </ErrorBoundary>
                )}
            </View>
        </ViewWrapper>
    );
};

export default CampusDrilldown;
