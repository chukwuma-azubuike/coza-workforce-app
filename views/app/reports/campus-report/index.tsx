import React, { useCallback } from 'react';
import { RefreshControl, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';

import { Text } from '~/components/ui/text';
import { Card } from '~/components/ui/card';
import { Skeleton } from '~/components/ui/skeleton';
import ViewWrapper from '@components/layout/viewWrapper';
import ReportStatusPill from '@components/composite/report-status-pill';
import { getReportStatusMeta } from '@constants/report-status';
import useFetchMoreData from '@hooks/fetch-more-data';
import { ICampusReport, useGetCampusReportListQuery } from '@store/services/reports';
import { FlashList } from '@shopify/flash-list';

// ─── Row skeleton ──────────────────────────────────────────────────────────────
const RowSkeleton: React.FC = () => (
    <Card className="p-0 overflow-hidden mb-3">
        <View className="flex-row items-stretch">
            <Skeleton className="w-1 rounded-none" />
            <View className="flex-1 p-4 gap-2.5">
                <View className="flex-row items-center justify-between">
                    <Skeleton className="h-4 w-2/5 rounded" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                </View>
                <View className="flex-row items-center gap-3">
                    <Skeleton className="h-3 w-28 rounded" />
                    <Skeleton className="h-3 w-16 rounded" />
                </View>
            </View>
        </View>
    </Card>
);

// ─── Report row ────────────────────────────────────────────────────────────────
export const DepartmentReportListRow: React.FC<ICampusReport> = ({ serviceId, campusId, ...props }) => {
    const meta = getReportStatusMeta(props?.status as string);
    const formattedDate = dayjs(props?.serviceTime).format('ddd, D MMM YYYY');
    const formattedTime = dayjs(props?.serviceTime).format('h:mm A');

    const handlePress = () => {
        router.push({ pathname: '/reports/campus-report', params: { serviceId, campusId } });
    };

    return (
        <TouchableOpacity activeOpacity={0.6} onPress={handlePress} accessibilityRole="button">
            <Card className="p-0 overflow-hidden mb-3">
                <View className="flex-row items-stretch">
                    <View className={`w-1 ${meta.accentClass}`} />
                    <View className="flex-1 p-4 gap-2">
                        <View className="flex-row items-center justify-between gap-2">
                            <Text className="!text-sm font-bold text-foreground flex-1" numberOfLines={1}>
                                {props?.serviceName}
                            </Text>
                            <ReportStatusPill status={props?.status as string} size="sm" role="CAMPUS_PASTOR" />
                        </View>
                        <View className="flex-row items-center gap-3">
                            <View className="flex-row items-center gap-1">
                                <Ionicons name="calendar-outline" size={12} color="#71717a" />
                                <Text className="!text-xs text-muted-foreground">{formattedDate}</Text>
                            </View>
                            <View className="flex-row items-center gap-1">
                                <Ionicons name="time-outline" size={12} color="#71717a" />
                                <Text className="!text-xs text-muted-foreground">{formattedTime}</Text>
                            </View>
                        </View>
                    </View>
                    <View className="items-center justify-center pr-3">
                        <Ionicons name="chevron-forward" size={16} color="#71717a" />
                    </View>
                </View>
            </Card>
        </TouchableOpacity>
    );
};

// ─── Main screen ───────────────────────────────────────────────────────────────
interface ICampusReportPayload {
    serviceId?: string;
    campusId: string;
}

const CampusReportDetails: React.FC<ICampusReportPayload> = ({ serviceId, campusId }) => {
    const [page, setPage] = React.useState<number>(0);

    const { data, refetch, isLoading, isFetching, isSuccess } = useGetCampusReportListQuery(
        { page, campusId, limit: 10 },
        { refetchOnMountOrArgChange: true }
    );

    const { data: moreData } = useFetchMoreData({ dataSet: data, isSuccess, uniqKey: 'serviceId' });

    const minimalReportData = React.useMemo(
        () =>
            (moreData ?? []).map(({ serviceTime, serviceName, status, serviceId: sid, campusId: cid }) => ({
                serviceId: sid,
                campusId: cid,
                serviceTime,
                serviceName,
                status,
            })),
        [moreData]
    );

    const fetchMoreData = () => {
        if (!isFetching && !isLoading) {
            setPage(prev => (data?.length ? prev + 1 : Math.max(0, prev - 1)));
        }
    };

    const renderItem = useCallback(
        ({ item }: { item: ICampusReport }) => (
            <DepartmentReportListRow
                {...item}
                campusId={campusId ?? item.campusId}
                serviceId={item.serviceId ?? serviceId}
            />
        ),
        [serviceId, campusId]
    );

    const keyExtractor = useCallback((item: ICampusReport) => item.serviceId, []);

    return (
        <ViewWrapper className="flex-1" noPadding>
            {isLoading ? (
                <View className="px-4 pt-4">
                    {[1, 2, 3, 4, 5].map(i => <RowSkeleton key={i} />)}
                </View>
            ) : (
                <FlashList
                    data={minimalReportData}
                    keyExtractor={keyExtractor}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: 8, paddingBottom: 40 }}
                    onEndReached={fetchMoreData}
                    onEndReachedThreshold={0.3}
                    removeClippedSubviews
                    // initialNumToRender={10}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
                    ListEmptyComponent={
                        <View className="items-center py-16 gap-3">
                            <View className="w-16 h-16 rounded-full bg-secondary items-center justify-center">
                                <Ionicons name="document-text-outline" size={28} color="#71717a" />
                            </View>
                            <Text className="!text-sm text-muted-foreground text-center">
                                No past campus reports yet.
                            </Text>
                        </View>
                    }
                />
            )}
        </ViewWrapper>
    );
};

export default CampusReportDetails;
