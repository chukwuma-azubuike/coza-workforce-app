import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ClipboardCheck } from 'lucide-react-native';
import { Text } from '~/components/ui/text';
import ViewWrapper from '~/components/layout/viewWrapper';
import ErrorBoundary from '@components/composite/error-boundary';
import { useGetGspCompletenessQuery } from '@store/services/gsp-dashboard';
import { THEME_CONFIG } from '@config/appConfig';

import CompletenessFunnel from '../components/completeness-funnel';
import LeagueTable, { LeagueRow } from '../components/league-table';
import { SectionCard, SectionError, SectionSkeleton } from '../components/states';
import Section from '../components/section';
import { rateTone } from '../lib';

const toneColor = { good: THEME_CONFIG.success, warn: THEME_CONFIG.warning, bad: THEME_CONFIG.error } as const;

/** Full submission/approval completeness breakdown for the selected window. */
const CompletenessDetail: React.FC = () => {
    const { startDate, endDate, campusId } = useLocalSearchParams<{
        startDate?: string;
        endDate?: string;
        campusId?: string;
    }>();

    const { data, isLoading, isError, refetch } = useGetGspCompletenessQuery({
        startDate: startDate ? Number(startDate) : undefined,
        endDate: endDate ? Number(endDate) : undefined,
        campusId: campusId || undefined,
    });

    const rows: LeagueRow[] = React.useMemo(
        () =>
            (data?.byCampus ?? []).map(c => ({
                id: c.campusId,
                label: c.campusName,
                value: Math.round(c.rate * 100),
                secondary: `${c.approved}/${c.expected} approved`,
                color: toneColor[rateTone(c.rate)],
            })),
        [data]
    );

    return (
        <ViewWrapper scroll noPadding refreshing={false} onRefresh={refetch} className="flex-1">
            <View className="px-4 gap-6 pt-4 pb-10">
                <View className="gap-0.5">
                    <Text className="!text-[13px] font-semibold uppercase tracking-widest text-muted-foreground">
                        Trust signal
                    </Text>
                    <Text className="text-2xl font-bold text-foreground">Report completeness</Text>
                </View>

                {isLoading ? (
                    <SectionCard>
                        <SectionSkeleton rows={8} />
                    </SectionCard>
                ) : isError ? (
                    <SectionCard>
                        <SectionError onRetry={refetch} />
                    </SectionCard>
                ) : (
                    <ErrorBoundary>
                        {(data?.pendingGspApproval ?? 0) > 0 && (
                            <View className="flex-row items-center gap-3 p-4 rounded-2xl bg-amber-100 dark:bg-amber-900/20">
                                <ClipboardCheck size={22} color={THEME_CONFIG.warning} />
                                <Text className="text-md font-semibold text-amber-700 dark:text-amber-400 flex-1">
                                    {data?.pendingGspApproval} reports awaiting your approval
                                </Text>
                            </View>
                        )}

                        <Section title="Approval pipeline">
                            <SectionCard>
                                <CompletenessFunnel byStatus={data?.byStatus} />
                            </SectionCard>
                        </Section>

                        {rows.length > 0 && (
                            <Section title="Campus submission">
                                <SectionCard>
                                    <LeagueTable rows={rows} valueFormatter={v => `${v}%`} maxRows={30} />
                                </SectionCard>
                            </Section>
                        )}
                    </ErrorBoundary>
                )}
            </View>
        </ViewWrapper>
    );
};

export default CompletenessDetail;
