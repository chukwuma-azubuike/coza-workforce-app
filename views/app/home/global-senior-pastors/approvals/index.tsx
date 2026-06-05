import React, { memo, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';

import { Text } from '~/components/ui/text';
import { Card } from '~/components/ui/card';
import { Skeleton } from '~/components/ui/skeleton';
import ViewWrapper from '~/components/layout/viewWrapper';
import AvatarComponent from '@components/atoms/avatar';
import ReportStatusPill from '@components/composite/report-status-pill';
import { AVATAR_FALLBACK_URL } from '@constants/index';
import { getReportStatusMeta } from '@constants/report-status';
import { resolveReportType } from '@constants/report-actions';
import { useGetGhReportsQuery } from '@store/services/grouphead';
import { IGHReportListItem, IReportStatus } from '@store/types';
import { THEME_CONFIG } from '@config/appConfig';
import Utils from '@utils/index';
import { cn } from '~/lib/utils';

import { campusColor } from '../dashboard/lib';
import { gspRoutes } from '../dashboard/routes';

type GspFilter = IReportStatus.CP_APPROVED | IReportStatus.GSP_CHANGE_REQUESTED | IReportStatus.GSP_APPROVED;

const FILTERS: { key: GspFilter; label: string }[] = [
    { key: IReportStatus.CP_APPROVED, label: 'Awaiting Review' },
    { key: IReportStatus.GSP_CHANGE_REQUESTED, label: 'Returned' },
    { key: IReportStatus.GSP_APPROVED, label: 'Approved' },
];

const EMPTY_COPY: Record<GspFilter, string> = {
    [IReportStatus.CP_APPROVED]: "You're all caught up — no reports awaiting your review.",
    [IReportStatus.GSP_CHANGE_REQUESTED]: 'No reports are currently returned for changes.',
    [IReportStatus.GSP_APPROVED]: 'No reports have been finalised in this view yet.',
};

// ─── Filter chip ──────────────────────────────────────────────────────────────
const Chip: React.FC<{ label: string; count?: number; active: boolean; onPress: () => void }> = ({
    label,
    count,
    active,
    onPress,
}) => (
    <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        className={cn(
            'px-3.5 h-9 rounded-full flex-row items-center gap-1.5 border',
            active ? 'bg-primary border-primary' : 'bg-background border-border'
        )}
    >
        <Text className={cn('text-sm font-semibold', active ? '!text-white' : 'text-muted-foreground')}>{label}</Text>
        {count !== undefined && count > 0 && (
            <View className={cn('px-1.5 rounded-full min-w-5 items-center', active ? 'bg-white/25' : 'bg-secondary')}>
                <Text className={cn('!text-[11px] font-bold', active ? '!text-white' : 'text-muted-foreground')}>
                    {count}
                </Text>
            </View>
        )}
    </TouchableOpacity>
);

// ─── Report card ────────────────────────────────────────────────────────────────
const ReportCard: React.FC<{ item: IGHReportListItem }> = memo(({ item }) => {
    const meta = getReportStatusMeta(item.status as string);
    const submitter = item.submittedBy
        ? `${Utils.capitalizeFirstChar(item.submittedBy.firstName)} ${Utils.capitalizeFirstChar(item.submittedBy.lastName)}`
        : 'Head of Department';

    const onPress = () =>
        gspRoutes.approvalDetail({
            reportId: (item.reportId ?? item._id) as string,
            reportType: resolveReportType({ reportType: item.reportType, departmentName: item.departmentName }),
            departmentId: item.departmentId,
            serviceId: item.serviceId,
            departmentName: item.departmentName,
            campus: item.campusName ?? '',
            serviceName: item.serviceName ?? '',
            status: item.status as string,
        });

    return (
        <TouchableOpacity activeOpacity={0.6} onPress={onPress}>
            <Card className="p-0 overflow-hidden">
                <View style={styles.row}>
                    <View style={styles.accent} className={meta.accentClass} />
                    <View className="flex-1 p-4 gap-3">
                        <View className="flex-row items-start justify-between gap-2">
                            <View className="flex-1">
                                <Text className="font-bold text-foreground leading-tight">{item.departmentName}</Text>
                                <Text className="!text-sm text-muted-foreground mt-0.5">
                                    {item.serviceName ?? item.campusName}
                                    {item.serviceTime ? ` · ${dayjs(item.serviceTime).format('D MMM, h:mm A')}` : ''}
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={THEME_CONFIG.lightGray} style={styles.chevron} />
                        </View>

                        <View className="flex-row items-center justify-between pt-3 border-t border-border">
                            <View className="flex-row items-center gap-2 flex-1">
                                <AvatarComponent
                                    alt="submitter"
                                    className="w-6 h-6"
                                    imageUrl={item.submittedBy?.pictureUrl || AVATAR_FALLBACK_URL}
                                />
                                <Text numberOfLines={1} className="!text-sm font-medium text-foreground flex-1">
                                    {submitter}
                                </Text>
                                {!!item.attachmentCount && (
                                    <View className="flex-row items-center gap-1">
                                        <Ionicons name="attach-outline" size={15} color={THEME_CONFIG.lightGray} />
                                        <Text className="!text-[12px] text-muted-foreground font-semibold">
                                            {item.attachmentCount}
                                        </Text>
                                    </View>
                                )}
                            </View>
                            <View className="pl-2">
                                <ReportStatusPill status={item.status as string} role="GSP" />
                            </View>
                        </View>
                    </View>
                </View>
            </Card>
        </TouchableOpacity>
    );
});

// ─── Skeleton ────────────────────────────────────────────────────────────────
const CardSkeleton: React.FC = () => (
    <Card className="p-4 gap-3">
        <Skeleton className="h-4 w-2/3 rounded" />
        <Skeleton className="h-3 w-1/3 rounded" />
        <View className="flex-row items-center justify-between pt-3 border-t border-border">
            <Skeleton className="h-6 w-1/3 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
        </View>
    </Card>
);

// ─── Inbox ──────────────────────────────────────────────────────────────────────
const GSPApprovals: React.FC = () => {
    const [filter, setFilter] = useState<GspFilter>(IReportStatus.CP_APPROVED);

    const { data, isLoading, isFetching, refetch } = useGetGhReportsQuery(
        { status: filter, limit: 100 },
        { refetchOnMountOrArgChange: true }
    );

    const reports = data?.reports ?? [];

    // GSP reviews across every campus — group the inbox by campus so the workload
    // reads at a glance, each with its stable campus colour.
    const groups = useMemo(() => {
        const map = new Map<string, IGHReportListItem[]>();
        for (const r of reports) {
            const key = r.campusName || 'Unassigned';
            const bucket = map.get(key);
            if (bucket) bucket.push(r);
            else map.set(key, [r]);
        }
        return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
    }, [reports]);

    const awaitingCount = filter === IReportStatus.CP_APPROVED ? reports.length : undefined;

    return (
        <View className="flex-1">
            {/* Filter chips */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="py-3 grow-0 shrink-0"
                contentContainerStyle={styles.chips}
            >
                {FILTERS.map(f => (
                    <Chip
                        key={f.key}
                        label={f.label}
                        active={filter === f.key}
                        count={f.key === IReportStatus.CP_APPROVED ? awaitingCount : undefined}
                        onPress={() => setFilter(f.key)}
                    />
                ))}
            </ScrollView>

            <ViewWrapper scroll noPadding refreshing={isFetching && !isLoading} onRefresh={refetch} className="flex-1">
                <View className="px-4 pb-10 gap-4">
                    {/* Hero — only meaningful for the action queue */}
                    {filter === IReportStatus.CP_APPROVED && !isLoading && reports.length > 0 && (
                        <Card className="p-4 bg-secondary/40">
                            <View className="flex-row items-center gap-3">
                                <View className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-900/20 items-center justify-center">
                                    <Ionicons name="clipboard-outline" size={20} color={THEME_CONFIG.warning} />
                                </View>
                                <Text className="text-md font-semibold text-foreground flex-1 line-clamp-none">
                                    {reports.length} report{reports.length === 1 ? '' : 's'} awaiting your final approval
                                    across {groups.length} campus{groups.length === 1 ? '' : 'es'}.
                                </Text>
                            </View>
                        </Card>
                    )}

                    {isLoading ? (
                        [1, 2, 3].map(i => <CardSkeleton key={i} />)
                    ) : reports.length === 0 ? (
                        <View className="py-16 items-center gap-3">
                            <View className="w-14 h-14 rounded-3xl bg-secondary items-center justify-center">
                                <Ionicons name="checkmark-done-outline" size={28} color={THEME_CONFIG.success} />
                            </View>
                            <Text className="text-sm text-muted-foreground text-center px-8 line-clamp-none">
                                {EMPTY_COPY[filter]}
                            </Text>
                        </View>
                    ) : (
                        groups.map(([campus, items]) => (
                            <View key={campus} className="gap-3">
                                <View className="flex-row items-center gap-2 px-1">
                                    <View
                                        className="w-2.5 h-2.5 rounded-full"
                                        style={{ backgroundColor: campusColor(campus) }}
                                    />
                                    <Text className="text-md font-bold text-foreground flex-1">{campus}</Text>
                                    <Text className="!text-[12px] font-semibold text-muted-foreground">
                                        {items.length}
                                    </Text>
                                </View>
                                {items.map(item => (
                                    <ReportCard key={(item.reportId ?? item._id) as string} item={item} />
                                ))}
                            </View>
                        ))
                    )}
                </View>
            </ViewWrapper>
        </View>
    );
};

export default memo(GSPApprovals);

const styles = StyleSheet.create({
    row: { flexDirection: 'row', overflow: 'hidden', borderRadius: 24 },
    accent: { width: 4 },
    chevron: { marginTop: 2 },
    chips: { paddingHorizontal: 16, gap: 8 },
});
