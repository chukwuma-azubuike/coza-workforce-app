import React from 'react';
import useRole from '@hooks/role';
import { CampusTickets, MyTicketsList, MyTeamTicketsList, LeadersTicketsList, GroupTicketsList } from './ticket-list';
import { SceneMap } from 'react-native-tab-view';
import TabComponent from '@components/composite/tabs';
import { ITicket } from '@store/types';
import useMediaQuery from '@hooks/media-query';
import If from '@components/composite/if-container';
import useScreenFocus from '@hooks/focus';
import DynamicSearch from '@components/composite/search';
import { useGetTicketsQuery } from '@store/services/tickets';
import { AddButtonComponent } from '@components/atoms/button';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, View } from 'react-native';
import TopNav from '~/components/layout/top-nav';

const ROUTES = [
    { key: 'myTickets', title: 'My Tickets' },
    { key: 'teamTickets', title: 'Team Tickets' },
    { key: 'campusTickets', title: 'Campus Tickets' },
    { key: 'leadersTickets', title: 'Leaders Tickets' },
    { key: 'groupTickets', title: 'Group Tickets' },
];

export type ITicketType = 'INDIVIDUAL' | 'DEPARTMENTAL' | 'CAMPUS';

const Tickets: React.FC = () => {
    const params = useLocalSearchParams<{ tabKey: string }>();

    const { isMobile } = useMediaQuery();

    const gotoIndividual = () => {
        router.push({ pathname: '/tickets/issue-ticket', params: { type: 'INDIVIDUAL' } });
    };

    const renderScene = SceneMap({
        myTickets: () => <MyTicketsList />,
        teamTickets: () => <MyTeamTicketsList />,
        campusTickets: () => <CampusTickets />,
        leadersTickets: () => <LeadersTicketsList />,
        groupTickets: () => <GroupTicketsList />,
    });

    const {
        isQC,
        isAHOD,
        isHOD,
        isCampusPastor,
        isGlobalPastor,
        isGroupHead,
        user: { campus },
    } = useRole();

    const canSearch = isQC || isCampusPastor || isGlobalPastor;

    const {
        data: tickets,
        isLoading: isLoadingTickets,
        isFetching: isFetchingTickets,
    } = useGetTicketsQuery({ campusId: campus?._id, limit: 500 }, { skip: !canSearch });

    const allRoutes = React.useMemo(() => {
        if (isQC) return [ROUTES[0], ROUTES[1], ROUTES[2], ROUTES[3]];
        if (isHOD || isAHOD) return [ROUTES[0], ROUTES[1]];
        if (isGroupHead) return [ROUTES[0], ROUTES[4]];
        if (isCampusPastor || isGlobalPastor) return [ROUTES[3], ROUTES[2]];

        return [ROUTES[0]];
    }, []);

    const [index, setIndex] = React.useState(0);

    const routeFocus = () => {
        if (params?.tabKey) {
            setIndex(allRoutes.findIndex(route => route.key === params?.tabKey));
        }
    };

    useScreenFocus({
        onFocus: routeFocus,
    });

    const handleUserPress = (user: ITicket) => {
        router.push({ pathname: '/tickets/ticket-details', params: user as any });
    };

    return (
        <SafeAreaView className="flex-1">
            <View className="flex-1">
                <TabComponent
                    onIndexChange={setIndex}
                    renderScene={renderScene}
                    navigationState={{ index, routes: allRoutes }}
                    tabBarScroll={allRoutes.length > 2 && isMobile}
                />
                <If condition={isQC}>
                    <AddButtonComponent onPress={gotoIndividual} />
                </If>
                <If condition={canSearch}>
                    <DynamicSearch
                        data={tickets}
                        disable={!tickets}
                        onPress={handleUserPress as any}
                        loading={isLoadingTickets || isFetchingTickets}
                        searchFields={['firstName', 'lastName', 'departmentName', 'categoryName', 'status', 'user']}
                    />
                </If>
            </View>
        </SafeAreaView>
    );
};

export default React.memo(Tickets);
