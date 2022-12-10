import React from 'react';
import ViewWrapper from '../../../components/layout/viewWrapper';
import Empty from '../../../components/atoms/empty';
import { AddButtonComponent } from '../../../components/atoms/button';
import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
    CampusPermissions,
    MyPermissionsList,
    MyTeamPermissionsList,
} from './permissions-list';
import { SceneMap } from 'react-native-tab-view';
import { data } from '../attendance/flatListConfig';
import TabComponent from '../../../components/composite/tabs';

const Permissions: React.FC<NativeStackScreenProps<ParamListBase>> = ({
    navigation,
}) => {
    const handlePress = () => {
        navigation.navigate('Request permission');
    };

    const renderScene = SceneMap({
        myPermissions: MyPermissionsList,
        teamPermissions: MyTeamPermissionsList,
        campusPermissions: CampusPermissions,
    });

    const [index, setIndex] = React.useState(0);
    const [routes] = React.useState([
        { key: 'myPermissions', title: 'My Permissions' },
        { key: 'teamPermissions', title: 'Team Permissions' },
        { key: 'campusPermissions', title: 'Campus Permissions' },
    ]);

    return (
        <ViewWrapper>
            <>
                <AddButtonComponent zIndex={10} onPress={handlePress} />
                {data.length ? (
                    <TabComponent
                        tabBarScroll
                        onIndexChange={setIndex}
                        renderScene={renderScene}
                        navigationState={{ index, routes }}
                    />
                ) : (
                    <Empty message="You haven't requested any permissions." />
                )}
            </>
        </ViewWrapper>
    );
};

export default Permissions;
