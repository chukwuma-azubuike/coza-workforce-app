import React from 'react';
import ViewWrapper from '../../../components/layout/viewWrapper';
import { data } from './flatListConfig';
import Empty from '../../../components/atoms/empty';
import { CampusAttendance, MyAttendance, TeamAttendance } from './lists';
import TabComponent from '../../../components/composite/tabs';
import { SceneMap } from 'react-native-tab-view';

const Attendance: React.FC = () => {
    const renderScene = SceneMap({
        myAttendance: MyAttendance,
        teamAttendance: TeamAttendance,
        campusAttendance: CampusAttendance,
    });

    const [index, setIndex] = React.useState(0);
    const [routes] = React.useState([
        { key: 'myAttendance', title: 'My Attendance' },
        { key: 'teamAttendance', title: 'Team Attendance' },
        { key: 'campusAttendance', title: 'Campus Attendance' },
    ]);

    return (
        <ViewWrapper>
            {data.length ? (
                <TabComponent
                    tabBarScroll
                    onIndexChange={setIndex}
                    renderScene={renderScene}
                    navigationState={{ index, routes }}
                />
            ) : (
                <Empty />
            )}
        </ViewWrapper>
    );
};

export default Attendance;
