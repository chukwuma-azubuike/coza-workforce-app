import React from 'react';
import ViewWrapper from '../../../components/layout/viewWrapper';
import If from '../../../components/composite/if-container';
import useRole from '../../../hooks/role';
import StaggerButtonComponent from '../../../components/composite/stagger';
import { useNavigation } from '@react-navigation/native';
import useModal from '../../../hooks/modal/useModal';
import CampusReport from './campus-report';
import { useGetDepartmentalReportQuery } from '../../../store/services/reports';
import { useGetLatestServiceQuery } from '../../../store/services/services';
import Empty from '../../../components/atoms/empty';
// import FlatListComponent from '../../../components/composite/flat-list';

const Reports: React.FC = () => {
    const {
        user,
        isCTS,
        isPCU,
        isUshery,
        isSecurity,
        isPrograms,
        isChildcare,
        isCampusPastor,
        isGlobalPastor,
    } = useRole();

    const { data: latestServiceData, refetch } = useGetLatestServiceQuery(
        user?.campus.id as string,
        { skip: !user }
    );

    const { data, isLoading } = useGetDepartmentalReportQuery(
        {
            departmentId: user?.department._id as string,
            serviceId: latestServiceData?.id as string,
        },
        {
            skip: !user?.department._id,
        }
    );

    const { navigate } = useNavigation();
    const { setModalState } = useModal();

    const goToReportRoute = () => {
        if (isCTS) return 'Transfer Report';
        if (isPCU) return 'Guest Report';
        if (isUshery) return 'Attendance Report';
        if (isSecurity) return 'Security Report';
        if (isPrograms) return 'Service Report';
        if (isChildcare) return 'Childcare Report';
    };

    const goToIncidentReport = () => {
        navigate(
            'Incident Report' as unknown as never,
            {
                departmentId: user?.department._id,
                serviceId: latestServiceData?.id,
                campusId: user?.campus.id,
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
        } else
            navigate(
                goToReportRoute() as unknown as never,
                {
                    _id: data?.departmentalReport.report._id,
                    departmentId: user?.department._id,
                    serviceId: latestServiceData?.id,
                    campusId: user?.campus.id,
                    userId: user?.userId,
                } as never
            );
    };

    // const handleRefresh = () => {
    //     refetch();
    // };

    return (
        <ViewWrapper>
            <If condition={isCampusPastor}>
                <CampusReport />
            </If>
            <If condition={!isCampusPastor}>
                <Empty />
            </If>
            {/* <FlatListComponent
                refreshing={isLoading}
                onRefresh={handleRefresh}
                data={data as }
                columns={}
            /> */}
            <If condition={!isGlobalPastor}>
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
    );
};

export default Reports;
