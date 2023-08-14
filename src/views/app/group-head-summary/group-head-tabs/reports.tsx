import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import { HStack, Text } from 'native-base';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import StatusTag from '../../../../components/atoms/status-tag';
import ErrorBoundary from '../../../../components/composite/error-boundary';
import FlatListComponent, { IFlatListColumn } from '../../../../components/composite/flat-list';
import ViewWrapper from '../../../../components/layout/viewWrapper';
import useScreenFocus from '../../../../hooks/focus';
import { IDepartmentReportListById, useGetDepartmentReportsListQuery } from '../../../../store/services/reports';
import { IIncidentReportPayload } from '../../../../store/types';
import Utils from '../../../../utils';
import { ReportRouteIndex } from '../../home/campus-pastors/report-summary';
import { IReportFormProps } from '../../reports/forms/types';

interface IReportProps
    extends Pick<IReportFormProps, 'updatedAt' | 'createdAt' | 'status' | 'departmentId' | 'departmentName'> {
    screenName: string;
}

export const DepartmentReportListRow: React.FC<IReportProps> = props => {
    const navigation = useNavigation();

    const handlePress = () => {
        navigation.navigate(ReportRouteIndex[props?.departmentName] as never, props as never);
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
            <HStack
                p={2}
                px={4}
                my={1.5}
                borderRadius={10}
                alignItems="center"
                _dark={{ bg: 'gray.900' }}
                _light={{ bg: 'gray.50' }}
                justifyContent="space-between"
            >
                <Text _dark={{ color: 'gray.400' }} _light={{ color: 'gray.500' }}>
                    {moment(props.updatedAt || props.createdAt).format('DD/MM/YYYY')}
                </Text>
                <Text _dark={{ color: 'gray.400' }} _light={{ color: 'gray.500' }} bold>
                    Departmental
                </Text>
                <StatusTag>{props?.status as any}</StatusTag>
            </HStack>
        </TouchableOpacity>
    );
};

interface IIncidentProps extends Pick<IIncidentReportPayload, 'createdAt' | 'details'> {
    screenName: string;
    departmentId: string;
    departmentName: string;
}

const IncidentReportListRow: React.FC<IIncidentProps> = props => {
    const navigation = useNavigation();

    const handlePress = () => {
        navigation.navigate('Incident Report' as never, props as never);
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
            <HStack
                p={2}
                px={4}
                my={1.5}
                borderRadius={10}
                alignItems="center"
                _dark={{ bg: 'gray.900' }}
                _light={{ bg: 'gray.50' }}
                justifyContent="space-between"
            >
                <Text _dark={{ color: 'gray.400' }} _light={{ color: 'gray.500' }}>
                    {moment(props.createdAt).format('DD/MM/YYYY')}
                </Text>
                <Text _dark={{ color: 'rose.400' }} _light={{ color: 'rose.500' }} bold>
                    Incident
                </Text>
                <Text _dark={{ color: 'gray.400' }} _light={{ color: 'gray.500' }}>
                    {Utils.truncateString(props.details, 10)}
                </Text>
            </HStack>
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
    } = useGetDepartmentReportsListQuery(params.id);

    useScreenFocus({
        onFocus: () => {
            reportsRefetch();
        },
    });

    return (
        <ErrorBoundary>
            <ViewWrapper>
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
