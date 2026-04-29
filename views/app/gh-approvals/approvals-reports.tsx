import React, { memo, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, useColorScheme } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';

import { Text } from '~/components/ui/text';
import { Card } from '~/components/ui/card';
import { Skeleton } from '~/components/ui/skeleton';
import AvatarComponent from '@components/atoms/avatar';
import useRole from '@hooks/role';
import { AVATAR_FALLBACK_URL } from '@constants/index';
import { useGetGhReportByIdQuery } from '@store/services/grouphead';
import { useGetLatestServiceQuery } from '@store/services/services';
import { IReportStatus } from '@store/types';
import { ICampusReportSummary } from '@store/services/reports';
import FilterChip from './approvals-filter-chip';

type DeptReport = ICampusReportSummary['departmentalReport'][0];
type ReportFilter = IReportStatus.PENDING | IReportStatus.SUBMITTED | IReportStatus.GSP_SUBMITTED;

const REPORT_FILTERS: { key: ReportFilter; label: string }[] = [
    { key: IReportStatus.PENDING, label: 'Pending' },
    { key: IReportStatus.SUBMITTED, label: 'Submitted' },
    { key: IReportStatus.GSP_SUBMITTED, label: 'GSP Submitted' },
];

interface ReportCardProps {
    report: DeptReport;
    serviceName?: string;
}

const ReportCard: React.FC<ReportCardProps> = ({ report: item, serviceName }) => {
    const scheme = useColorScheme();
    const mutedIconColor = scheme === 'dark' ? '#71717a' : '#71717a';
    const serviceLabel = serviceName ?? item.campus;

    const handlePress = () => {
        router.push({
            pathname: '/gh-approvals/report-detail' as any,
            params: {
                reportId: item.report._id,
                departmentId: item.report.departmentId,
                serviceId: item.report.serviceId,
                departmentName: item.departmentName,
                campus: item.campus,
                serviceName: serviceName ?? '',
                status: item.report.status,
            },
        });
    };

    return (
        <TouchableOpacity activeOpacity={0.6} onPress={handlePress}>
            <Card className="p-0 overflow-hidden">
                <View style={styles.row}>
                    <View style={styles.accent} className="bg-amber-600" />
                    <View className="flex-1 p-4 gap-3">
                        <View className="flex-row items-start justify-between gap-2">
                            <View className="flex-1">
                                <Text className="!text-base font-bold text-foreground leading-tight">
                                    {item.departmentName}
                                </Text>
                                <Text className="!text-xs text-muted-foreground mt-0.5">{serviceLabel}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={mutedIconColor} style={styles.chevron} />
                        </View>

                        <View className="flex-row items-center gap-2">
                            <AvatarComponent alt="hod" className="w-7 h-7" imageUrl={AVATAR_FALLBACK_URL} />
                            <Text className="!text-xs font-medium text-foreground">Head of Department</Text>
                        </View>

                        <View className="flex-row items-center justify-between pt-3 border-t border-border">
                            <View className="flex-row items-center gap-1">
                                <Ionicons name="attach-outline" size={12} color={mutedIconColor} />
                                <Text className="!text-[11px] text-muted-foreground font-semibold">—</Text>
                            </View>
                            <View className="flex-row items-center gap-1.5 rounded-full h-5 px-2 bg-amber-100 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                                <View className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                <Text className="!text-[10px] font-semibold text-amber-700 dark:text-amber-400">
                                    Pending with you
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </Card>
        </TouchableOpacity>
    );
};

const ApprovalsReports: React.FC = () => {
    const [filter, setFilter] = useState<ReportFilter>(IReportStatus.PENDING);
    const { user } = useRole();
    const campusId = user?.campus?._id;

    const { data: latestService } = useGetLatestServiceQuery(campusId as string, { skip: !campusId });
    const { data: ghReport, isLoading } = useGetGhReportByIdQuery(
        { serviceId: latestService?._id as string },
        { skip: !latestService?._id }
    );

    const filtered = useMemo(
        () => (ghReport?.departmentalReport ?? []).filter(r => r.report.status === filter),
        [ghReport, filter]
    );

    return (
        <View className="flex-1">
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="py-3 grow-0 shrink-0"
                contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
            >
                {REPORT_FILTERS.map(f => (
                    <FilterChip key={f.key} active={filter === f.key} onPress={() => setFilter(f.key)}>
                        {f.label}
                    </FilterChip>
                ))}
            </ScrollView>

            <ScrollView className="flex-1">
                <View className="px-4 pb-8 gap-3">
                    {isLoading ? (
                        [1, 2, 3].map(i => <Skeleton key={i} className="h-40 w-full rounded-3xl" />)
                    ) : filtered.length === 0 ? (
                        <View className="py-12 items-center">
                            <Text className="!text-sm text-muted-foreground text-center">
                                No {filter.toLowerCase().replace(/_/g, ' ')} reports.
                            </Text>
                        </View>
                    ) : (
                        filtered.map(report => (
                            <ReportCard
                                key={report.report._id}
                                report={report}
                                serviceName={latestService?.name}
                            />
                        ))
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

export default memo(ApprovalsReports);

const styles = StyleSheet.create({
    row: { flexDirection: 'row', overflow: 'hidden', borderRadius: 24 },
    accent: { width: 4 },
    chevron: { marginTop: 2 },
});
