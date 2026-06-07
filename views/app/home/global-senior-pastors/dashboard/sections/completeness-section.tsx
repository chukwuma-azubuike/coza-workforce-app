import React from 'react';
import { TouchableOpacity } from 'react-native';
import { ChevronRight, ClipboardCheck } from 'lucide-react-native';
import { Text } from '~/components/ui/text';
import { Separator } from '~/components/ui/separator';
import { useGetGspCompletenessQuery } from '@store/services/gsp-dashboard';
import { THEME_CONFIG } from '@config/appConfig';
import Section from '../components/section';
import { CompletenessSkeleton, SectionCard, SectionError } from '../components/states';
import CompletenessFunnel from '../components/completeness-funnel';
import LeagueTable, { LeagueRow } from '../components/league-table';
import { IUseGspFilters } from '../use-gsp-filters';
import { gspRoutes } from '../routes';
import { campusColor, rateTone } from '../lib';

interface CompletenessSectionProps {
    filters: IUseGspFilters;
}

const toneColor = { good: THEME_CONFIG.success, warn: THEME_CONFIG.warning, bad: THEME_CONFIG.error } as const;

/** Submission & approval funnel + per-campus progress + a pending-approval CTA. */
const CompletenessSection: React.FC<CompletenessSectionProps> = ({ filters }) => {
    const { data, isLoading, isError, refetch } = useGetGspCompletenessQuery(filters.params);

    const win = filters.win;

    const rows: LeagueRow[] = React.useMemo(
        () =>
            (data?.byCampus ?? []).map(c => ({
                id: c.campusId,
                label: c.campusName,
                value: Math.round(c.rate * 100),
                secondary: `${c.approved}/${c.expected} approved`,
                color: toneColor[rateTone(c.rate)] ?? campusColor(c.campusId),
            })),
        [data]
    );

    return (
        <Section title="Report completeness" subtitle="Approval pipeline & per-campus progress" actionLabel="Details" onActionPress={() => gspRoutes.completeness(win)}>
            <SectionCard className="gap-4">
                {isLoading ? (
                    <CompletenessSkeleton />
                ) : isError ? (
                    <SectionError onRetry={refetch} />
                ) : (
                    <>
                        {(data?.pendingGspApproval ?? 0) > 0 ? (
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => gspRoutes.approvals()}
                                className="flex-row items-center gap-3 p-3 rounded-xl bg-amber-100 dark:bg-amber-900/20"
                            >
                                <ClipboardCheck size={20} color={THEME_CONFIG.warning} />
                                <Text className="text-sm font-semibold text-amber-700 dark:text-amber-400 flex-1">
                                    {data?.pendingGspApproval} report{data?.pendingGspApproval === 1 ? '' : 's'} awaiting
                                    your approval
                                </Text>
                                <ChevronRight size={18} color={THEME_CONFIG.warning} />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => gspRoutes.approvals()}
                                className="flex-row items-center gap-3 p-3 rounded-xl bg-secondary"
                            >
                                <ClipboardCheck size={20} color={THEME_CONFIG.primary} />
                                <Text className="text-sm font-semibold text-foreground flex-1">Open approvals inbox</Text>
                                <ChevronRight size={18} color={THEME_CONFIG.lightGray} />
                            </TouchableOpacity>
                        )}

                        <CompletenessFunnel byStatus={data?.byStatus} />

                        {rows.length > 0 && (
                            <>
                                <Separator />
                                <Text className="text-md font-semibold text-foreground">Campus submission</Text>
                                <LeagueTable rows={rows} valueFormatter={v => `${v}%`} maxRows={8} />
                            </>
                        )}
                    </>
                )}
            </SectionCard>
        </Section>
    );
};

export default React.memo(CompletenessSection);
