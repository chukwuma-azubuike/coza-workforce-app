import React, { memo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { HStack, Text, VStack } from 'native-base';
import { TouchableNativeFeedback } from 'react-native';
import AvatarComponent from '../../../components/atoms/avatar';
import StatusTag from '../../../components/atoms/status-tag';
import FlatListComponent, { IFlatListColumn } from '../../../components/composite/flat-list';
import { THEME_CONFIG } from '../../../config/appConfig';
import { AVATAR_FALLBACK_URL, AVATAR_GROUP_FALLBACK_URL } from '../../../constants';
import useFetchMoreData from '../../../hooks/fetch-more-data';
import useRole from '../../../hooks/role';
import useAppColorMode from '../../../hooks/theme/colorMode';
import { useGetTicketsQuery } from '../../../store/services/tickets';
import { ITicket } from '../../../store/types';
import Utils from '../../../utils';

export interface TicketListRowProps extends ITicket {
    type: 'own' | 'team' | 'campus';
    '0'?: string;
    '1'?: ITicket[];
}

export const TicketListRow: React.FC<TicketListRowProps> = props => {
    const navigation = useNavigation();
    const { isLightMode } = useAppColorMode();
    const { type } = props;

    return (
        <>
            {props[1]?.map((elm, index) => {
                const handlePress = () => {
                    navigation.navigate('Ticket Details' as never, elm as never);
                };

                const { status, category, isIndividual, isDepartment, user, departmentName } = elm;

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
                                <AvatarComponent
                                    imageUrl={
                                        isIndividual
                                            ? user?.pictureUrl || AVATAR_FALLBACK_URL
                                            : AVATAR_GROUP_FALLBACK_URL
                                    }
                                />
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
                                                {isDepartment
                                                    ? departmentName
                                                    : `${Utils.capitalizeFirstChar(
                                                          user?.firstName
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
                                                {departmentName || ''}
                                            </Text>
                                            {isDepartment && (
                                                <Text
                                                    fontSize="sm"
                                                    bold={isDepartment}
                                                    _dark={{ color: 'gray.300' }}
                                                    _light={{ color: 'gray.600' }}
                                                >
                                                    Departmental
                                                </Text>
                                            )}
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

const MyTicketsList: React.FC<{ updatedListItem: ITicket }> = memo(({ updatedListItem }) => {
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

    const [page, setPage] = React.useState<number>(1);
    const { data, isLoading, isSuccess, isFetching } = useGetTicketsQuery(
        { userId, limit: 20, page },
        { refetchOnMountOrArgChange: true }
    );

    const fetchMoreData = () => {
        if (!isFetching && !isLoading) {
            if (data?.length) {
                setPage(prev => prev + 1);
            } else {
                setPage(prev => prev - 1);
            }
        }
    };

    const { data: moreData } = useFetchMoreData({ dataSet: data, isSuccess: isSuccess, uniqKey: '_id' });
    const sortedData = React.useMemo(() => Utils.sortByDate(moreData || [], 'createdAt'), [moreData]);
    const groupedData = React.useMemo(
        () =>
            Utils.groupListByKey(
                Utils.replaceArrayItemByNestedKey(sortedData || [], updatedListItem, ['_id', updatedListItem?._id]),
                'createdAt'
            ),
        [updatedListItem?._id, sortedData]
    );

    return (
        <FlatListComponent
            data={groupedData}
            columns={myTicketsColumns}
            fetchMoreData={fetchMoreData}
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

const MyTeamTicketsList: React.FC<{ updatedListItem: ITicket }> = memo(({ updatedListItem }) => {
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

    const [page, setPage] = React.useState<number>(1);
    const { data, isLoading, isSuccess, isFetching } = useGetTicketsQuery(
        {
            departmentId: department._id,
            limit: 20,
            page,
        },
        { refetchOnMountOrArgChange: true }
    );

    const fetchMoreData = () => {
        if (!isFetching && !isLoading) {
            if (data?.length) {
                setPage(prev => prev + 1);
            } else {
                setPage(prev => prev - 1);
            }
        }
    };

    const { data: moreData } = useFetchMoreData({ dataSet: data, isSuccess: isSuccess, uniqKey: '_id' });

    const sortedData = React.useMemo(() => Utils.sortByDate(moreData || [], 'createdAt'), [moreData]);
    const groupedData = React.useMemo(
        () =>
            Utils.groupListByKey(
                Utils.replaceArrayItemByNestedKey(sortedData || [], updatedListItem, ['_id', updatedListItem?._id]),
                'createdAt'
            ),
        [updatedListItem?._id, sortedData]
    );

    return (
        <FlatListComponent
            data={groupedData}
            columns={teamTicketsColumns}
            fetchMoreData={fetchMoreData}
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

const LeadersTicketsList: React.FC<{ updatedListItem: ITicket }> = memo(({ updatedListItem }) => {
    const leadersTicketsColumns: IFlatListColumn[] = [
        {
            dataIndex: 'createdAt',
            render: (_: ITicket, key) => <TicketListRow type="team" {..._} key={key} />,
        },
    ];

    const {
        user: { campus },
        leaderRoleIds,
    } = useRole();

    const [page, setPage] = React.useState<number>(1);

    const {
        data: hodsTickets,
        refetch: hodRefetch,
        isLoading: hodLoading,
        isSuccess: hodIsSuccess,
        isFetching: hodIsFetching,
    } = useGetTicketsQuery(
        {
            // page,
            // limit: 20,
            campusId: campus._id,
            roleId: leaderRoleIds && leaderRoleIds[0],
        },
        { refetchOnMountOrArgChange: true, skip: !leaderRoleIds?.length }
    );

    const {
        data: ahodsTickets,
        refetch: ahodRefetch,
        isLoading: ahodLoading,
        isSuccess: ahodIsSuccess,
        isFetching: ahodIsFetching,
    } = useGetTicketsQuery(
        {
            // page,
            // limit: 20,
            campusId: campus._id,
            roleId: leaderRoleIds && leaderRoleIds[1],
        },
        { refetchOnMountOrArgChange: true, skip: !leaderRoleIds?.length }
    );

    const isLoading = hodLoading || ahodLoading;
    const isFetching = hodIsFetching || ahodIsFetching;
    const isSuccess = hodIsSuccess && ahodIsSuccess;
    const data = ahodsTickets && hodsTickets ? [...ahodsTickets, ...hodsTickets] : [];

    // const fetchMoreData = () => {
    //     if (!isFetching && !isLoading) {
    //         if (data?.length) {
    //             setPage(prev => prev + 1);
    //         } else {
    //             setPage(prev => prev - 1);
    //         }
    //     }
    // };

    // const { data: moreData } = useFetchMoreData({ dataSet: data, isSuccess: isSuccess, uniqKey: '_id' });

    const sortedData = React.useMemo(() => Utils.sortByDate(data || [], 'createdAt'), [data]);
    const groupedData = React.useMemo(
        () =>
            Utils.groupListByKey(
                Utils.replaceArrayItemByNestedKey(sortedData || [], updatedListItem, ['_id', updatedListItem?._id]),
                'createdAt'
            ),
        [updatedListItem?._id, sortedData]
    );

    const handleRefetch = () => {
        hodRefetch();
        ahodRefetch();
    };

    return (
        <FlatListComponent
            data={groupedData}
            isLoading={isLoading}
            onRefresh={handleRefetch}
            // fetchMoreData={fetchMoreData}
            columns={leadersTicketsColumns}
            refreshing={isLoading || isFetching}
            emptyMessage="There are no tickets issued"
        />
    );
});

const CampusTickets: React.FC<{ updatedListItem: ITicket }> = memo(({ updatedListItem }) => {
    const teamTicketsColumns: IFlatListColumn[] = [
        {
            dataIndex: 'createdAt',
            render: (_: ITicket, key) => <TicketListRow type="campus" {..._} key={key} />,
        },
    ];
    const [page, setPage] = React.useState<number>(1);

    const {
        user: { campus },
        isCampusPastor,
        isGlobalPastor,
    } = useRole();

    const { data, isLoading, isSuccess, isFetching } = useGetTicketsQuery(
        {
            campusId: campus._id,
            limit: 20,
            page,
        },
        { refetchOnMountOrArgChange: true }
    );

    const fetchMoreData = () => {
        if (!isFetching && !isLoading) {
            if (data?.length) {
                setPage(prev => prev + 1);
            } else {
                setPage(prev => prev - 1);
            }
        }
    };

    const { data: moreData } = useFetchMoreData({ dataSet: data, isSuccess: isSuccess, uniqKey: '_id' });

    const sortedData = React.useMemo(() => Utils.sortByDate(moreData || [], 'createdAt'), [moreData]);
    const groupedData = React.useMemo(
        () =>
            Utils.groupListByKey(
                Utils.replaceArrayItemByNestedKey(sortedData || [], updatedListItem, ['_id', updatedListItem?._id]),
                'createdAt'
            ),
        [updatedListItem?._id, sortedData]
    );

    return (
        <FlatListComponent
            data={groupedData}
            columns={teamTicketsColumns}
            fetchMoreData={fetchMoreData}
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

export { MyTicketsList, MyTeamTicketsList, LeadersTicketsList, CampusTickets };
