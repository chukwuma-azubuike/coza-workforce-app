import { LineChart } from '@components/composite/chart';
import { ResponsiveGrid } from '@components/layout/responsive-grid';
import ViewWrapper from '@components/layout/viewWrapper';
import { THEME_CONFIG } from '@config/appConfig';
import useScreenFocus from '@hooks/focus';
import { useGetGraphAttendanceReportsQuery } from '@store/services/reports';
import { IDefaultQueryParams } from '@store/types';
import React from 'react';

interface IWorkforceAnalyticsProps extends IDefaultQueryParams {}

const WorkforceAnalytics: React.FC<IWorkforceAnalyticsProps> = ({ CGWCId, serviceId, campusId }) => {
    const {
        data: attendanceReport,
        isLoading: attendanceReportLoading,
        refetch: attendanceReportRefetch,
        isFetching: attendanceReportFetching,
    } = useGetGraphAttendanceReportsQuery({
        CGWCId,
        serviceId,
        campusId,
    });
    const isLoadingOrFetching = attendanceReportLoading || attendanceReportFetching;

    const handleRefresh = () => {
        attendanceReportRefetch();
    };

    useScreenFocus({
        onFocus: handleRefresh,
    });

    return (
        <ViewWrapper className="pt-8" scroll onRefresh={handleRefresh} refreshing={false}>
            <ResponsiveGrid rowCount={1}>
                <LineChart
                    horizontal
                    barColor={THEME_CONFIG.rose}
                    entityKey="campusName"
                    title="Growth over time"
                    valueKey="value"
                    isLoading={isLoadingOrFetching}
                    data={attendanceReport?.ticket || []}
                />
            </ResponsiveGrid>
        </ViewWrapper>
    );
};

export default React.memo(WorkforceAnalytics);
