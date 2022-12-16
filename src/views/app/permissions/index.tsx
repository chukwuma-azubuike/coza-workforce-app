import React from 'react';
import ViewWrapper from '../../../components/layout/viewWrapper';
import Empty from '../../../components/atoms/empty';
import { AddButtonComponent } from '../../../components/atoms/button';
import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
// import {
//     CampusPermissions,
//     MyPermissionsList,
//     MyTeamPermissionsList,
// } from './permissions-list';
// import { SceneMap } from 'react-native-tab-view';
// import { data } from '../attendance/flatListConfig';
// import TabComponent from '../../../components/composite/tabs';
import useRole from '../../../hooks/role';
import If from '../../../components/composite/if-container';

const ROUTES = [
    { key: 'myPermissions', title: 'My Permissions' },
    { key: 'teamPermissions', title: 'Team Permissions' },
    // { key: 'campusPermissions', title: 'Campus Permissions' },
];

const Permissions: React.FC<NativeStackScreenProps<ParamListBase>> = ({
    navigation,
}) => {
    const handlePress = () => {
        navigation.navigate('Request permission');
    };

    // const renderScene = SceneMap({
    //     myPermissions: MyPermissionsList,
    //     teamPermissions: MyTeamPermissionsList,
    //     campusPermissions: CampusPermissions,
    // });

    const { isQC, isAHOD, isHOD, isWorker, isCampusPastor, isGlobalPastor } =
        useRole();

    const allRoutes = React.useMemo(() => {
        if (isQC) return ROUTES;

        if (isHOD || isAHOD)
            return ROUTES.filter(elm => elm.key !== 'campusPermissions');

        if (isWorker) return ROUTES;
    }, []);

    const [index, setIndex] = React.useState(0);

    return (
        <ViewWrapper>
            <>
                <If condition={!isCampusPastor && !isGlobalPastor}>
                    <AddButtonComponent zIndex={10} onPress={handlePress} />
                </If>
                {/* {data.length ? (
                    <TabComponent
                        // tabBarScroll
                        onIndexChange={setIndex}
                        renderScene={renderScene}
                        navigationState={{ index, routes: ROUTES }}
                    />
                ) : ( */}
                <Empty
                    message={
                        isCampusPastor || isGlobalPastor
                            ? 'No permissions requested yet sir.'
                            : 'You have not requested any permissions.'
                    }
                />
                {/* )} */}
            </>
        </ViewWrapper>
    );
};

export default Permissions;
