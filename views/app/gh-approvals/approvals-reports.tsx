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
import { useGetGhReportsQuery } from '@store/services/grouphead';
import { IGHReportListItem, IReportStatus } from '@store/types';
import Utils from '@utils/index';
import FilterChip from './approvals-filter-chip';
import dayjs from 'dayjs';

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

// ─── Skeleton ────────────────────────────────────────────────────────────────

const ReportCardSkeleton: React.FC = () => (
    <Card className="p-0 overflow-hidden">
        <View style={styles.row}>
            {/* accent bar */}
            <Skeleton className="w-1 rounded-none" />
            <View className="flex-1 p-4 gap-3">
                {/* dept name + service label */}
                <View className="gap-1.5">
                    <Skeleton className="h-4 w-2/3 rounded" />
                    <Skeleton className="h-3 w-1/3 rounded" />
                </View>
                {/* avatar + name row */}
                <View className="flex-row items-center gap-2">
                    <Skeleton className="w-7 h-7 rounded-full" />
                    <Skeleton className="h-3 w-2/5 rounded" />
                </View>
                {/* bottom bar */}
                <View className="flex-row items-center justify-between pt-3 border-t border-border">
                    <Skeleton className="h-3 w-8 rounded" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                </View>
            </View>
        </View>
    </Card>
);

// ─── Report card ──────────────────────────────────────────────────────────────

const ReportCard: React.FC<{ item: IGHReportListItem }> = ({ item }) => {
    const meta = getReportStatusMeta(item.status as string);
    const submitterName =
        item.submittedBy
            ? `${Utils.capitalizeFirstChar(item.submittedBy.firstName)} ${Utils.capitalizeFirstChar(item.submittedBy.lastName)}`
            : 'Head of Department';

    const handlePress = () => {
        router.push({
            pathname: '/gh-approvals/report-detail' as any,
            params: {
                reportId: item.reportId ?? item._id,
                reportType: item.reportType,
                departmentId: item.departmentId,
                serviceId: item.serviceId,
                departmentName: item.departmentName,
                campus: item.campusName ?? '',
                serviceName: item.serviceName ?? '',
                status: item.status as string,
            },
        });
    };

    return (
        <TouchableOpacity activeOpacity={0.6} onPress={handlePress}>
            <Card className="p-0 overflow-hidden">
                <View style={styles.row}>
                    <View style={styles.accent} className={meta.accentClass} />
                    <View className="flex-1 p-4 gap-3">
                        <View className="flex-row items-start justify-between gap-2">
                            <View className="flex-1">
                                <Text className="font-bold text-foreground leading-tight">
                                    {item.departmentName}
                                </Text>
                                <Text className="!text-sm text-muted-foreground mt-0.5">
                                    {item.serviceName ?? item.campusName} {item.serviceTime ? ' | ' + dayjs(item.serviceTime).format('D MMM YYYY, h:mm A') : ''}
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color="#71717a" style={styles.chevron} />
                        </View>

                        <View className="flex-row items-center gap-2">
                            <AvatarComponent
                                alt="hod"
                                className="w-7 h-7"
                                imageUrl={item.submittedBy?.pictureUrl || AVATAR_FALLBACK_URL}
                            />
                            <Text className="!text-sm font-medium text-foreground">{submitterName}</Text>
                        </View>

                        <View className="flex-row items-center justify-between pt-3 border-t border-border">
                            <View className="flex-row items-center gap-1">
                                <Ionicons name="attach-outline" size={16} color="#71717a" />
                                <Text className="text-sm text-muted-foreground font-semibold">
                                    {item.attachmentCount ?? '—'}
                                </Text>
                            </View>
                            <View />
                            <ReportStatusPill status={item.status as string} />
                        </View>
                    </View>
                </View>
            </Card>
        </TouchableOpacity>
    );
};

// ─── Main screen ──────────────────────────────────────────────────────────────

const ApprovalsReports: React.FC = () => {
    const [filter, setFilter] = useState<ReportFilter>(IReportStatus.HOD_SUBMITTED);

    // Pass status directly to the API — each filter change is a distinct query
    // argument so RTK Query makes a new request (with caching on revisit).
    // 'HISTORICAL' has no server-side enum, so we fetch all and filter locally.
    const statusParam = filter === 'HISTORICAL' ? undefined : (filter as string);

    const { data, isLoading, isFetching } = useGetGhReportsQuery(
        { status: statusParam, limit: 25 },
        { refetchOnMountOrArgChange: true }
    );

    const reports = useMemo(() => {
        const all = data?.reports ?? [];
        if (filter === 'HISTORICAL') {
            return all.filter(r => HISTORICAL_STATUSES.has(r.status as string));
        }
        return all;
    }, [data, filter]);

    const loading = isLoading || isFetching;

    return (
        <View className="flex-1">
            {/* Filter chips */}
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

            {/* Report list */}
            <ScrollView className="flex-1">
                <View className="px-4 pb-8 gap-3">
                    {loading ? (
                        [1, 2, 3].map(i => <ReportCardSkeleton key={i} />)
                    ) : reports.length === 0 ? (
                        <View className="py-12 items-center">
                            <Text className="text-muted-foreground text-center">
                                {`No ${filter === 'HISTORICAL' ? 'historical' : filter.toLowerCase().replace(/_/g, ' ')} reports.`}
                            </Text>
                        </View>
                    ) : (
                        reports.map(item => <ReportCard key={item.reportId ?? item._id} item={item} />)
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
