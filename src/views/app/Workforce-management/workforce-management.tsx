import React from 'react';
import ViewWrapper from '../../../components/layout/viewWrapper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ParamListBase } from '@react-navigation/native';
import useRole from '../../../hooks/role';
import { Department } from './list';
import If from '../../../components/composite/if-container';
import StaggerButtonComponent from '../../../components/composite/stagger';
import ErrorBoundary from '../../../components/composite/error-boundary';
import { ICampusUserData } from '../../../store/types';
import useScreenFocus from '../../../hooks/focus';
import { useCustomBackNavigation } from '../../../hooks/navigation';

const WorkforceManagement: React.FC<NativeStackScreenProps<ParamListBase>> = ({ navigation, route }) => {
    const campusUsersData = route?.params as ICampusUserData['departmentCount'][0] & { campusId: string };
    const { isCampusPastor, isQC, isGlobalPastor, isSuperAdmin, isInternshipHOD, isQcHOD } = useRole();

    const { setOptions } = navigation;

    useScreenFocus({
        onFocus: () => setOptions({ title: `${campusUsersData.departmentName || 'Workforce Management'}` }),
    });

    const gotoCreateWorker = () => {
        navigation.navigate('Create User');
    };

    const gotoCreateCampus = () => {
        // navigation.navigate('Create User');
    };

    const gotoCreateDepartment = () => {
        // navigation.navigate('Create Department');
    };

    const allButtons = [
        {
            color: 'blue.400',
            iconType: 'ionicon',
            iconName: 'person-outline',
            handleClick: gotoCreateWorker,
        },
        {
            color: 'blue.600',
            iconType: 'ionicon',
            iconName: 'people-outline',
            handleClick: gotoCreateDepartment,
        },
        {
            color: 'blue.800',
            iconName: 'church',
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

    useCustomBackNavigation({ targetRoute: 'Campus workforce', params: { _id: campusUsersData.campusId } });

    return (
        <ErrorBoundary>
            <ViewWrapper>
                <Department departmentId={campusUsersData.departmentId} />
                <If condition={isCampusPastor || isQC || isGlobalPastor || isSuperAdmin}>
                    <StaggerButtonComponent buttons={filteredButtons as unknown as any} />
                </If>
            </ViewWrapper>
        </ErrorBoundary>
    );
};

export default WorkforceManagement;
