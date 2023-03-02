import React from 'react';
import ViewWrapper from '../../../components/layout/viewWrapper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ParamListBase } from '@react-navigation/native';
import useRole from '../../../hooks/role';
import { Campus, MyTeam } from './list';
import { SceneMap } from 'react-native-tab-view';
import TabComponent from '../../../components/composite/tabs';
import If from '../../../components/composite/if-container';
import StaggerButtonComponent from '../../../components/composite/stagger';

const ROUTES = [
    { key: 'team', title: 'Team' },
    { key: 'campus', title: 'Campus' },
];

const WorkforceManagement: React.FC<NativeStackScreenProps<ParamListBase>> = ({ navigation }) => {
    const { isCampusPastor, isQC, isGlobalPastor, isSuperAdmin } = useRole();

    const gotoCreateWorker = () => {
        // navigation.navigate('Create User');
    };

    const gotoCreateCampus = () => {
        // navigation.navigate('Create User');
    };

    const gotoCreateDepartment = () => {
        // navigation.navigate('Create Department');
    };

    const renderScene = SceneMap({
        team: MyTeam,
        campus: Campus,
    });

    const allRoutes = React.useMemo(() => {
        if (isGlobalPastor || isCampusPastor) return [ROUTES[1]];

        if (isQC || isSuperAdmin) return ROUTES;

        return [ROUTES[0]];
    }, []);

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
        if (isSuperAdmin || isGlobalPastor) return allButtons;

        if (isCampusPastor || isQC) return [allButtons[0], allButtons[1]];

        return [allButtons[0]];
    }, []);

    const [index, setIndex] = React.useState(0);

    return (
        <ViewWrapper>
            <TabComponent
                onIndexChange={setIndex}
                renderScene={renderScene}
                tabBarScroll={allRoutes.length > 2}
                navigationState={{ index, routes: allRoutes }}
            />
            <If condition={isCampusPastor || isQC || isGlobalPastor || isSuperAdmin}>
                <StaggerButtonComponent buttons={filteredButtons as unknown as any} />
            </If>
        </ViewWrapper>
    );
};

export default WorkforceManagement;
