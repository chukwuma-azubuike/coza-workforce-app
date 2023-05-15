import React from 'react';
import ViewWrapper from '../../../components/layout/viewWrapper';
import { CampusAttendance, LeadersAttendance, MyAttendance, TeamAttendance } from './lists';
import TabComponent from '../../../components/composite/tabs';
import { SceneMap } from 'react-native-tab-view';
import useRole, { ROLES } from '../../../hooks/role';
import useMediaQuery from '../../../hooks/media-query';
import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import useScreenFocus from '../../../hooks/focus';

const Attendance: React.FC<NativeStackScreenProps<ParamListBase>> = props => {
    const { isQC, isAHOD, isHOD, isCampusPastor, isGlobalPastor } = useRole();
    const { isMobile } = useMediaQuery();
    const params = props.route.params as { role: ROLES };

    const isLeader = Array.isArray(params?.role) && params?.role.includes(ROLES.HOD || ROLES.AHOD);
    const isWorker = params?.role === ROLES.worker;

    const ROUTES = [
        { key: 'myAttendance', title: 'My Attendance' },
        { key: 'teamAttendance', title: 'Team Attendance' },
        { key: 'campusAttendance', title: 'Campus Attendance' },
        { key: 'leadersAttendance', title: 'Leaders Attendance' },
    ];

    const renderScene = SceneMap({
        myAttendance: MyAttendance,
        teamAttendance: TeamAttendance,
        campusAttendance: CampusAttendance,
        leadersAttendance: LeadersAttendance,
    });

    const [index, setIndex] = React.useState(0);

    const allRoutes = React.useMemo(() => {
        if (isQC) return ROUTES;
        if (isHOD || isAHOD) return [ROUTES[0], ROUTES[1]];
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
        </ViewWrapper>
    );
};

export default Attendance;
