import React from 'react';
import ViewWrapper from '../../../components/layout/viewWrapper';
import { AddButtonComponent } from '../../../components/atoms/button';
import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
    CampusPermissions,
    LeadersPermissionsList,
    MyPermissionsList,
    MyTeamPermissionsList,
} from './permissions-list';
import { SceneMap } from 'react-native-tab-view';
import TabComponent from '../../../components/composite/tabs';
import useRole from '../../../hooks/role';
import If from '../../../components/composite/if-container';
import { IPermission } from '../../../store/types';
import useMediaQuery from '../../../hooks/media-query';

const ROUTES = [
    { key: 'myPermissions', title: 'My Permissions' },
    { key: 'teamPermissions', title: 'Team Permissions' },
    { key: 'campusPermissions', title: 'Campus Permissions' },
    { key: 'leadersPermissions', title: 'Leaders Permissions' },
];

const Permissions: React.FC<NativeStackScreenProps<ParamListBase>> = ({ navigation, route }) => {
    const { isMobile } = useMediaQuery();
    const handlePress = () => {
        navigation.navigate('Request permission');
    };

    const updatedListItem = route?.params as IPermission;

    const renderScene = SceneMap({
        myPermissions: () => <MyPermissionsList updatedListItem={updatedListItem} />,
        teamPermissions: () => <MyTeamPermissionsList updatedListItem={updatedListItem} />,
        campusPermissions: () => <CampusPermissions updatedListItem={updatedListItem} />,
        leadersPermissions: () => <LeadersPermissionsList updatedListItem={updatedListItem} />,
    });

    const { isQC, isAHOD, isHOD, isCampusPastor, isGlobalPastor } = useRole();

    const allRoutes = React.useMemo(() => {
        if (isQC) return ROUTES;
        if (isHOD || isAHOD) return [ROUTES[0], ROUTES[1]];
        if (isCampusPastor || isGlobalPastor) return [ROUTES[3], ROUTES[2]];

        return [ROUTES[0]];
    }, []);

    const [index, setIndex] = React.useState(0);

    return (
        <ViewWrapper>
            <If condition={!isCampusPastor && !isGlobalPastor}>
                <AddButtonComponent zIndex={10} onPress={handlePress} />
            </If>
            <TabComponent
                onIndexChange={setIndex}
                renderScene={renderScene}
                navigationState={{ index, routes: allRoutes }}
                tabBarScroll={allRoutes.length > 2 && isMobile}
            />
        </ViewWrapper>
    );
};

export default Permissions;
