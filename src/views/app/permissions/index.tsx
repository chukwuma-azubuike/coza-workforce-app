import React from 'react';
import ViewWrapper from '../../../components/layout/viewWrapper';
import { AddButtonComponent } from '../../../components/atoms/button';
import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CampusPermissions, MyPermissionsList, MyTeamPermissionsList } from './permissions-list';
import { SceneMap } from 'react-native-tab-view';
import TabComponent from '../../../components/composite/tabs';
import useRole from '../../../hooks/role';
import If from '../../../components/composite/if-container';

const ROUTES = [
    { key: 'myPermissions', title: 'My Permissions' },
    { key: 'teamPermissions', title: 'Team Permissions' },
    { key: 'campusPermissions', title: 'Campus Permissions' },
];

const Permissions: React.FC<NativeStackScreenProps<ParamListBase>> = ({ navigation }) => {
    const handlePress = () => {
        navigation.navigate('Request permission');
    };

    const renderScene = SceneMap({
        myPermissions: MyPermissionsList,
        teamPermissions: MyTeamPermissionsList,
        campusPermissions: CampusPermissions,
    });

    const { isQC, isAHOD, isHOD, isCampusPastor, isGlobalPastor } = useRole();

    const allRoutes = React.useMemo(() => {
        if (isQC) return ROUTES;
        if (isHOD || isAHOD) return [ROUTES[0], ROUTES[1]];
        if (isCampusPastor || isGlobalPastor) return [ROUTES[2]];

        return [ROUTES[0]];
    }, []);

    const [index, setIndex] = React.useState(0);

    return (
        <ViewWrapper>
            <>
                <If condition={!isCampusPastor && !isGlobalPastor}>
                    <AddButtonComponent zIndex={10} onPress={handlePress} />
                </If>
                <TabComponent
                    onIndexChange={setIndex}
                    renderScene={renderScene}
                    tabBarScroll={allRoutes.length > 2}
                    navigationState={{ index, routes: allRoutes }}
                />
            </>
        </ViewWrapper>
    );
};

export default Permissions;
