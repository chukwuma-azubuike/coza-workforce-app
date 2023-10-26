import React from 'react';
import ViewWrapper from '@components/layout/viewWrapper';
import TabComponent from '@components/composite/tabs';
import { SceneMap } from 'react-native-tab-view';
import useRole, { ROLES } from '@hooks/role';
import useMediaQuery from '@hooks/media-query';
import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import useScreenFocus from '@hooks/focus';
import If from '@components/composite/if-container';
import StaggerButtonComponent from '@components/composite/stagger';
import { IReportTypes } from '../export';
import { CampusCGWCAttendance, LeadersCGWCAttendance, TeamCGWCAttendance } from './attendance';

const CGWCGroupAttendance: React.FC<NativeStackScreenProps<ParamListBase>> = ({ navigation, route }) => {
    const { isQC, isAHOD, isHOD, isCampusPastor, isGlobalPastor, isQcHOD } = useRole();
    const { isMobile } = useMediaQuery();
    const { navigate } = navigation;
    const params = route.params as { role: ROLES; route: string; tabKey: string; CGWCId: string };

    const isLeader = Array.isArray(params?.role) && params?.role.includes(ROLES.HOD || ROLES.AHOD);

    const ROUTES = [
        { key: 'teamAttendance', title: 'Team Attendance' },
        { key: 'campusAttendance', title: 'Campus Attendance' },
        { key: 'leadersAttendance', title: 'Leaders Attendance' },
    ];

    const renderScene = SceneMap({
        teamAttendance: () => <TeamCGWCAttendance CGWCId={params.CGWCId} />,
        campusAttendance: () => <CampusCGWCAttendance CGWCId={params.CGWCId} />,
        leadersAttendance: () => <LeadersCGWCAttendance CGWCId={params.CGWCId} />,
    });

    const goToExport = () => {
        navigate('Export Data', { type: IReportTypes.ATTENDANCE });
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
                            color: 'green.600',
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

export default CGWCGroupAttendance;
