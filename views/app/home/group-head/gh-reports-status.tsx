import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';

import { Text } from '~/components/ui/text';
import { Skeleton } from '~/components/ui/skeleton';
import { Separator } from '~/components/ui/separator';
import StatusTag from '@components/atoms/status-tag';
import { ICampusReportSummary } from '@store/services/reports';
import { ReportRouteIndex } from '~/views/app/home/campus-pastors/report-summary';

type DeptReport = ICampusReportSummary['departmentalReport'][0];

const ReportRow: React.FC<DeptReport> = reportItem => {
    const handlePress = () => {
        router.push({
            pathname: `/reports/${ReportRouteIndex[reportItem.departmentName]}` as any,
            params: reportItem.report as any,
        });
    };

    return (
        <TouchableOpacity activeOpacity={0.6} onPress={handlePress}>
            <View className="flex-row items-center justify-between rounded-xl bg-muted-background px-4 py-3">
                <Text className="!text-base text-muted-foreground flex-1 mr-3">
                    {reportItem.departmentName} Report
                </Text>
                <StatusTag>{reportItem.report.status as any}</StatusTag>
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

    const submittedCount = departments.filter(d => d.report.status !== 'PENDING').length;

    return (
        <View className="gap-3">
            <View className="flex-row items-center justify-between">
                <Text className="font-semibold">Department Reports</Text>
                {!isLoading && departments.length > 0 && (
                    <Text className="text-muted-foreground">
                        {submittedCount}/{departments.length} submitted
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
