import React, { memo, useMemo, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';

import { Text } from '~/components/ui/text';
import { Card } from '~/components/ui/card';
import { Skeleton } from '~/components/ui/skeleton';
import PickerSelect from '~/components/ui/picker-select';
import ViewWrapper from '~/components/layout/viewWrapper';
import ReportStatusPill from '@components/composite/report-status-pill';
import { useGetServicesQuery } from '@store/services/services';
import { IGlobalReport, useGetGlobalReportListQuery } from '@store/services/reports';
import { IReportStatus, IService } from '@store/types';
import { THEME_CONFIG } from '@config/appConfig';
import Utils from '@utils/index';

import { campusColor } from '../dashboard/lib';
import { gspRoutes } from '../dashboard/routes';

// Campus rollups whose status sits at one of these stages are still waiting on the GSP.
const AWAITING = new Set<string>([IReportStatus.GSP_SUBMITTED, IReportStatus.CP_APPROVED]);

// Group ordering + friendly section titles (awaiting first).
const GROUP_ORDER: Record<string, number> = {
    [IReportStatus.GSP_SUBMITTED]: 0,
    [IReportStatus.CP_APPROVED]: 0,
    [IReportStatus.GSP_CHANGE_REQUESTED]: 1,
    [IReportStatus.GSP_APPROVED]: 2,
};

const GROUP_TITLE: Record<string, string> = {
    [IReportStatus.GSP_SUBMITTED]: 'Awaiting your review',
    [IReportStatus.CP_APPROVED]: 'Awaiting your review',
    [IReportStatus.GSP_CHANGE_REQUESTED]: 'Returned for changes',
    [IReportStatus.GSP_APPROVED]: 'Approved',
};

const humanize = (s: string) =>
    s
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, c => c.toUpperCase());

// ─── Campus row ──────────────────────────────────────────────────────────────
const CampusRow: React.FC<{ item: IGlobalReport; onPress: () => void }> = memo(({ item, onPress }) => (
    <TouchableOpacity activeOpacity={0.6} onPress={onPress}>
        <Card className="p-0 overflow-hidden">
            <View className="flex-row items-center gap-3 p-4">
                <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: campusColor(item.campusId) }} />
                <Text numberOfLines={1} className="font-semibold text-foreground flex-1">
                    {item.campusName?.replace('Campus', '').trim() || 'Campus'}
                </Text>
                <ReportStatusPill status={item.status as string} role="GSP" />
                <Ionicons name="chevron-forward" size={18} color={THEME_CONFIG.lightGray} />
            </View>
        </Card>
    </TouchableOpacity>
));

const CardSkeleton: React.FC = () => <Skeleton className="h-16 rounded-2xl" />;

