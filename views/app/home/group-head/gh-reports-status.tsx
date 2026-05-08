import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';

import { Text } from '~/components/ui/text';
import { Skeleton } from '~/components/ui/skeleton';
import { Separator } from '~/components/ui/separator';
import ReportStatusPill from '@components/composite/report-status-pill';
import { ICampusReportSummary } from '@store/services/reports';
import { IReportStatus } from '@store/types';
import { getReportStatusMeta } from '@constants/report-status';

type DeptReport = ICampusReportSummary['departmentalReport'][0];

const ReportRow: React.FC<DeptReport> = reportItem => {
    const status = reportItem.report.status as string;
    const meta = getReportStatusMeta(status);
    const isCpReturned = status === IReportStatus.CP_CHANGE_REQUESTED;

    const handlePress = () => {
        router.push({
            pathname: '/gh-approvals/report-detail' as any,
            params: {
                reportId: reportItem.report._id,
                departmentId: reportItem.report.departmentId,
                serviceId: reportItem.report.serviceId,
                departmentName: reportItem.departmentName,
                campus: reportItem.campus,
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
                <Text className="!text-base text-muted-foreground flex-1 mr-3">
                    {reportItem.departmentName}
                </Text>
                <ReportStatusPill status={status} />
            </View>
        </TouchableOpacity>
    );
};

interface GHReportsStatusProps {
    ghReport?: ICampusReportSummary;
    isLoading?: boolean;
}

const GHReportsStatus: React.FC<GHReportsStatusProps> = ({ ghReport, isLoading }) => {
    const departments = ghReport?.departmentalReport ?? [];

    const pendingCount = departments.filter(
        d => d.report.status === IReportStatus.HOD_SUBMITTED || d.report.status === IReportStatus.PENDING
    ).length;
    const cpReturnedCount = departments.filter(d => d.report.status === IReportStatus.CP_CHANGE_REQUESTED).length;

    return (
        <View className="gap-3">
            <View className="flex-row items-center justify-between">
                <Text className="font-semibold">Department Reports</Text>
                {!isLoading && departments.length > 0 && (
                    <Text className="text-muted-foreground !text-sm">
                        {pendingCount + cpReturnedCount} need action
                    </Text>
                )}
            </View>

            <Separator />

            {isLoading ? (
                <View className="gap-2">
                    {[1, 2, 3].map(i => (
                        <Skeleton key={i} className="h-12 w-full rounded-xl" />
                    ))}
                </View>
            ) : departments.length === 0 ? (
                <Text className="text-muted-foreground text-center py-4">
                    No reports for this service yet.
                </Text>
            ) : (
                <View className="gap-2">
                    {departments.map((dept, i) => (
                        <ReportRow key={`${dept.departmentName}-${i}`} {...dept} />
                    ))}
                </View>
            )}
        </View>
    );
};

export default React.memo(GHReportsStatus);
