import { Text } from '~/components/ui/text';
import React, { useCallback } from 'react';
import ViewWrapper from '@components/layout/viewWrapper';
import If from '@components/composite/if-container';
import useRole from '@hooks/role';
import StaggerButtonComponent from '@components/composite/stagger';
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
import ErrorBoundary from '@components/composite/error-boundary';
import { TouchableOpacity, View } from 'react-native';
import StatusTag from '@components/atoms/status-tag';
import { ReportRouteIndex } from '../home/campus-pastors/report-summary';
import dayjs from 'dayjs';
import { IReportFormProps } from './forms/types';
import { IIncidentReportPayload } from '@store/types';
import GlobalReportDetails from './gsp-report';
import { GlobalReportProvider } from './gsp-report/context';
import { Href, router } from 'expo-router';
import { Separator } from '~/components/ui/separator';

export const DepartmentReportListRow: React.FC<Pick<IReportFormProps, 'updatedAt' | 'createdAt' | 'status'>> =
    React.memo(props => {
        const {
            user: { department },
        } = useRole();

        const handlePress = () => {
            router.push({ pathname: ReportRouteIndex[department?.departmentName] as any, params: props });
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
                <View className="px-4 p-2 my-1 rounded-xl items-center bg-muted-background justify-between">
                    <Text>{dayjs(props.updatedAt || props.createdAt).format('DD/MM/YYYY')}</Text>
                    <Text className="font-bold">Departmental</Text>
                    <StatusTag>{props?.status as any}</StatusTag>
                </View>
            </TouchableOpacity>
        );
    });

const IncidentReportListRow: React.FC<Pick<IIncidentReportPayload, 'createdAt' | 'details'>> = React.memo(props => {
    const handlePress = () => {
        router.push({ pathname: '/reports/incident-report', params: props });
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
            <View className="px-4 py-3 my-1 rounded-xl items-center bg-muted-background justify-between flex-row gap-3">
                <View>
                    <Text>{dayjs(props.createdAt).format('DD/MM/YYYY')}</Text>
                </View>
                <View>
                    <Text className="font-bold">Incident</Text>
                </View>
                <View className="flex-1">
                    <Text className="text-muted-foreground">{props.details}</Text>
                </View>
            </View>
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

    const { setModalState } = useModal();

    const goToReportRoute = (): Href | undefined => {
        if (isCTS) {
            return '/reports/transfer-report';
        }
        if (isPCU) {
            return '/reports/guest-report';
        }
        if (isUshery) {
            return '/reports/attendance-report';
        }
        if (isSecurity) {
            return '/reports/security-report';
        }
        if (isPrograms) {
            return '/reports/service-report';
        }
        if (isChildcare) {
            return '/reports/childcare-report';
        }
    };

    const goToIncidentReport = useCallback(() => {
        router.push({
            pathname: '/reports/incident-report',
            params: {
                departmentId: user?.department._id,
                serviceId: latestServiceData?._id,
                campusId: user?.campus._id,
                userId: user?.userId,
            },
        });
    }, [user, latestServiceData?._id]);

    const goToDepartmentReport = useCallback(() => {
        if (!goToReportRoute()) {
            setModalState({
                status: 'info',
                defaultRender: true,
                message: 'No reports available for submission.',
            });
        } else {
            router.push({
                pathname: goToReportRoute() as any,
                params: {
                    _id: data?.departmentalReport.report._id,
                    departmentId: user?.department._id,
                    serviceId: latestServiceData?._id,
                    campusId: user?.campus._id,
                    userId: user?.userId,
                },
            });
        }
    }, [data]);

    return (
        <ErrorBoundary>
            <View className="flex-1">
                <ViewWrapper scroll className="flex-1">
                    <If condition={!user}>
                        <FlatListSkeleton count={9} />
                    </If>
                    <If condition={isCampusPastor}>
                        <CampusReport campusId={user?.campus?._id} serviceId={latestServiceData?._id} />
                    </If>
                    <If condition={isHOD || isAHOD}>
                        <Text className="text-muted-foreground font-semibold">Departmental Reports</Text>
                        <Separator className="my-2" />
                        <FlatListComponent
                            columns={reportColumns}
                            onRefresh={reportsRefetch}
                            isLoading={reportsIsLoading || reportsIsFetching}
                            refreshing={reportsIsLoading || reportsIsFetching}
                            data={departmentAndIncidentReport?.departmentalReport || []}
                        />
                        <Text className="text-muted-foreground font-semibold">Incident Reports</Text>
                        <Separator className="my-2" />
                        <FlatListComponent
                            showEmpty={false}
                            onRefresh={reportsRefetch}
                            columns={incidentReportColumns}
                            refreshing={reportsIsLoading || reportsIsFetching}
                            data={departmentAndIncidentReport?.incidentReport || []}
                        />
                    </If>
                    <If condition={isGlobalPastor}>
                        <GlobalReportProvider>
                            <GlobalReportDetails />
                        </GlobalReportProvider>
                    </If>
                </ViewWrapper>
                <If condition={!isGlobalPastor && !isCampusPastor}>
                    <StaggerButtonComponent
                        className="!bottom-32"
                        buttons={[
                            {
                                iconName: 'warning',
                                color: 'bg-rose-400',
                                iconType: 'antdesign',
                                handleClick: goToIncidentReport,
                            },
                            {
                                iconName: 'graph',
                                iconType: 'octicon',
                                color: 'bg-green-400',
                                handleClick: goToDepartmentReport,
                            },
                        ]}
                    />
                </If>
            </View>
        </ErrorBoundary>
    );
};

export default React.memo(Reports);