// ─── Inbox ──────────────────────────────────────────────────────────────────────
const GSPApprovals: React.FC = () => {
    const { data: services, isLoading: servicesLoading } = useGetServicesQuery({ limit: 100, page: 1 });

    // Only services that have already started can have reports; latest first.
    const sortedServices = useMemo<IService[]>(() => {
        const started = (services ?? []).filter(s => dayjs().unix() > dayjs(s.clockInStartTime).unix());
        return Utils.sortByDate(started, 'serviceTime') as IService[];
    }, [services]);

    const [serviceId, setServiceId] = useState<string | undefined>();
    React.useEffect(() => {
        const first = sortedServices[0];
        if (!serviceId && first) setServiceId(first._id);
    }, [serviceId, sortedServices]);

    const { data, isLoading, isFetching, refetch, isUninitialized } = useGetGlobalReportListQuery(
        { serviceId: serviceId as string },
        { refetchOnMountOrArgChange: true, skip: !serviceId }
    );

    const reports = data ?? [];

    // Accurate state breakdown for the GSP: a campus is either awaiting the GSP,
    // finalised (approved), returned for changes, or hasn't reached the GSP yet
    // (still in an earlier pipeline stage). "Reviewed" ≠ "not awaiting me".
    const counts = useMemo(() => {
        let awaiting = 0;
        let approved = 0;
        let returned = 0;
        let pending = 0;
        for (const r of reports) {
            const s = r.status as string;
            if (AWAITING.has(s)) awaiting++;
            else if (s === IReportStatus.GSP_APPROVED) approved++;
            else if (s === IReportStatus.GSP_CHANGE_REQUESTED) returned++;
            else pending++;
        }
        return { awaiting, approved, returned, pending, total: reports.length };
    }, [reports]);

    // Group campuses by review status, awaiting-first.
    const groups = useMemo(() => {
        const map = new Map<string, IGlobalReport[]>();
        for (const r of reports) {
            const key = r.status as string;
            const bucket = map.get(key);
            if (bucket) bucket.push(r);
            else map.set(key, [r]);
        }
        return [...map.entries()].sort((a, b) => (GROUP_ORDER[a[0]] ?? 3) - (GROUP_ORDER[b[0]] ?? 3));
    }, [reports]);

    const loading = (isLoading || isFetching) && !data;

    return (
        <View className="flex-1">
            {/* Service selector */}
            <View className="px-4 pt-3 pb-2">
                <PickerSelect<IService>
                    valueKey="_id"
                    labelKey="name"
                    value={serviceId}
                    isLoading={servicesLoading}
                    items={sortedServices}
                    placeholder="Select service"
                    onValueChange={(v: string) => setServiceId(v)}
                    customLabel={s => `${s.name} · ${dayjs(s.clockInStartTime).format('DD MMM YYYY')}`}
                    className="!h-12"
                />
            </View>

            <ViewWrapper
                scroll
                noPadding
                refreshing={isFetching && !isLoading}
                onRefresh={() => !isUninitialized && refetch()}
                className="flex-1"
            >
                <View className="px-4 pb-10 gap-4">
                    {/* Hero summary — accurate to the GSP's actual queue state */}
                    {!loading && reports.length > 0 && (() => {
                        const campusWord = `campus${counts.total === 1 ? '' : 'es'}`;
                        const allApproved = counts.approved === counts.total;
                        const primary =
                            counts.awaiting > 0
                                ? `${counts.awaiting} of ${counts.total} ${campusWord} awaiting your review`
                                : allApproved
                                  ? `All ${counts.total} ${campusWord} approved`
                                  : `No ${campusWord} awaiting your review`;

                        const breakdown = [
                            counts.approved ? `${counts.approved} approved` : null,
                            counts.returned ? `${counts.returned} returned` : null,
                            counts.pending ? `${counts.pending} not yet submitted` : null,
                        ]
                            .filter(Boolean)
                            .join('  ·  ');

                        const tone =
                            counts.awaiting > 0 ? 'warn' : allApproved ? 'good' : 'neutral';
                        const toneIcon = {
                            warn: { bg: 'bg-amber-100 dark:bg-amber-900/20', color: THEME_CONFIG.warning, name: 'clipboard-outline' as const },
                            good: { bg: 'bg-green-100 dark:bg-green-900/20', color: THEME_CONFIG.success, name: 'checkmark-done-outline' as const },
                            neutral: { bg: 'bg-secondary', color: THEME_CONFIG.primary, name: 'clipboard-outline' as const },
                        }[tone];

                        return (
                            <Card className="p-4 bg-secondary/40">
                                <View className="flex-row items-center gap-3">
                                    <View className={`w-10 h-10 rounded-2xl items-center justify-center ${toneIcon.bg}`}>
                                        <Ionicons name={toneIcon.name} size={20} color={toneIcon.color} />
                                    </View>
                                    <View className="flex-1 gap-0.5">
                                        <Text className="text-md font-semibold text-foreground line-clamp-none">
                                            {primary}
                                        </Text>
                                        {!!breakdown && (
                                            <Text className="!text-[12px] text-muted-foreground line-clamp-none">
                                                {breakdown}
                                            </Text>
                                        )}
                                    </View>
                                </View>
                            </Card>
                        );
                    })()}

                    {!serviceId ? (
                        <View className="py-16 items-center">
                            <Text className="text-sm text-muted-foreground text-center px-8">
                                Select a service to review campus reports.
                            </Text>
                        </View>
                    ) : loading ? (
                        [1, 2, 3, 4].map(i => <CardSkeleton key={i} />)
                    ) : reports.length === 0 ? (
                        <View className="py-16 items-center gap-3">
                            <View className="w-14 h-14 rounded-3xl bg-secondary items-center justify-center">
                                <Ionicons name="document-text-outline" size={28} color={THEME_CONFIG.lightGray} />
                            </View>
                            <Text className="text-sm text-muted-foreground text-center px-8 line-clamp-none">
                                No campus reports submitted for this service yet.
                            </Text>
                        </View>
                    ) : (
                        groups.map(([status, items]) => (
                            <View key={status} className="gap-3">
                                <View className="flex-row items-center gap-2 px-1">
                                    <Text className="text-md font-bold text-foreground flex-1">
                                        {GROUP_TITLE[status] ?? humanize(status)}
                                    </Text>
                                    <Text className="!text-[12px] font-semibold text-muted-foreground">
                                        {items.length}
                                    </Text>
                                </View>
                                {items.map(item => (
                                    <CampusRow
                                        key={item.campusId}
                                        item={item}
                                        onPress={() =>
                                            gspRoutes.campusReview({
                                                serviceId: serviceId as string,
                                                campusId: item.campusId,
                                                campusName: item.campusName,
                                                status: item.status as string,
                                            })
                                        }
                                    />
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
