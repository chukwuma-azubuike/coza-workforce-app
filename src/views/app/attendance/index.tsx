import React from 'react';
import ViewWrapper from '../../../components/layout/viewWrapper';
import { CampusAttendance, MyAttendance, TeamAttendance } from './lists';
import TabComponent from '../../../components/composite/tabs';
import { SceneMap } from 'react-native-tab-view';
import useRole from '../../../hooks/role';

const TABS = [
    { key: 'myAttendance', title: 'My Attendance' },
    { key: 'teamAttendance', title: 'Team Attendance' },
    { key: 'campusAttendance', title: 'Campus Attendance' },
];

const Attendance: React.FC = () => {
    const { isWorker, isQC, isAHOD, isHOD, isCampusPastor, isGlobalPastor } = useRole();

    const filteredScene = React.useMemo(() => {
        if (isQC) {
            return {
                myAttendance: MyAttendance,
                teamAttendance: TeamAttendance,
                campusAttendance: CampusAttendance,
            };
        }
        if (isAHOD || isHOD) {
            return {
                myAttendance: MyAttendance,
                teamAttendance: TeamAttendance,
            };
        }
        if (isCampusPastor || isGlobalPastor) {
            return {
                campusAttendance: CampusAttendance,
            };
        }
        if (isWorker) {
            return {
                myAttendance: MyAttendance,
            };
        }
    }, [isQC, isWorker, isAHOD, isHOD, isGlobalPastor, isCampusPastor]);

    const renderScene = SceneMap(filteredScene as unknown as any);

    const [index, setIndex] = React.useState(0);

    const routes = React.useMemo(() => {
        if (isQC) {
            return TABS;
        }
        if (isHOD || isAHOD) {
            return [
                { key: 'myAttendance', title: 'My Attendance' },
                { key: 'teamAttendance', title: 'Team Attendance' },
            ];
        }
        if (isGlobalPastor || isCampusPastor) {
            return [{ key: 'campusAttendance', title: 'Campus Attendance' }];
        }
        if (isWorker) {
            return [{ key: 'myAttendance', title: 'My Attendance' }];
        }
    }, [isQC, isWorker, isAHOD, isHOD, isGlobalPastor, isCampusPastor]);

    return (
        <ViewWrapper>
            {routes && (
                <TabComponent
                    onIndexChange={setIndex}
                    renderScene={renderScene}
                    tabBarScroll={routes.length > 2}
                    navigationState={{ index, routes: routes as any[] }}
                />
            )}
        </ViewWrapper>
    );
};

export default Attendance;
