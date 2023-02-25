import React from 'react';
import ViewWrapper from '../../../components/layout/viewWrapper';
import { CampusAttendance, MyAttendance, TeamAttendance } from './lists';
import TabComponent from '../../../components/composite/tabs';
import { SceneMap } from 'react-native-tab-view';
import useRole from '../../../hooks/role';

const ROUTES = [
    { key: 'myAttendance', title: 'My Attendance' },
    { key: 'teamAttendance', title: 'Team Attendance' },
    { key: 'campusAttendance', title: 'Campus Attendance' },
];

const Attendance: React.FC = () => {
    const { isQC, isAHOD, isHOD, isCampusPastor, isGlobalPastor } = useRole();

    const renderScene = SceneMap({
        myAttendance: MyAttendance,
        teamAttendance: TeamAttendance,
        campusAttendance: CampusAttendance,
    });

    const [index, setIndex] = React.useState(0);

    const allRoutes = React.useMemo(() => {
        if (isQC) return ROUTES;
        if (isHOD || isAHOD) return [ROUTES[0], ROUTES[1]];
        if (isCampusPastor || isGlobalPastor) return [ROUTES[2]]

        return [ROUTES[0]];
    }, []);

    return (
        <ViewWrapper>
            <TabComponent
                onIndexChange={setIndex}
                renderScene={renderScene}
                tabBarScroll={allRoutes.length > 2}
                navigationState={{ index, routes: allRoutes }}
            />
        </ViewWrapper>
    );
};

export default Attendance;
