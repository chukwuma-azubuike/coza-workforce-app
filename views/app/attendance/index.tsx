import React from 'react';
import { CampusAttendance, GroupAttendance, LeadersAttendance, MyAttendance, TeamAttendance } from './lists';
import TabComponent from '@components/composite/tabs';
import { SceneMap } from 'react-native-tab-view';
import useRole, { ROLES } from '@hooks/role';
import useMediaQuery from '@hooks/media-query';
import useScreenFocus from '@hooks/focus';
import If from '@components/composite/if-container';
import StaggerButtonComponent from '@components/composite/stagger';
import { IReportTypes } from '../export';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, View } from 'react-native';
import TopNav from '~/components/layout/top-nav';

const Attendance: React.FC = () => {
    const { isQC, isAHOD, isHOD, isCampusPastor, isGlobalPastor, isQcHOD, isGroupHead } = useRole();
    const { isMobile } = useMediaQuery();

    const params = useLocalSearchParams<{ role: ROLES; route: string; tabKey: string }>();

    const isLeader = Array.isArray(params?.role) && params?.role.includes(ROLES.HOD || ROLES.AHOD);
    const isWorker = params?.role === ROLES.worker;

    const ROUTES = [
        { key: 'myAttendance', title: 'My Attendance' },
        { key: 'teamAttendance', title: 'Team Attendance' },
        { key: 'campusAttendance', title: 'Campus Attendance' },
        { key: 'leadersAttendance', title: 'Leaders Attendance' },
        { key: 'groupAttendance', title: 'Group Attendance' },
    ];

    const renderScene = SceneMap({
        myAttendance: MyAttendance,
        teamAttendance: TeamAttendance,
        campusAttendance: CampusAttendance,
        leadersAttendance: LeadersAttendance,
        groupAttendance: GroupAttendance,
    });

    const goToExport = () => {
        router.push({ pathname: '/export-data', params: { type: IReportTypes.ATTENDANCE } });
    };

    const [index, setIndex] = React.useState(0);

    const allRoutes = React.useMemo(() => {
        if (isQC) return [ROUTES[0], ROUTES[1], ROUTES[2], ROUTES[3]];
        if (isHOD || isAHOD) return [ROUTES[0], ROUTES[1]];
        if (isGroupHead) return [ROUTES[0], ROUTES[4]];
        if (isCampusPastor || isGlobalPastor) return [ROUTES[3], ROUTES[2]];

        return [ROUTES[0]];
    }, []);

    const routeFocus = () => {
        if (isLeader) {
            setIndex(allRoutes.findIndex(route => route.key === 'leadersAttendance'));
        }
        if (isWorker) {
            setIndex(allRoutes.findIndex(route => route.key === 'campusAttendance'));
        }
        if (params?.route || params?.tabKey) {
            setIndex(allRoutes.findIndex(route => route.key === (params?.route || params?.tabKey)));
        }
    };

    useScreenFocus({
        onFocus: routeFocus,
    });

    React.useEffect(() => {
        routeFocus();
    }, []);

    return (
        <SafeAreaView className="flex-1">
            <View className="flex-1">
                <TopNav />
                <TabComponent
                    onIndexChange={setIndex}
                    renderScene={renderScene}
                    navigationState={{ index, routes: allRoutes }}
                    tabBarScroll={allRoutes.length > 2 && isMobile}
                />
                <If condition={isCampusPastor || isGlobalPastor || isQcHOD}>
                    <StaggerButtonComponent
                        buttons={[
                            {
                                color: 'bg-green-600',
                                iconName: 'download-outline',
                                handleClick: goToExport,
                                iconType: 'ionicon',
                            },
                        ]}
                    />
                </If>
            </View>
        </SafeAreaView>
    );
};

export default React.memo(Attendance);
