import React from 'react';
import ViewWrapper from '../../../components/layout/viewWrapper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ParamListBase } from '@react-navigation/native';
import useRole from '../../../hooks/role';
import { CampusTickets, MyTicketsList, MyTeamTicketsList } from './ticket-list';
import { SceneMap } from 'react-native-tab-view';
import TabComponent from '../../../components/composite/tabs';
import If from '../../../components/composite/if-container';
import StaggerButtonComponent from '../../../components/composite/stagger';

const ROUTES = [
    { key: 'myTickets', title: 'My Tickets' },
    { key: 'teamTickets', title: 'Team Tickets' },
    { key: 'campusTickets', title: 'Campus Tickets' },
];

const Tickets: React.FC<NativeStackScreenProps<ParamListBase>> = ({ navigation }) => {
    const gotoIndividual = () => {
        navigation.navigate('Issue Ticket', { type: 'INDIVIDUAL' });
    };

    const goToDepartmental = () => {
        navigation.navigate('Issue Ticket', { type: 'DEPARTMENTAL' });
    };

    const renderScene = SceneMap({
        myTickets: MyTicketsList,
        teamTickets: MyTeamTicketsList,
        campusTickets: CampusTickets,
    });

    const { isQC, isAHOD, isHOD, isCampusPastor, isGlobalPastor } = useRole();

    const allRoutes = React.useMemo(() => {
        if (isQC) return ROUTES;
        if (isHOD || isAHOD) return [ROUTES[0], ROUTES[1]];
        if (isCampusPastor || isGlobalPastor) return [ROUTES[2]];

        return [ROUTES[0]];
    }, []);

    const [index, setIndex] = React.useState(0);

    return (
        <ViewWrapper>
            <TabComponent
                onIndexChange={setIndex}
                renderScene={renderScene}
                tabBarScroll={allRoutes.length > 2}
                navigationState={{ index, routes: allRoutes }}
            />
            <If condition={isQC}>
                <StaggerButtonComponent
                    buttons={[
                        {
                            color: 'red.400',
                            iconType: 'ionicon',
                            iconName: 'person-outline',
                            handleClick: gotoIndividual,
                        },
                        {
                            color: 'blue.600',
                            iconType: 'ionicon',
                            iconName: 'people-outline',
                            handleClick: goToDepartmental,
                        },
                    ]}
                />
            </If>
        </ViewWrapper>
    );
};

export default Tickets;
