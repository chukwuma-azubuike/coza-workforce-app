import React from 'react';
import ViewWrapper from '@components/layout/viewWrapper';
import useRole from '@hooks/role';
import { Department } from './list';
import If from '@components/composite/if-container';
import StaggerButtonComponent from '@components/composite/stagger';
import ErrorBoundary from '@components/composite/error-boundary';

import useScreenFocus from '@hooks/focus';
import { useCustomBackNavigation } from '@hooks/navigation';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { ICampusUserData } from '~/store/types';

const WorkforceManagement: React.FC = () => {
    const campusUsersData = useLocalSearchParams() as unknown as ICampusUserData['departmentCount'][0] & {
        campusId: string;
    };
    const { isCampusPastor, isQC, isGlobalPastor, isSuperAdmin, isInternshipHOD, isQcHOD, user } = useRole();

    const { setOptions } = useNavigation();

    useScreenFocus({
        onFocus: () => setOptions({ title: `${campusUsersData?.departmentName || 'Workforce Management'}` }),
    });

    const gotoCreateWorker = () => {
        router.push('/workforce-summary/create-user');
    };

    const gotoCreateCampus = () => {
        router.push('/workforce-summary/create-campus');
    };

    const gotoCreateDepartment = () => {
        router.push('/workforce-summary/create-department');
    };

    const allButtons = [
        {
            color: 'bg-blue-400',
            iconType: 'ionicon',
            iconName: 'person-outline',
            handleClick: gotoCreateWorker,
        },
        {
            color: 'bg-blue-600',
            iconType: 'ionicon',
            iconName: 'people-outline',
            handleClick: gotoCreateDepartment,
        },
        {
            iconName: 'church',
            color: 'bg-blue-800',
            iconType: 'material-community',
            handleClick: gotoCreateCampus,
        },
    ];

    const filteredButtons = React.useMemo(() => {
        if (isSuperAdmin || isGlobalPastor) {
            return allButtons;
        }

        if (isCampusPastor || isInternshipHOD || isQcHOD) {
            return [allButtons[0], allButtons[1]];
        }

        return [allButtons[0]];
    }, []);

    useCustomBackNavigation({
        targetRoute: isCampusPastor || isQC || isGlobalPastor ? '/workforce-summary/campus-workforce' : '/more',
        params: { _id: campusUsersData?.campusId },
    });

    return (
        <ErrorBoundary>
            <ViewWrapper className="flex-1">
                <Department departmentId={campusUsersData?.departmentId || user?.department?._id} />
                <If condition={isCampusPastor || isInternshipHOD || isGlobalPastor || isSuperAdmin}>
                    <StaggerButtonComponent buttons={filteredButtons as unknown as any} />
                </If>
            </ViewWrapper>
        </ErrorBoundary>
    );
};

export default React.memo(WorkforceManagement);
