import React from 'react';
import ViewWrapper from '../../../components/layout/viewWrapper';
import Empty from '../../../components/atoms/empty';
import { CampusAttendance, MyAttendance, TeamAttendance } from './lists';
import TabComponent from '../../../components/composite/tabs';
import { SceneMap } from 'react-native-tab-view';
import useRole from '../../../hooks/role';
import { useGetAttendanceByUserIdQuery } from '../../../store/services/attendance';

const TABS = [
    { key: 'myAttendance', title: 'My Attendance' },
    { key: 'teamAttendance', title: 'Team Attendance' },
    { key: 'campusAttendance', title: 'Campus Attendance' },
];

const Attendance: React.FC = () => {
    const { isWorker, isQC, isAHOD, isHOD, user, isCampusPastor } = useRole();

    const filteredScene = React.useMemo(() => {
        if (isWorker) {
            return {
                myAttendance: MyAttendance,
            };
        }
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
        if (isCampusPastor) {
            return {
                campusAttendance: CampusAttendance,
            };
        }
    }, [user]);

    const renderScene = SceneMap(filteredScene as unknown as any);

    const [index, setIndex] = React.useState(0);

    const routes = React.useMemo(() => {
        if (isWorker) return TABS.filter(elm => elm.key === 'myAttendance');
        if (isHOD || isAHOD) {
            return TABS.filter(elm => elm.key !== 'campusAttendance');
        }
        if (isQC) return TABS;
    }, [user?.role]);

    const { data } = useGetAttendanceByUserIdQuery(user?.userId as string, {
        skip: !user,
        refetchOnMountOrArgChange: true,
    });

    return (
        <ViewWrapper>
            {data?.length && routes ? (
                <TabComponent
                    onIndexChange={setIndex}
                    renderScene={renderScene}
                    tabBarScroll={routes.length > 2}
                    navigationState={{ index, routes: routes as any[] }}
                />
            ) : (
                <Empty message="You have not marked any attendance yet" />
            )}
        </ViewWrapper>
    );
};

export default Attendance;
