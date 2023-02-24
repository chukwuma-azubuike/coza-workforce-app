import React from 'react';
import ViewWrapper from '../../../components/layout/viewWrapper';
import Empty from '../../../components/atoms/empty';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ParamListBase } from '@react-navigation/native';
import useRole from '../../../hooks/role';
import { CampusTickets, MyTicketsList, MyTeamTicketsList } from './ticket-list';
import { SceneMap } from 'react-native-tab-view';
import { TEST_DATA as data } from './ticket-list';
import TabComponent from '../../../components/composite/tabs';
import If from '../../../components/composite/if-container';
import StaggerButtonComponent from '../../../components/composite/stagger';

const ROUTES = [
    { key: 'myTickets', title: 'My Tickets' },
    { key: 'teamTickets', title: 'Team Tickets' },
    // { key: 'campusTickets', title: 'Campus Tickets' },
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

    const { isQC, isAHOD, isHOD, isWorker, isCampusPastor, isGlobalPastor } = useRole();

    const allRoutes = React.useMemo(() => {
        if (isQC) return ROUTES;

        if (isHOD || isAHOD) return ROUTES.filter(elm => elm.key !== 'campusTickets');

        if (isWorker) return ROUTES;
    }, []);

    const [index, setIndex] = React.useState(0);

    return (
        <ViewWrapper>
            {data.length ? (
                <TabComponent
                    onIndexChange={setIndex}
                    renderScene={renderScene}
                    tabBarScroll={isQC && (isHOD || isAHOD)}
                    navigationState={{ index, routes: ROUTES }}
                />
            ) : (
                <Empty
                    message={
                        isCampusPastor || isGlobalPastor
                            ? 'No tickets assigned yet sir.'
                            : "Nothing here. Let's keep it that way! 😇"
                    }
                />
            )}
            {/* <If condition={isQC}> */}
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
            {/* </If> */}
        </ViewWrapper>
    );
};

export default Tickets;
