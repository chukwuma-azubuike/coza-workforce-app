import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { SceneMap } from 'react-native-tab-view';
import ViewWrapper from '../../../components/layout/viewWrapper';
import { AddButtonComponent } from '../../../components/atoms/button';
import { AllService } from './list';
import TabComponent from '../../../components/composite/tabs';
import { IService } from '../../../store/types';

const ROUTES = [{ key: 'serviceManagement', title: 'Service Management' }];

export type ITicketType = 'INDIVIDUAL' | 'DEPARTMENTAL' | 'CAMPUS';

const ServiceManagement: React.FC<NativeStackScreenProps<ParamListBase>> = ({ navigation, route }) => {
    const updatedListItem = route.params as IService;
    const gotoService = () => {
        navigation.navigate('Create service');
    };

    const [index, setIndex] = React.useState(0);

    const renderScene = SceneMap({
        serviceManagement: () => <AllService updatedListItem={updatedListItem} />,
    });

    const allRoutes = React.useMemo(() => {
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
            <AddButtonComponent zIndex={10} onPress={gotoService} />
        </ViewWrapper>
    );
};

export default ServiceManagement;
