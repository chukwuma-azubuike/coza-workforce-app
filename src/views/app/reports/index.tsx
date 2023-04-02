import React from 'react';
import ViewWrapper from '../../../components/layout/viewWrapper';
import If from '../../../components/composite/if-container';
import useRole from '../../../hooks/role';
import StaggerButtonComponent from '../../../components/composite/stagger';
import { useNavigation } from '@react-navigation/native';
import useModal from '../../../hooks/modal/useModal';
import CampusReport from './campus-report';
import {
    IDepartmentReportListById,
    useGetDepartmentalReportQuery,
    useGetDepartmentReportsListQuery,
} from '../../../store/services/reports';
import { useGetLatestServiceQuery } from '../../../store/services/services';
import { FlatListSkeleton } from '../../../components/layout/skeleton';
import useScreenFocus from '../../../hooks/focus';
import FlatListComponent, { IFlatListColumn } from '../../../components/composite/flat-list';
import { HStack, Text } from 'native-base';
import ErrorBoundary from '../../../components/composite/error-boundary';
import { TouchableNativeFeedback } from 'react-native';
import { THEME_CONFIG } from '../../../config/appConfig';
import StatusTag from '../../../components/atoms/status-tag';
import useAppColorMode from '../../../hooks/theme/colorMode';
import { ReportRouteIndex } from '../home/campus-pastors/report-summary';
import moment from 'moment';
import { IReportFormProps } from './forms/types';
import { IIncidentReportPayload } from '../../../store/types';
import Utils from '../../../utils';

const DepartmentReportListRow: React.FC<Pick<IReportFormProps, 'updatedAt' | 'status'>> = props => {
    const navigation = useNavigation();
    const { isLightMode } = useAppColorMode();

    const {
        user: { department },
    } = useRole();

    const handlePress = () => {
        navigation.navigate(ReportRouteIndex[department?.departmentName] as never, props as never);
    };

    return (
        <TouchableNativeFeedback
            disabled={false}
            delayPressIn={0}
            onPress={handlePress}
            accessibilityRole="button"
            background={TouchableNativeFeedback.Ripple(
                isLightMode ? THEME_CONFIG.veryLightGray : THEME_CONFIG.darkGray,
                false,
                220
            )}
            style={{ paddingHorizontal: 20 }}
        >
            <HStack
                p={2}
                px={4}
                my={1.5}
                w="full"
                borderRadius={10}
                alignItems="center"
                _dark={{ bg: 'gray.900' }}
                _light={{ bg: 'gray.50' }}
                justifyContent="space-between"
            >
                <Text _dark={{ color: 'gray.400' }} _light={{ color: 'gray.500' }}>
                    {moment(props.updatedAt).format('DD/MM/YYYY')}
                </Text>
                <Text _dark={{ color: 'gray.400' }} _light={{ color: 'gray.500' }} bold>
                    Departmental
                </Text>
                <StatusTag>{props?.status as any}</StatusTag>
            </HStack>
        </TouchableNativeFeedback>
    );
};

const IncidentReportListRow: React.FC<Pick<IIncidentReportPayload, 'createdAt' | 'details'>> = props => {
    const navigation = useNavigation();
    const { isLightMode } = useAppColorMode();

    const handlePress = () => {
        navigation.navigate('Incident Report' as never, props as never);
    };

    return (
        <TouchableNativeFeedback
            disabled={false}
            delayPressIn={0}
            onPress={handlePress}
            accessibilityRole="button"
            background={TouchableNativeFeedback.Ripple(
                isLightMode ? THEME_CONFIG.veryLightGray : THEME_CONFIG.darkGray,
                false,
                220
            )}
            style={{ paddingHorizontal: 20 }}
        >
            <HStack
                p={2}
                px={4}
                my={1.5}
                w="full"
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
        </TouchableNativeFeedback>
    );
};

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
    } = useRole();

    const { data: latestServiceData, refetch } = useGetLatestServiceQuery(user?.campus._id as string, { skip: !user });

    const { data } = useGetDepartmentalReportQuery(
        {
            departmentId: user?.department._id as string,
            serviceId: latestServiceData?._id as string,
            campusId: user?.campus?._id as string,
        },
        {
            skip: !user?.department._id,
        }
    );

    const {
        user: {
            department: { _id },
        },
    } = useRole();

    const {
        refetch: reportsRefetch,
        isLoading: reportsIsLoading,
        isFetching: reportsIsFetching,
        data: departmentAndIncidentReport,
    } = useGetDepartmentReportsListQuery(_id);

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
                        showEmpty={false}
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

export default Reports;
