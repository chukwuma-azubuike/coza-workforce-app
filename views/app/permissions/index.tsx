import React from 'react';
import {
    CampusPermissions,
    GroupPermissionsList,
    LeadersPermissionsList,
    MyPermissionsList,
    TeamPermissionsList,
} from './permissions-list';
import { SceneMap } from 'react-native-tab-view';
import TabComponent from '@components/composite/tabs';
import useRole from '@hooks/role';
import useMediaQuery from '@hooks/media-query';
import StaggerButtonComponent from '@components/composite/stagger';
import { AddButtonComponent } from '@components/atoms/button';
import If from '@components/composite/if-container';
import { IReportTypes } from '../export';
import useScreenFocus from '@hooks/focus';
import { useGetRolesQuery } from '@store/services/role';
import { SafeAreaView, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

const ROUTES = [
    { key: 'myPermissions', title: 'My Permissions' },
    { key: 'teamPermissions', title: 'Team Permissions' },
    { key: 'campusPermissions', title: 'Campus Permissions' },
    { key: 'leadersPermissions', title: 'Leaders Permissions' },
    { key: 'groupPermissions', title: 'Group Permissions' },
];

const Permissions: React.FC = () => {
    const params = useLocalSearchParams<{ tabKey: string }>();
    useGetRolesQuery();

    const { isMobile } = useMediaQuery();
    const gotoRequestPermission = () => {
        router.push('/permissions/request-permission');
    };

    const goToExport = () => {
        router.push({ pathname: '/export-data', params: { type: IReportTypes.PERMISSIONS } });
    };

    const renderScene = SceneMap({
        myPermissions: () => <MyPermissionsList />,
        teamPermissions: () => <TeamPermissionsList />,
        campusPermissions: () => <CampusPermissions />,
        leadersPermissions: () => <LeadersPermissionsList />,
        groupPermissions: () => <GroupPermissionsList />,
    });

    const { isQC, isAHOD, isHOD, isCampusPastor, isGlobalPastor, isGroupHead } = useRole();
    const isQCHOD = isQC && isHOD;

    const allRoutes = React.useMemo(() => {
        if (isQC) return [ROUTES[0], ROUTES[1], ROUTES[2], ROUTES[3]];
        if (isHOD || isAHOD) return [ROUTES[0], ROUTES[1]];
        if (isGroupHead) return [ROUTES[0], ROUTES[4]];
        if (isCampusPastor || isGlobalPastor) return [ROUTES[3], ROUTES[2]];

        return [ROUTES[0]];
    }, []);

    const allButtons = [
        {
            color: 'blue.600',
            iconType: 'ionicon',
            iconName: 'create-outline',
            handleClick: gotoRequestPermission,
        },
        // TODO: Uncomment once resolved with IOS
        {
            color: 'green.600',
            iconType: 'ionicon',
            iconName: 'download-outline',
            handleClick: goToExport,
        },
    ];

    const filteredButtons = React.useMemo(() => {
        // TODO: Uncomment once resolved with IOS
        if (isCampusPastor || isGlobalPastor) return [allButtons[1]];
        if (isQCHOD) return [...allButtons];

        return [allButtons[0]];
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [index, setIndex] = React.useState(0);

    const routeFocus = () => {
        if (params?.tabKey) {
            setIndex(allRoutes.findIndex(route => route.key === params?.tabKey));
        }
    };

    useScreenFocus({
        onFocus: routeFocus,
    });

    return (
        <SafeAreaView className="flex-1">
            <View className="flex-1">
                <TabComponent
                    onIndexChange={setIndex}
                    renderScene={renderScene}
                    navigationState={{ index, routes: allRoutes }}
                    tabBarScroll={allRoutes.length > 2 && isMobile}
                />
                <If condition={!isCampusPastor && !isGlobalPastor && !isQCHOD}>
                    <AddButtonComponent className="z-10" onPress={gotoRequestPermission} />
                </If>

                <If condition={isCampusPastor || isGlobalPastor || isQCHOD}>
                    <StaggerButtonComponent buttons={filteredButtons as unknown as any} />
                </If>
            </View>
        </SafeAreaView>
    );
};

export default React.memo(Permissions);
