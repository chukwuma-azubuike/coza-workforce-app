import React, { memo, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Text } from '~/components/ui/text';
import { Card } from '~/components/ui/card';
import { Skeleton } from '~/components/ui/skeleton';
import AvatarComponent from '@components/atoms/avatar';
import ReportStatusPill from '@components/composite/report-status-pill';
import { AVATAR_FALLBACK_URL } from '@constants/index';
import { getReportStatusMeta } from '@constants/report-status';
import { useGetGhReportByIdQuery } from '@store/services/grouphead';
import { useGetLatestServiceQuery } from '@store/services/services';
import { IReportStatus } from '@store/types';
import { ICampusReportSummary } from '@store/services/reports';
import useGroup from '@hooks/group';
import FilterChip from './approvals-filter-chip';

type DeptReport = ICampusReportSummary['departmentalReport'][0];

type ReportFilter =
    | IReportStatus.HOD_SUBMITTED
    | IReportStatus.GH_CHANGE_REQUESTED
    | IReportStatus.GH_APPROVED
    | IReportStatus.CP_CHANGE_REQUESTED
    | IReportStatus.CP_APPROVED
    | IReportStatus.GSP_APPROVED
    | 'HISTORICAL';

const REPORT_FILTERS: { key: ReportFilter; label: string }[] = [
    { key: IReportStatus.HOD_SUBMITTED, label: 'Pending' },
    { key: IReportStatus.GH_CHANGE_REQUESTED, label: 'Change Requested' },
    { key: IReportStatus.GH_APPROVED, label: 'Approved' },
    { key: IReportStatus.CP_CHANGE_REQUESTED, label: 'CP Returned' },
    { key: IReportStatus.CP_APPROVED, label: 'CP Approved' },
    { key: IReportStatus.GSP_APPROVED, label: 'GSP Approved' },
    { key: 'HISTORICAL', label: 'Historical' },
];

const HISTORICAL_STATUSES = new Set<string>([
    IReportStatus.GSP_APPROVED,
    IReportStatus.CP_APPROVED,
    IReportStatus.GSP_CHANGE_REQUESTED,
]);

interface ReportCardProps {
    report: DeptReport;
    serviceName?: string;
}

const ReportCard: React.FC<ReportCardProps> = ({ report: item, serviceName }) => {
    const status = item.report.status as string;
    const meta = getReportStatusMeta(status);
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
                status,
            },
        });
    };

    return (
        <TouchableOpacity activeOpacity={0.6} onPress={handlePress}>
            <Card className="p-0 overflow-hidden">
                <View style={styles.row}>
                    <View style={[styles.accent, { backgroundColor: undefined }]} className={meta.accentClass} />
                    <View className="flex-1 p-4 gap-3">
                        <View className="flex-row items-start justify-between gap-2">
                            <View className="flex-1">
                                <Text className="!text-base font-bold text-foreground leading-tight">
                                    {item.departmentName}
                                </Text>
                                <Text className="!text-xs text-muted-foreground mt-0.5">{serviceLabel}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color="#71717a" style={styles.chevron} />
                        </View>

                        <View className="flex-row items-center gap-2">
                            <AvatarComponent alt="hod" className="w-7 h-7" imageUrl={AVATAR_FALLBACK_URL} />
                            <Text className="!text-xs font-medium text-foreground">Head of Department</Text>
                        </View>

                        <View className="flex-row items-center justify-between pt-3 border-t border-border">
                            <View className="flex-row items-center gap-1">
                                <Ionicons name="attach-outline" size={12} color="#71717a" />
                                <Text className="!text-[11px] text-muted-foreground font-semibold">—</Text>
                            </View>
                            <ReportStatusPill status={status} />
                        </View>
                    </View>
                </View>
            </Card>
        </TouchableOpacity>
    );
};

const ApprovalsReports: React.FC = () => {
    const [filter, setFilter] = useState<ReportFilter>(IReportStatus.HOD_SUBMITTED);
    const { groupId } = useGroup();
    const campusId = groupId;

    const { data: latestService } = useGetLatestServiceQuery(campusId as string, { skip: !campusId });
    const { data: ghReport, isLoading } = useGetGhReportByIdQuery(
        { serviceId: latestService?._id as string },
        { skip: !latestService?._id }
    );

    const filtered = useMemo(() => {
        const all = ghReport?.departmentalReport ?? [];
        if (filter === 'HISTORICAL') {
            return all.filter(r => HISTORICAL_STATUSES.has(r.report.status as string));
        }
        return all.filter(r => r.report.status === filter);
    }, [ghReport, filter]);

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
                                No {filter === 'HISTORICAL' ? 'historical' : filter.toLowerCase().replace(/_/g, ' ')} reports.
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
