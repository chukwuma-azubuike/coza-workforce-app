import React from 'react';
import { View } from 'react-native';
import { useGetGspOverviewQuery } from '@store/services/gsp-dashboard';
import { THEME_CONFIG } from '@config/appConfig';
import KpiCard from '../components/kpi-card';
import CompletenessBanner from '../components/completeness-banner';
import { SectionCard, SectionError } from '../components/states';
import { IUseGspFilters } from '../use-gsp-filters';
import { gspRoutes } from '../routes';
import { formatPercent, getQueryErrorMessage } from '../lib';

interface OverviewSectionProps {
    filters: IUseGspFilters;
}

/**
 * Global KPI cards + the completeness trust banner. This is the dashboard's
 * "accumulate" layer — every total here is tappable into its by-campus breakdown.
 */
const OverviewSection: React.FC<OverviewSectionProps> = ({ filters }) => {
    const { data, isLoading, isError, error, refetch } = useGetGspOverviewQuery(filters.paramsWithCompare);

    React.useEffect(() => {
        if (__DEV__ && isError) {
            // eslint-disable-next-line no-console
            console.warn('[GSP /overview] request failed', error);
        }
    }, [isError, error]);

    const k = data?.kpis;
    const win = { startDate: filters.window.start, endDate: filters.window.end, campusId: filters.isGlobal ? undefined : filters.campusId };

    if (isError) {
        return (
            <SectionCard>
                <SectionError message={getQueryErrorMessage(error)} onRetry={refetch} />
            </SectionCard>
        );
    }

    return (
        <View className="gap-4">
            <CompletenessBanner
                isLoading={isLoading}
                rate={data?.completeness.rate}
                reportsApproved={data?.completeness.reportsApproved}
                reportsExpected={data?.completeness.expected}
                campusesReporting={k?.campusesReporting.value}
                campusesTotal={k?.campusesReporting.of}
                onPress={() => gspRoutes.completeness(win)}
            />

            <View className="gap-4">
                <View className="flex-row gap-4">
                    <KpiCard
                        compact
                        label="Church Attendance"
                        value={k?.churchAttendanceTotal.value}
                        delta={k?.churchAttendanceTotal.delta}
                        accentColor={THEME_CONFIG.primary}
                        isLoading={isLoading}
                        onPress={() => gspRoutes.metric('churchAttendanceTotal', 'campus', win)}
                    />
                    <KpiCard
                        label="Workforce Attendance"
                        displayValue={k ? formatPercent(k.workforceAttendance.rate) : undefined}
                        footnote={k ? `${k.workforceAttendance.present.toLocaleString()} present` : undefined}
                        delta={k?.workforceAttendance.delta}
                        accentColor={THEME_CONFIG.info}
                        isLoading={isLoading}
                    />
                </View>

                <View className="flex-row gap-4">
                    <KpiCard
                        compact
                        label="First Timers"
                        value={k?.firstTimers.value}
                        delta={k?.firstTimers.delta}
                        accentColor={THEME_CONFIG.warning}
                        isLoading={isLoading}
                        onPress={() => gspRoutes.metric('firstTimers', 'campus', win)}
                    />
                    <KpiCard
                        compact
                        label="New Converts"
                        value={k?.newConverts.value}
                        delta={k?.newConverts.delta}
                        accentColor={THEME_CONFIG.success}
                        isLoading={isLoading}
                        onPress={() => gspRoutes.metric('newConverts', 'campus', win)}
                    />
                </View>

                <View className="flex-row gap-4">
                    <KpiCard
                        compact
                        label="Workforce"
                        value={k?.workforceTotal.value}
                        footnote={k ? `${k.workforceTotal.active.toLocaleString()} active` : undefined}
                        accentColor={THEME_CONFIG.primaryLight}
                        isLoading={isLoading}
                    />
                    <KpiCard
                        compact
                        label="Cars"
                        value={k?.totalCars.value}
                        accentColor={THEME_CONFIG.blue}
                        isLoading={isLoading}
                        onPress={() => gspRoutes.metric('cars', 'campus', win)}
                    />
                </View>

                <View className="flex-row gap-4">
                    <KpiCard
                        compact
                        label="Guests Transferred"
                        value={k?.totalGuestsTransferred.value}
                        accentColor={THEME_CONFIG.rose}
                        isLoading={isLoading}
                        onPress={() => gspRoutes.metric('totalTransferred', 'campus', win)}
                    />
                    <KpiCard
                        label="Campuses Reporting"
                        value={k?.campusesReporting.value}
                        total={k?.campusesReporting.of}
                        accentColor={THEME_CONFIG.gray}
                        isLoading={isLoading}
                        onPress={() => gspRoutes.completeness(win)}
                    />
                </View>
            </View>
        </View>
    );
};

export default React.memo(OverviewSection);
