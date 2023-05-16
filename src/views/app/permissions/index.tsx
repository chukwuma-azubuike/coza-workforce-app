import React from 'react';
import ViewWrapper from '../../../components/layout/viewWrapper';
import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CampusPermissions, MyPermissionsList, MyTeamPermissionsList } from './permissions-list';
import { SceneMap } from 'react-native-tab-view';
import TabComponent from '../../../components/composite/tabs';
import useRole from '../../../hooks/role';
import { IPermission } from '../../../store/types';
import StaggerButtonComponent from '../../../components/composite/stagger';
import { AddButtonComponent } from '../../../components/atoms/button';
import If from '../../../components/composite/if-container';

const ROUTES = [
    { key: 'myPermissions', title: 'My Permissions' },
    { key: 'teamPermissions', title: 'Team Permissions' },
    { key: 'campusPermissions', title: 'Campus Permissions' },
];

const Permissions: React.FC<NativeStackScreenProps<ParamListBase>> = ({ navigation, route }) => {
    const gotoRequestPermission = () => {
        navigation.navigate('Request permission');
    };

    const goToExport = () => {
        navigation.navigate('Export Data', { type: 'PERMISSIONS' });
    };

    const updatedListItem = route?.params as IPermission;

    const renderScene = SceneMap({
        myPermissions: () => <MyPermissionsList updatedListItem={updatedListItem} />,
        teamPermissions: () => <MyTeamPermissionsList updatedListItem={updatedListItem} />,
        campusPermissions: () => <CampusPermissions updatedListItem={updatedListItem} />,
    });

    const { isQC, isAHOD, isHOD, isCampusPastor, isGlobalPastor } = useRole();
    const isQCHOD = isQC && isHOD;

    const allRoutes = React.useMemo(() => {
        if (isQC) return ROUTES;
        if (isHOD || isAHOD) return [ROUTES[0], ROUTES[1]];
        if (isCampusPastor || isGlobalPastor) return [ROUTES[2]];

        return [ROUTES[0]];
    }, []);

    const allButtons = [
        {
            color: 'blue.600',
            iconType: 'ionicon',
            iconName: 'create-outline',
            handleClick: gotoRequestPermission,
        },
        {
            color: 'green.600',
            iconType: 'ionicon',
            iconName: 'download-outline',
            handleClick: goToExport,
        },
    ];

    const filteredButtons = React.useMemo(() => {
        if (isCampusPastor || isGlobalPastor) return [allButtons[1]];
        if (isQCHOD) return [...allButtons];

        return [allButtons[0]];
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
            <If condition={!isCampusPastor && !isGlobalPastor && !isQCHOD}>
                <AddButtonComponent zIndex={10} onPress={gotoRequestPermission} />
            </If>

            <If condition={isCampusPastor || isGlobalPastor || isQCHOD}>
                <StaggerButtonComponent buttons={filteredButtons as unknown as any} />
            </If>
        </ViewWrapper>
    );
};

export default Permissions;
