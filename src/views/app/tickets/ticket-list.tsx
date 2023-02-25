import { useNavigation } from '@react-navigation/native';
import { HStack, Text, VStack } from 'native-base';
import React, { memo, useMemo } from 'react';
import { TouchableNativeFeedback } from 'react-native';
import AvatarComponent from '../../../components/atoms/avatar';
import StatusTag from '../../../components/atoms/status-tag';
import FlatListComponent, { IFlatListColumn } from '../../../components/composite/flat-list';
import { THEME_CONFIG } from '../../../config/appConfig';
import useRole from '../../../hooks/role';
import {
    useGetDepartmentTicketsQuery,
    useGetUserTicketsQuery,
    useGetCampusTicketsQuery,
} from '../../../store/services/tickets';
import { ITicket } from '../../../store/types';
import Utils from '../../../utils';

interface TicketListRowProps extends ITicket {
    type: 'own' | 'team' | 'campus';
    '0'?: string;
    '1'?: ITicket[];
}

const TicketListRow: React.FC<TicketListRowProps> = props => {
    const navigation = useNavigation();

    const { type } = props;

    return (
        <>
            {props[1]?.map((elm, idx) => {
                const handlePress = () => {
                    navigation.navigate('Ticket Details' as never, elm as never);
                };

                const {
                    status,
                    remarks,
                    ticketSummary,
                    contestComment,
                    contestReplyComment,
                    category,
                    department,
                    user,
                } = elm;

                return (
                    <TouchableNativeFeedback
                        disabled={false}
                        delayPressIn={0}
                        onPress={handlePress}
                        accessibilityRole="button"
                        background={TouchableNativeFeedback.Ripple(THEME_CONFIG.veryLightGray, false, 220)}
                    >
                        <HStack py={2} flex={1} key={idx} w="full" alignItems="center" justifyContent="space-between">
                            <HStack space={3} alignItems="center">
                                <AvatarComponent imageUrl={user?.pictureUrl} />
                                <VStack justifyContent="space-between">
                                    <Text bold>
                                        {type === 'own'
                                            ? Utils.capitalizeFirstChar(category?.categoryName)
                                            : type === 'team'
                                            ? `${Utils.capitalizeFirstChar(
                                                  user?.firstName
                                              )} ${Utils.capitalizeFirstChar(user?.lastName)}`
                                            : `${Utils.capitalizeFirstChar(
                                                  user?.firstName
                                              )} ${Utils.capitalizeFirstChar(
                                                  user?.lastName
                                              )} (${Utils.capitalizeFirstChar(department?.departmentName)})`}
                                    </Text>
                                    <Text fontSize="sm" color="gray.400">
                                        {Utils.truncateString(ticketSummary)}
                                    </Text>
                                </VStack>
                            </HStack>
                            <StatusTag>{status}</StatusTag>
                        </HStack>
                    </TouchableNativeFeedback>
                );
            })}
        </>
    );
};

const MyTicketsList: React.FC = memo(() => {
    const myTicketsColumns: IFlatListColumn[] = [
        {
            dataIndex: 'createdAt',
            render: (_: ITicket, key) => <TicketListRow type="own" {..._} key={key} />,
        },
    ];

    const {
        user: { userId },
        isCampusPastor,
        isGlobalPastor,
    } = useRole();

    const { data, isLoading, error, refetch } = useGetUserTicketsQuery(userId);

    const memoizedData = useMemo(() => Utils.groupListByKey(data, 'createdAt'), [data]);

    return (
        <FlatListComponent
            data={memoizedData}
            onRefresh={refetch}
            isLoading={isLoading}
            refreshing={isLoading}
            columns={myTicketsColumns}
            emptyMessage={
                isCampusPastor || isGlobalPastor
                    ? 'There are no tickets issued'
                    : "Nothing here, let's keep it that way 😇"
            }
        />
    );
});

const MyTeamTicketsList: React.FC = memo(() => {
    const teamTicketsColumns: IFlatListColumn[] = [
        {
            dataIndex: 'createdAt',
            render: (_: ITicket, key) => <TicketListRow type="team" {..._} key={key} />,
        },
    ];

    const {
        user: { department },
        isCampusPastor,
        isGlobalPastor,
    } = useRole();

    const { data, isLoading, error, refetch } = useGetDepartmentTicketsQuery(department._id);

    const memoizedData = useMemo(() => Utils.groupListByKey(data, 'createdAt'), [isLoading]);

    return (
        <FlatListComponent
            data={memoizedData}
            onRefresh={refetch}
            isLoading={isLoading}
            refreshing={isLoading}
            columns={teamTicketsColumns}
            emptyMessage={
                isCampusPastor || isGlobalPastor
                    ? 'There are no tickets issued'
                    : "Nothing here, let's keep it that way 😇"
            }
        />
    );
});

const CampusTickets: React.FC = memo(() => {
    const teamTicketsColumns: IFlatListColumn[] = [
        {
            dataIndex: 'createdAt',
            render: (_: ITicket, key) => <TicketListRow type="campus" {..._} key={key} />,
        },
    ];

    const {
        user: { campus },
        isCampusPastor,
        isGlobalPastor,
    } = useRole();

    const { data, isLoading, error, refetch } = useGetCampusTicketsQuery(campus.id);

    const memoizedData = useMemo(() => Utils.groupListByKey(data, 'status'), [isLoading]);

    return (
        <FlatListComponent
            data={memoizedData}
            isLoading={isLoading}
            columns={teamTicketsColumns}
            emptyMessage={
                isCampusPastor || isGlobalPastor
                    ? 'There are no tickets issued'
                    : "Nothing here, let's keep it that way 😇"
            }
        />
    );
});

export { MyTicketsList, MyTeamTicketsList, CampusTickets };
