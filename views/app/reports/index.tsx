import React from 'react';
import ViewWrapper from '@components/layout/viewWrapper';
import If from '@components/composite/if-container';
import useRole from '@hooks/role';
import StaggerButtonComponent from '@components/composite/stagger';
import { useNavigation } from '@react-navigation/native';
import useModal from '@hooks/modal/useModal';
import CampusReport from './campus-report';
import {
    IDepartmentReportListById,
    useGetDepartmentalReportQuery,
    useGetDepartmentReportsListQuery,
} from '@store/services/reports';
import { useGetLatestServiceQuery } from '@store/services/services';
import { FlatListSkeleton } from '@components/layout/skeleton';
import useScreenFocus from '@hooks/focus';
import FlatListComponent, { IFlatListColumn } from '@components/composite/flat-list';
import { HStack } from 'native-base';
import ErrorBoundary from '@components/composite/error-boundary';
import { TouchableOpacity, View } from 'react-native';
import StatusTag from '@components/atoms/status-tag';
import { ReportRouteIndex } from '../home/campus-pastors/report-summary';
import dayjs from 'dayjs';
import { IReportFormProps } from './forms/types';
import { IIncidentReportPayload } from '@store/types';
import GlobalReportDetails from './gsp-report';
import { GlobalReportProvider } from './gsp-report/context';
import TextComponent from '@components/text';

export const DepartmentReportListRow: React.FC<Pick<IReportFormProps, 'updatedAt' | 'createdAt' | 'status'>> =
    React.memo(props => {
        const navigation = useNavigation();

        const {
            user: { department },
        } = useRole();

        const handlePress = () => {
            navigation.navigate(ReportRouteIndex[department?.departmentName] as never, props as never);
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
                    <TextComponent>{dayjs(props.updatedAt || props.createdAt).format('DD/MM/YYYY')}</TextComponent>
                    <TextComponent bold>Departmental</TextComponent>
                    <StatusTag>{props?.status as any}</StatusTag>
                </HStack>
            </TouchableOpacity>
        );
    });

const IncidentReportListRow: React.FC<Pick<IIncidentReportPayload, 'createdAt' | 'details'>> = React.memo(props => {
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
                py={3}
                borderRadius={10}
                alignItems="center"
                _dark={{ bg: 'gray.900' }}
                _light={{ bg: 'gray.50' }}
                justifyContent="space-between"
            >
                <View style={{ width: '25%' }}>
                    <TextComponent>{dayjs(props.createdAt).format('DD/MM/YYYY')}</TextComponent>
                </View>
                <View style={{ width: '25%' }}>
                    <TextComponent bold>Incident</TextComponent>
                </View>
                <View style={{ width: '50%' }}>
                    <TextComponent>{props.details}</TextComponent>
                </View>
            </HStack>
        </TouchableOpacity>
    );
});

const reportColumns: IFlatListColumn[] = [
    {
        dataIndex: 'createdAt',
        render: (_: IDepartmentReportListById, key) => <DepartmentReportListRow {..._} />,
    },
];

const incidentReportColumns: IFlatListColumn[] = [
    {
        dataIndex: 'createdAt',
        render: (_: IIncidentReportPayload, key) => <IncidentReportListRow {..._} />,
    },
];

const Reports: React.FC = () => {
    const {
        user,
        isCTS,
        isPCU,
        isUshery,
        isSecurity,
        isChildcare,
        isCampusPastor,
        isHOD,
        isAHOD,
        isPrograms,
        isGlobalPastor,
        isGroupHead,
    } = useRole();

    const { data: latestServiceData, refetch } = useGetLatestServiceQuery(user?.campus._id as string, { skip: !user });

    const { data } = useGetDepartmentalReportQuery(
        {
            departmentId: user?.department?._id as string,
            serviceId: latestServiceData?._id as string,
            campusId: user?.campus?._id as string,
        },
        {
            skip: !user?.department?._id,
        }
    );

    const {
        refetch: reportsRefetch,
        isLoading: reportsIsLoading,
        isFetching: reportsIsFetching,
        data: departmentAndIncidentReport,
    } = useGetDepartmentReportsListQuery(user?.department?._id);

    useScreenFocus({
        onFocus: () => {
            refetch();
            reportsRefetch();
        },
    });

    const { navigate } = useNavigation();
    const { setModalState } = useModal();

    const goToReportRoute = () => {
        if (isCTS) {
            return 'Transfer Report';
        }
        if (isPCU) {
            return 'Guest Report';
        }
        if (isUshery) {
            return 'Attendance Report';
        }
        if (isSecurity) {
            return 'Security Report';
        }
        if (isPrograms) {
            return 'Service Report';
        }
        if (isChildcare) {
            return 'Childcare Report';
        }
    };

    const goToIncidentReport = () => {
        navigate(
            'Incident Report' as unknown as never,
            {
                departmentId: user?.department._id,
                serviceId: latestServiceData?._id,
                campusId: user?.campus._id,
                userId: user?.userId,
            } as never
        );
    };

    const goToDepartmentReport = () => {
        if (!goToReportRoute()) {
            setModalState({
                status: 'info',
                defaultRender: true,
                message: 'No reports available for submission.',
            });
        } else {
            navigate(
                goToReportRoute() as unknown as never,
                {
                    _id: data?.departmentalReport.report._id,
                    departmentId: user?.department._id,
                    serviceId: latestServiceData?._id,
                    campusId: user?.campus._id,
                    userId: user?.userId,
                } as never
            );
        }
    };

    return (
        <ErrorBoundary>
            <ViewWrapper>
                <If condition={!user}>
                    <FlatListSkeleton count={9} />
                </If>
                <If condition={isCampusPastor}>
                    <CampusReport campusId={user?.campus?._id} serviceId={latestServiceData?._id} />
                </If>
                <If condition={isHOD || isAHOD}>
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
                </If>
                <If condition={isGlobalPastor}>
                    <GlobalReportProvider>
                        <GlobalReportDetails />
                    </GlobalReportProvider>
                </If>
                <If condition={!isGlobalPastor && !isCampusPastor}>
                    <StaggerButtonComponent
                        buttons={[
                            {
                                color: 'rose.400',
                                iconName: 'warning',
                                iconType: 'antdesign',
                                handleClick: goToIncidentReport,
                            },
                            {
                                iconName: 'graph',
                                color: 'green.400',
                                iconType: 'octicon',
                                handleClick: goToDepartmentReport,
                            },
                        ]}
                    />
                </If>
            </ViewWrapper>
        </ErrorBoundary>
    );
};

export default React.memo(Reports);
