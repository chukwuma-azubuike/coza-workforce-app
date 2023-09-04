import React from 'react';
import ViewWrapper from '@components/layout/viewWrapper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ParamListBase } from '@react-navigation/native';
import useRole from '@hooks/role';
import { CampusTickets, MyTicketsList, MyTeamTicketsList, LeadersTicketsList } from './ticket-list';
import { SceneMap } from 'react-native-tab-view';
import TabComponent from '@components/composite/tabs';
import StaggerButtonComponent, { IStaggerButtonComponentProps } from '@components/composite/stagger';
import { ITicket } from '@store/types';
import useMediaQuery from '@hooks/media-query';
import If from '@components/composite/if-container';
import { IReportTypes } from '../export';
import useScreenFocus from '@hooks/focus';

const ROUTES = [
    { key: 'myTickets', title: 'My Tickets' },
    { key: 'teamTickets', title: 'Team Tickets' },
    { key: 'campusTickets', title: 'Campus Tickets' },
    { key: 'leadersTickets', title: 'Leaders Tickets' },
];

export type ITicketType = 'INDIVIDUAL' | 'DEPARTMENTAL' | 'CAMPUS';

const Tickets: React.FC<NativeStackScreenProps<ParamListBase>> = ({ navigation, route }) => {
    const params = route.params as { tabKey: string; reload: boolean };

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

    const goToExport = () => {
        navigation.navigate('Export Data', { type: IReportTypes.TICKETS });
    };

    const reload = params?.reload;

    const renderScene = SceneMap({
        myTickets: () => <MyTicketsList reload={reload} updatedListItem={updatedListItem} />,
        teamTickets: () => <MyTeamTicketsList reload={reload} updatedListItem={updatedListItem} />,
        campusTickets: () => <CampusTickets reload={reload} updatedListItem={updatedListItem} />,
        leadersTickets: () => <LeadersTicketsList updatedListItem={updatedListItem} />,
    });

    const { isQC, isQcHOD, isAHOD, isHOD, isCampusPastor, isGlobalPastor } = useRole();

    const allRoutes = React.useMemo(() => {
        if (isQC) return ROUTES;
        if (isHOD || isAHOD) return [ROUTES[0], ROUTES[1]];
        if (isCampusPastor || isGlobalPastor) return [ROUTES[3], ROUTES[2]];

        return [ROUTES[0]];
    }, []);

    const [index, setIndex] = React.useState(0);

    const allButtons = [
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
        {
            color: 'green.600',
            iconName: 'download-outline',
            handleClick: goToExport,
            iconType: 'ionicon',
        },
    ];

    const filteredButtons = React.useMemo(() => {
        // TODO: Uncomment once resolved with IOS
        if (isCampusPastor || isGlobalPastor) return [allButtons[3]];
        if (isQcHOD) return [...allButtons];
        if (isQC) return [allButtons[0], allButtons[1], allButtons[2]];

        return [allButtons[0]];
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []) as IStaggerButtonComponentProps['buttons'];

    const routeFocus = () => {
        if (params?.tabKey) {
            setIndex(allRoutes.findIndex(route => route.key === params?.tabKey));
        }
    };

    useScreenFocus({
        onFocus: routeFocus,
    });

    return (
        <ViewWrapper>
            <TabComponent
                onIndexChange={setIndex}
                renderScene={renderScene}
                navigationState={{ index, routes: allRoutes }}
                tabBarScroll={allRoutes.length > 2 && isMobile}
            />
            {/* TODO: Uncomment once reports is resolved with IOS */}
            <If condition={isQcHOD || isGlobalPastor || isCampusPastor}>
                <StaggerButtonComponent buttons={filteredButtons} />
            </If>
        </ViewWrapper>
    );
};

export default Tickets;
