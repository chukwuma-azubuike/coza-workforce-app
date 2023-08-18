import React from 'react';
import ViewWrapper from '../../../components/layout/viewWrapper';
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
import { IPermission } from '../../../store/types';
import useMediaQuery from '../../../hooks/media-query';
import StaggerButtonComponent from '../../../components/composite/stagger';
import { AddButtonComponent } from '../../../components/atoms/button';
import If from '../../../components/composite/if-container';
import { IReportTypes } from '../export';
import useScreenFocus from '../../../hooks/focus';

const ROUTES = [
    { key: 'myPermissions', title: 'My Permissions' },
    { key: 'teamPermissions', title: 'Team Permissions' },
    { key: 'campusPermissions', title: 'Campus Permissions' },
    { key: 'leadersPermissions', title: 'Leaders Permissions' },
];

const Permissions: React.FC<NativeStackScreenProps<ParamListBase>> = ({ navigation, route }) => {
    const params = route.params as { tabKey: string };

    const { isMobile } = useMediaQuery();
    const gotoRequestPermission = () => {
        navigation.navigate('Request permission');
    };

    const goToExport = () => {
        navigation.navigate('Export Data', { type: IReportTypes.PERMISSIONS });
    };

    const updatedListItem = route?.params as IPermission;

    const renderScene = SceneMap({
        myPermissions: () => <MyPermissionsList updatedListItem={updatedListItem} />,
        teamPermissions: () => <MyTeamPermissionsList updatedListItem={updatedListItem} />,
        campusPermissions: () => <CampusPermissions updatedListItem={updatedListItem} />,
        leadersPermissions: () => <LeadersPermissionsList updatedListItem={updatedListItem} />,
    });

    const { isQC, isAHOD, isHOD, isCampusPastor, isGlobalPastor } = useRole();
    const isQCHOD = isQC && isHOD;

    const allRoutes = React.useMemo(() => {
        if (isQC) return ROUTES;
        if (isHOD || isAHOD) return [ROUTES[0], ROUTES[1]];
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
        <ViewWrapper>
            <TabComponent
                onIndexChange={setIndex}
                renderScene={renderScene}
                navigationState={{ index, routes: allRoutes }}
                tabBarScroll={allRoutes.length > 2 && isMobile}
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
