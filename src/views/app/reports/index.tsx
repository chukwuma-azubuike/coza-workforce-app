import React from 'react';
import ViewWrapper from '../../../components/layout/viewWrapper';
import If from '../../../components/composite/if-container';
import useRole from '../../../hooks/role';
import StaggerButtonComponent from '../../../components/composite/stagger';
import { useNavigation } from '@react-navigation/native';
import useModal from '../../../hooks/modal/useModal';
import CampusReport from './campus-report';
import {
    ICampusReportSummary,
    useGetDepartmentalReportQuery,
    useGetDepartmentReportsListQuery,
} from '../../../store/services/reports';
import { useGetLatestServiceQuery } from '../../../store/services/services';
import { FlatListSkeleton } from '../../../components/layout/skeleton';
import useScreenFocus from '../../../hooks/focus';
import FlatListComponent, { IFlatListColumn } from '../../../components/composite/flat-list';
import Utils from '../../../utils';
import { HStack } from 'native-base';

const reportColumns: IFlatListColumn[] = [
    {
        dataIndex: 'createdAt',
        render: (_: ICampusReportSummary, key) => <HStack key={key}></HStack>,
    },
];

const Reports: React.FC = () => {
    const {
        user,
        isCTS,
        isPCU,
        isUshery,
        isSecurity,
        isPRU,
        isChildcare,
        isCampusPastor,
        isHOD,
        isAHOD,
        isGlobalPastor,
    } = useRole();

    const { data: latestServiceData, refetch } = useGetLatestServiceQuery(user?.campus._id as string, { skip: !user });

    const { data } = useGetDepartmentalReportQuery(
        {
            departmentId: user?.department._id as string,
            serviceId: latestServiceData?._id as string,
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
        data: reports,
        refetch: reportsRefetch,
        isLoading: reportsIsLoading,
        isFetching: reportsIsFetching,
    } = useGetDepartmentReportsListQuery(_id);

    useScreenFocus({
        onFocus: reportsRefetch,
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
        if (isPRU) {
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

    const memoizedData = React.useMemo(() => Utils.groupListByKey(reports, 'createdAt'), [reports]);

    return (
        <ViewWrapper>
            <If condition={!user}>
                <FlatListSkeleton count={9} />
            </If>
            <If condition={isCampusPastor}>
                <CampusReport serviceId={latestServiceData?._id} />
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
            <If condition={isHOD || isAHOD}>
                <FlatListComponent
                    data={memoizedData}
                    columns={reportColumns}
                    onRefresh={reportsRefetch}
                    isLoading={reportsIsLoading || reportsIsFetching}
                    refreshing={reportsIsLoading || reportsIsFetching}
                />
            </If>
        </ViewWrapper>
    );
};

export default Reports;
