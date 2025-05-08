import React from 'react';
import ViewWrapper from '@components/layout/viewWrapper';
import TabComponent from '@components/composite/tabs';
import { SceneMap } from 'react-native-tab-view';
import useRole, { ROLES } from '@hooks/role';
import useMediaQuery from '@hooks/media-query';
import useScreenFocus from '@hooks/focus';
import If from '@components/composite/if-container';
import StaggerButtonComponent from '@components/composite/stagger';
import { IReportTypes } from '../export';
import { CampusCongressAttendance, LeadersCongressAttendance, TeamCongressAttendance } from './congress-attendance';
import { router, useLocalSearchParams } from 'expo-router';

const CongressGroupAttendance: React.FC = () => {
    const { isQC, isAHOD, isHOD, isCampusPastor, isGlobalPastor, isQcHOD } = useRole();
    const { isMobile } = useMediaQuery();

    const params = useLocalSearchParams() as unknown as {
        role: ROLES;
        route: string;
        tabKey: string;
        CongressId: string;
    };

    const isLeader = Array.isArray(params?.role) && params?.role.includes(ROLES.HOD || ROLES.AHOD);

    const ROUTES = [
        { key: 'teamAttendance', title: 'Team Attendance' },
        { key: 'campusAttendance', title: 'Campus Attendance' },
        { key: 'leadersAttendance', title: 'Leaders Attendance' },
    ];

    const renderScene = SceneMap({
        teamAttendance: () => <TeamCongressAttendance CongressId={params.CongressId} />,
        campusAttendance: () => <CampusCongressAttendance CongressId={params.CongressId} />,
        leadersAttendance: () => <LeadersCongressAttendance CongressId={params.CongressId} />,
    });

    const goToExport = () => {
        router.push({ pathname: '/export-data', params: { type: IReportTypes.ATTENDANCE } });
    };

    const [index, setIndex] = React.useState(0);

    const allRoutes = React.useMemo(() => {
        if (isQC) {
            return ROUTES;
        }
        if (isHOD || isAHOD) {
            return ROUTES.filter(item => item.key === 'teamAttendance');
        }
        if (isCampusPastor) {
            return ROUTES.filter(item => item.key === 'leadersAttendance' || item.key === 'campusAttendance');
        }
        return ROUTES.filter(item => item.key === 'teamAttendance');
    }, []);

    const routeFocus = () => {
        if (isLeader) {
            setIndex(allRoutes.findIndex(route => route.key === 'leadersAttendance'));
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
        <ViewWrapper>
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
        </ViewWrapper>
    );
};

export default React.memo(CongressGroupAttendance);
