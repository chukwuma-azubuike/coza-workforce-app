import React from 'react';
import ViewWrapper from '../../../components/layout/viewWrapper';
import Empty from '../../../components/atoms/empty';
import If from '../../../components/composite/if-container';
import useRole from '../../../hooks/role';
import StaggerButtonComponent from '../../../components/composite/stagger';
import { useNavigation } from '@react-navigation/native';
import useModal from '../../../hooks/modal/useModal';
import CampusReport from './campus-report';

const Reports: React.FC = () => {
    const {
        isCTS,
        isPCU,
        isWitty,
        isUshery,
        isSecurity,
        isPrograms,
        isChildcare,
        isGlobalPastor,
    } = useRole();

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
        navigate('Incident Report' as unknown as never);
    };

    const goToDepartmentReport = () => {
        if (!goToReportRoute()) {
            setModalState({
                status: 'info',
                defaultRender: true,
                message: 'No reports available for submission.',
            });
        } else navigate(goToReportRoute() as unknown as never);
    };

    return (
        <ViewWrapper>
            <CampusReport />
            {/* <Empty />
            <If condition={!isGlobalPastor}>
                <StaggerButtonComponent
                    buttons={[
                        {
                            iconName: 'warning',
                            color: 'rose.400',
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
            </If> */}
        </ViewWrapper>
    );
};

export default Reports;
