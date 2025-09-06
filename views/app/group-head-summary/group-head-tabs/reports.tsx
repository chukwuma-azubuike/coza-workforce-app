import { Text } from '~/components/ui/text';
import dayjs from 'dayjs';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import StatusTag from '@components/atoms/status-tag';
import ErrorBoundary from '@components/composite/error-boundary';
import FlatListComponent, { IFlatListColumn } from '@components/composite/flat-list';
import ViewWrapper from '@components/layout/viewWrapper';
import useScreenFocus from '@hooks/focus';
import { IDepartmentReportListById, useGetDepartmentReportsListQuery } from '@store/services/reports';
import { IIncidentReportPayload } from '@store/types';
import Utils from '@utils';
import { ReportRouteIndex } from '../../home/campus-pastors/report-summary';
import { IReportFormProps } from '../../reports/forms/types';
import { router } from 'expo-router';

interface IReportProps
    extends Pick<IReportFormProps, 'updatedAt' | 'createdAt' | 'status' | 'departmentId' | 'departmentName'> {
    screenName: string;
}

export const DepartmentReportListRow: React.FC<IReportProps> = props => {
    const handlePress = () => {
        router.push({ pathname: `/reports/${ReportRouteIndex[props?.departmentName]}`, params: props as any });
    };

    return (
        <TouchableOpacity
            disabled={false}
            delayPressIn={0}
            activeOpacity={0.6}
            onPress={handlePress}
            style={{ width: '100%' }}
            accessibilityRole="button"
        >
            <View className="px-4 text-muted-foreground justify-between items-center my-3 rounded-sm  ">
                <Text className="text-muted-foreground">
                    {dayjs(props.updatedAt || props.createdAt).format('DD/MM/YYYY')}
                </Text>
                <Text className="text-muted-foreground font-bold">Departmental</Text>
                <StatusTag>{props?.status as any}</StatusTag>
            </View>
        </TouchableOpacity>
    );
};

interface IIncidentProps extends Pick<IIncidentReportPayload, 'createdAt' | 'details'> {
    screenName: string;
    departmentId: string;
    departmentName: string;
}

const IncidentReportListRow: React.FC<IIncidentProps> = props => {
    const handlePress = () => {
        router.push({ pathname: '/reports/incident-report', params: props as any });
    };

    return (
        <TouchableOpacity
            disabled={false}
            delayPressIn={0}
            activeOpacity={0.6}
            onPress={handlePress}
            style={{ width: '100%' }}
            accessibilityRole="button"
        >
            <View className="p-4 justify-between text-muted-foreground items-center rounded-sm my-3">
                <Text className=" text-muted-foreground">{dayjs(props.createdAt).format('DD/MM/YYYY')}</Text>
                <Text className="font-bold text-rose-300 dark:text-rose-400">Incident</Text>
                <Text className="text-muted-foreground">{Utils.truncateString(props.details, 10)}</Text>
            </View>
        </TouchableOpacity>
    );
};

const GroupHeadReports: React.FC<{ params: { departmentId: string; departmentName: string; screenName: string } }> = ({
    params,
}) => {
    const reportColumns: IFlatListColumn[] = [
        {
            dataIndex: 'createdAt',
            render: (_: IDepartmentReportListById, key) => {
                const items = { ..._, ...params };
                return <DepartmentReportListRow {...items} />;
            },
        },
    ];

    const incidentReportColumns: IFlatListColumn[] = [
        {
            dataIndex: 'createdAt',
            render: (_: IIncidentReportPayload, key) => {
                const items = { ..._, ...params };
                return <IncidentReportListRow {...items} />;
            },
        },
    ];

    const {
        refetch: reportsRefetch,
        isLoading: reportsIsLoading,
        isFetching: reportsIsFetching,
        data: departmentAndIncidentReport,
    } = useGetDepartmentReportsListQuery(params.departmentId);

    useScreenFocus({
        onFocus: () => {
            reportsRefetch();
        },
    });

    return (
        <ErrorBoundary>
            <ViewWrapper className="flex-1">
                <FlatListComponent
                    columns={reportColumns}
                    onRefresh={reportsRefetch}
                    isLoading={reportsIsLoading || reportsIsFetching}
                    refreshing={reportsIsLoading || reportsIsFetching}
                    data={departmentAndIncidentReport?.departmentalReport || []}
                />
                <FlatListComponent
                    showEmpty={false}
                    columns={incidentReportColumns}
                    data={departmentAndIncidentReport?.incidentReport || []}
                />
            </ViewWrapper>
        </ErrorBoundary>
    );
};

export default GroupHeadReports;
