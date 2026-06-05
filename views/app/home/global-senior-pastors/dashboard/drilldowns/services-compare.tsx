import React from 'react';
import dayjs from 'dayjs';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Text } from '~/components/ui/text';
import ViewWrapper from '~/components/layout/viewWrapper';
import ErrorBoundary from '@components/composite/error-boundary';
import { useGetGspServicesQuery } from '@store/services/gsp-dashboard';
import { THEME_CONFIG } from '@config/appConfig';

import LeagueTable, { LeagueRow } from '../components/league-table';
import { SectionCard, SectionEmpty, SectionError, SectionSkeleton } from '../components/states';
import { formatCompactNumber } from '../lib';

/** Full service-on-service comparison for the selected window. */
const ServicesCompare: React.FC = () => {
    const { startDate, endDate, campusId } = useLocalSearchParams<{
        startDate?: string;
        endDate?: string;
        campusId?: string;
    }>();

    const { data, isLoading, isError, refetch } = useGetGspServicesQuery({
        startDate: startDate ? Number(startDate) : undefined,
        endDate: endDate ? Number(endDate) : undefined,
        campusId: campusId || undefined,
    });

    const rows: LeagueRow[] = React.useMemo(
        () =>
            (data?.services ?? []).map(s => ({
                id: s.serviceId,
                label: s.label,
                value: s.churchAttendanceTotal,
                secondary: `${dayjs.unix(s.serviceTime).format('MMM D')} · ${s.campusesReporting} campuses · ${formatCompactNumber(
                    s.firstTimers
                )} FT`,
                color: THEME_CONFIG.primary,
            })),
        [data]
    );

    const isEmpty = !isLoading && !isError && rows.length === 0;

    return (
        <ViewWrapper scroll noPadding refreshing={false} onRefresh={refetch} className="flex-1">
            <View className="px-4 gap-5 pt-4 pb-10">
                <View className="gap-0.5">
                    <Text className="!text-[13px] font-semibold uppercase tracking-widest text-muted-foreground">
                        Compare
                    </Text>
                    <Text className="text-2xl font-bold text-foreground">Services</Text>
                </View>
                <SectionCard>
                    {isLoading ? (
                        <SectionSkeleton rows={6} />
                    ) : isError ? (
                        <SectionError onRetry={refetch} />
                    ) : isEmpty ? (
                        <SectionEmpty message="No services with approved reports this period." />
                    ) : (
                        <ErrorBoundary>
                            <LeagueTable rows={rows} maxRows={30} />
                        </ErrorBoundary>
                    )}
                </SectionCard>
            </View>
        </ViewWrapper>
    );
};

export default ServicesCompare;
