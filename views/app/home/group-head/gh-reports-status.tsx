import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';

import { Text } from '~/components/ui/text';
import { Skeleton } from '~/components/ui/skeleton';
import { Separator } from '~/components/ui/separator';
import ReportStatusPill from '@components/composite/report-status-pill';
import { IGHReportListItem, IReportStatus } from '@store/types';

const ReportRow: React.FC<{ item: IGHReportListItem }> = ({ item }) => {
    const status = item.status as string;
    const isCpReturned = status === IReportStatus.CP_CHANGE_REQUESTED;

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
                status,
            },
        });
    };

    return (
        <TouchableOpacity activeOpacity={0.6} onPress={handlePress}>
            <View
                className={`flex-row items-center justify-between rounded-xl px-4 py-3 ${
                    isCpReturned ? 'bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800' : 'bg-muted-background'
                }`}
            >
                <Text className="!text-base text-muted-foreground flex-1 mr-3">{item.departmentName}</Text>
                <ReportStatusPill status={status} />
            </View>
        </TouchableOpacity>
    );
};

interface GHReportsStatusProps {
    reports?: IGHReportListItem[];
    isLoading?: boolean;
}

const GHReportsStatus: React.FC<GHReportsStatusProps> = ({ reports = [], isLoading }) => {
    const needActionCount = reports.filter(
        r =>
            r.status === IReportStatus.HOD_SUBMITTED ||
            r.status === IReportStatus.PENDING ||
            r.status === IReportStatus.CP_CHANGE_REQUESTED
    ).length;

    return (
        <View className="gap-3">
            <View className="flex-row items-center justify-between">
                <Text className="font-semibold">Department Reports</Text>
                {!isLoading && reports.length > 0 && (
                    <Text className="text-muted-foreground !text-sm">{needActionCount} need action</Text>
                )}
            </View>

            <Separator />

            {isLoading ? (
                <View className="gap-2">
                    {[1, 2, 3].map(i => (
                        <Skeleton key={i} className="h-12 w-full rounded-xl" />
                    ))}
                </View>
            ) : reports.length === 0 ? (
                <Text className="text-muted-foreground text-center py-4">No reports for this service yet.</Text>
            ) : (
                <View className="gap-2">
                    {reports.map((item, i) => (
                        <ReportRow key={item.reportId ?? item._id ?? `${item.departmentName}-${i}`} item={item} />
                    ))}
                </View>
            )}
        </View>
    );
};

export default React.memo(GHReportsStatus);
