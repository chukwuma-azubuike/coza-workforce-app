import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { SceneMap } from 'react-native-tab-view';
import StaggerButtonComponent from '../../../components/composite/stagger';
import ViewWrapper from '../../../components/layout/viewWrapper';
import useRole from '../../../hooks/role';
import { useGetServicesQuery } from '../../../store/services/services';

const ROUTES = [{ key: 'serviceManagement', title: 'Service Management' }];

export type ITicketType = 'INDIVIDUAL' | 'DEPARTMENTAL' | 'CAMPUS';

const ServiceManagement: React.FC<NativeStackScreenProps<ParamListBase>> = ({ navigation }) => {
    const gotoService = () => {
        navigation.navigate('Create service');
    };
    const { data, isLoading, isSuccess, isFetching, refetch } = useGetServicesQuery();
    console.log(data);
    // const renderScene = SceneMap({
    //     myTickets: MyTicketsList,
    //     teamTickets: MyTeamTicketsList,
    //     campusTickets: CampusTickets,
    // });

    const { isQC, isAHOD, isHOD, isCampusPastor, isGlobalPastor } = useRole();

    const [index, setIndex] = React.useState(0);

    return (
        <ViewWrapper>
            <StaggerButtonComponent
                buttons={[
                    {
                        color: 'blue.400',
                        iconType: 'ionicon',
                        iconName: 'person-outline',
                        handleClick: gotoService,
                    },
                ]}
            />
        </ViewWrapper>
    );
};

export default ServiceManagement;
