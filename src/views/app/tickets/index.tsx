import React from 'react';
import ViewWrapper from '../../../components/layout/viewWrapper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ParamListBase } from '@react-navigation/native';
import useRole from '../../../hooks/role';
import { CampusTickets, MyTicketsList, MyTeamTicketsList, LeadersTicketsList } from './ticket-list';
import { SceneMap } from 'react-native-tab-view';
import TabComponent from '../../../components/composite/tabs';
import If from '../../../components/composite/if-container';
import StaggerButtonComponent from '../../../components/composite/stagger';
import { ITicket } from '../../../store/types';
import useMediaQuery from '../../../hooks/media-query';

const ROUTES = [
    { key: 'myTickets', title: 'My Tickets' },
    { key: 'teamTickets', title: 'Team Tickets' },
    { key: 'campusTickets', title: 'Campus Tickets' },
    { key: 'leadersTickets', title: 'Leaders Tickets' },
];

export type ITicketType = 'INDIVIDUAL' | 'DEPARTMENTAL' | 'CAMPUS';

const Tickets: React.FC<NativeStackScreenProps<ParamListBase>> = ({ navigation, route }) => {
    const { isMobile } = useMediaQuery();
    const updatedListItem = route?.params as ITicket;

    const gotoIndividual = () => {
        navigation.navigate('Issue Ticket', { type: 'INDIVIDUAL' });
    };

    const goToDepartmental = () => {
        navigation.navigate('Issue Ticket', { type: 'DEPARTMENTAL' });
    };

    const goToCampus = () => {
        navigation.navigate('Issue Ticket', { type: 'CAMPUS' });
    };

    const renderScene = SceneMap({
        myTickets: () => <MyTicketsList updatedListItem={updatedListItem} />,
        teamTickets: () => <MyTeamTicketsList updatedListItem={updatedListItem} />,
        campusTickets: () => <CampusTickets updatedListItem={updatedListItem} />,
        leadersTickets: () => <LeadersTicketsList updatedListItem={updatedListItem} />,
    });

    const { isQC, isAHOD, isHOD, isCampusPastor, isGlobalPastor } = useRole();

    const allRoutes = React.useMemo(() => {
        if (isQC) return ROUTES;
        if (isHOD || isAHOD) return [ROUTES[0], ROUTES[1]];
        if (isCampusPastor || isGlobalPastor) return [ROUTES[3], ROUTES[2]];

        return [ROUTES[0]];
    }, []);

    const [index, setIndex] = React.useState(0);

    return (
        <ViewWrapper>
            <TabComponent
                onIndexChange={setIndex}
                renderScene={renderScene}
                navigationState={{ index, routes: allRoutes }}
                tabBarScroll={allRoutes.length > 2 && isMobile}
            />
            <If condition={isQC}>
                <StaggerButtonComponent
                    buttons={[
                        {
                            color: 'blue.400',
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
                        {
                            color: 'blue.800',
                            iconName: 'church',
                            handleClick: goToCampus,
                            iconType: 'material-community',
                        },
                    ]}
                />
            </If>
        </ViewWrapper>
    );
};

export default Tickets;
