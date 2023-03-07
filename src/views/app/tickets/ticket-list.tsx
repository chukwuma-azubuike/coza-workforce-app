import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import { HStack, Text, VStack } from 'native-base';
import React, { memo, useMemo } from 'react';
import { TouchableNativeFeedback } from 'react-native';
import AvatarComponent from '../../../components/atoms/avatar';
import StatusTag from '../../../components/atoms/status-tag';
import FlatListComponent, { IFlatListColumn } from '../../../components/composite/flat-list';
import { THEME_CONFIG } from '../../../config/appConfig';
import { AVATAR_FALLBACK_URL } from '../../../constants';
import useScreenFocus from '../../../hooks/focus';
import useRole from '../../../hooks/role';
import useAppColorMode from '../../../hooks/theme/colorMode';
import { useGetTicketsQuery } from '../../../store/services/tickets';
import { ITicket } from '../../../store/types';
import Utils from '../../../utils';

interface TicketListRowProps extends ITicket {
    type: 'own' | 'team' | 'campus';
    '0'?: string;
    '1'?: ITicket[];
}

const TicketListRow: React.FC<TicketListRowProps> = props => {
    const navigation = useNavigation();
    const { isLightMode } = useAppColorMode();
    const { type } = props;

    const {
        user: {
            department: { departmentName },
        },
    } = useRole();

    return (
        <>
            {props[1]?.map((elm, index) => {
                const handlePress = () => {
                    navigation.navigate('Ticket Details' as never, elm as never);
                };

                const { status, remarks, ticketSummary, category, isIndividual, isDepartment, user, departmentName } =
                    elm;

                return (
                    <TouchableNativeFeedback
                        disabled={false}
                        delayPressIn={0}
                        onPress={handlePress}
                        accessibilityRole="button"
                        background={TouchableNativeFeedback.Ripple(
                            isLightMode ? THEME_CONFIG.veryLightGray : THEME_CONFIG.darkGray,
                            false,
                            220
                        )}
                        key={index}
                        style={{ paddingHorizontal: 20 }}
                    >
                        <HStack py={2} flex={1} w="full" alignItems="center" justifyContent="space-between">
                            <HStack space={3} alignItems="center">
                                <AvatarComponent imageUrl={user?.pictureUrl || AVATAR_FALLBACK_URL} />
                                <VStack justifyContent="space-between">
                                    {type === 'own' && (
                                        <>
                                            <Text
                                                fontSize="sm"
                                                _dark={{ color: 'gray.300' }}
                                                _light={{ color: 'gray.600' }}
                                            >
                                                {Utils.capitalizeFirstChar(category?.categoryName)}
                                            </Text>
                                            <Text
                                                fontSize="sm"
                                                _dark={{ color: 'gray.300' }}
                                                _light={{ color: 'gray.600' }}
                                            >
                                                {Utils.truncateString(departmentName)}
                                            </Text>
                                        </>
                                    )}
                                    {type === 'team' && (
                                        <>
                                            <Text bold>
                                                {`${Utils.capitalizeFirstChar(
                                                    isDepartment ? departmentName : user?.firstName
                                                )} ${Utils.capitalizeFirstChar(user?.lastName)}`}
                                            </Text>
                                            <Text
                                                fontSize="sm"
                                                _dark={{ color: 'gray.300' }}
                                                _light={{ color: 'gray.600' }}
                                            >
                                                {Utils.capitalizeFirstChar(category?.categoryName)}
                                            </Text>
                                        </>
                                    )}
                                    {type === 'campus' && (
                                        <>
                                            {isIndividual && (
                                                <Text bold>
                                                    {`${Utils.capitalizeFirstChar(
                                                        user?.firstName
                                                    )} ${Utils.capitalizeFirstChar(user?.lastName)}`}
                                                </Text>
                                            )}
                                            <Text
                                                fontSize="sm"
                                                bold={isDepartment}
                                                _dark={{ color: 'gray.300' }}
                                                _light={{ color: 'gray.600' }}
                                            >
                                                {`${Utils.capitalizeFirstChar(departmentName || '')} ${
                                                    isDepartment && ' - Departmental'
                                                }`}
                                            </Text>
                                            <Text
                                                fontSize="sm"
                                                _dark={{ color: 'gray.300' }}
                                                _light={{ color: 'gray.600' }}
                                            >
                                                {Utils.capitalizeFirstChar(category?.categoryName)}
                                            </Text>
                                        </>
                                    )}
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

    const { data, isLoading, error, isFetching, refetch } = useGetTicketsQuery({ userId });

    const sortedData = React.useMemo(() => Utils.sortByDate(data ? data : [], 'createdAt'), [data]);

    const groupedData = useMemo(() => Utils.groupListByKey(sortedData, 'createdAt'), [sortedData]);

    useScreenFocus({ onFocus: refetch });

    return (
        <FlatListComponent
            data={groupedData}
            onRefresh={refetch}
            columns={myTicketsColumns}
            isLoading={isLoading || isFetching}
            refreshing={isLoading || isFetching}
            emptyMessage={
                isCampusPastor || isGlobalPastor
                    ? 'There are no tickets issued sir'
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

    const { data, isLoading, error, refetch, isFetching } = useGetTicketsQuery({
        departmentId: department._id,
        limit: 20,
        page: 1,
    });

    const sortedData = React.useMemo(() => Utils.sortByDate(data ? data : [], 'createdAt'), [data]);

    const groupedData = useMemo(() => Utils.groupListByKey(sortedData, 'createdAt'), [sortedData]);

    useScreenFocus({ onFocus: refetch });

    return (
        <FlatListComponent
            data={groupedData}
            onRefresh={refetch}
            columns={teamTicketsColumns}
            isLoading={isLoading || isFetching}
            refreshing={isLoading || isFetching}
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

    const { data, isLoading, error, refetch, isFetching } = useGetTicketsQuery({
        campusId: campus._id,
        limit: 20,
        page: 1,
    });

    const sortedData = React.useMemo(() => Utils.sortByDate(data ? data : [], 'createdAt'), [data]);

    const groupedData = useMemo(() => Utils.groupListByKey(sortedData, 'createdAt'), [sortedData]);

    useScreenFocus({ onFocus: refetch });

    return (
        <FlatListComponent
            data={groupedData}
            onRefresh={refetch}
            columns={teamTicketsColumns}
            isLoading={isLoading || isFetching}
            refreshing={isLoading || isFetching}
            emptyMessage={
                isCampusPastor || isGlobalPastor
                    ? 'There are no tickets issued'
                    : "Nothing here, let's keep it that way 😇"
            }
        />
    );
});

export { MyTicketsList, MyTeamTicketsList, CampusTickets };
