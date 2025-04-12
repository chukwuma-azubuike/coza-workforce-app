import { Text } from "~/components/ui/text";
import React, { memo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity, View } from 'react-native';
import AvatarComponent from '@components/atoms/avatar';
import StatusTag from '@components/atoms/status-tag';
import FlatListComponent, { IFlatListColumn } from '@components/composite/flat-list';
import { AVATAR_FALLBACK_URL, AVATAR_GROUP_FALLBACK_URL } from '@constants/index';
import useFetchMoreData from '@hooks/fetch-more-data';
import useRole from '@hooks/role';
import { useGetTicketsQuery } from '@store/services/tickets';
import { ITicket } from '@store/types';
import Utils from '@utils/index';
import useScreenFocus from '@hooks/focus';
import TextComponent from '@components/text';
import HStackComponent from '@components/layout/h-stack';
import VStackComponent from '@components/layout/v-stack';

const ITEM_HEIGHT = 60;
export interface TicketListRowProps extends ITicket {
    type: 'own' | 'team' | 'campus' | 'grouphead';
    '0'?: string;
    '1'?: ITicket[];
}

export const TicketListRow: React.FC<TicketListRowProps> = memo(props => {
    const navigation = useNavigation();
    const { type } = props;

    return (
        <>
            {props[1]?.map((elm, index) => {
                const handlePress = () => {
                    navigation.navigate('Ticket Details' as never, elm as never);
                };

                const { status, category, isIndividual, isDepartment, user, departmentName, campus } = elm;

                return (
                    <TouchableOpacity
                        key={index}
                        delayPressIn={0}
                        activeOpacity={0.6}
                        onPress={handlePress}
                        accessibilityRole="button"
                    >
                        <View
                            className="py-12 items-center justify-between"
                        >
                            <View space={6} className="items-center">
                                <AvatarComponent
                                    size="sm"
                                    imageUrl={
                                        isIndividual
                                            ? user?.pictureUrl || AVATAR_FALLBACK_URL
                                            : AVATAR_GROUP_FALLBACK_URL
                                    }
                                />
                                <View className="justify-between">
                                    {type === 'own' && (
                                        <>
                                            <Text>
                                                {Utils.capitalizeFirstChar(category?.categoryName)}
                                            </Text>
                                            <Text>{Utils.truncateString(departmentName)}</Text>
                                        </>
                                    )}
                                    {type === 'team' && (
                                        <>
                                            <Text className="font-bold">
                                                {isDepartment
                                                    ? departmentName
                                                    : `${Utils.capitalizeFirstChar(
                                                          user?.firstName
                                                      )} ${Utils.capitalizeFirstChar(user?.lastName)}`}
                                            </Text>
                                            <Text>
                                                {Utils.capitalizeFirstChar(category?.categoryName)}
                                            </Text>
                                        </>
                                    )}
                                    {type === 'campus' && (
                                        <>
                                            {isIndividual && (
                                                <Text className="font-bold">
                                                    {`${Utils.capitalizeFirstChar(
                                                        user?.firstName
                                                    )} ${Utils.capitalizeFirstChar(user?.lastName)}`}
                                                </Text>
                                            )}
                                            <Text>{departmentName || ''}</Text>
                                            {isDepartment && (
                                                <Text className="text-14 font-bold">
                                                    Departmental
                                                </Text>
                                            )}
                                            <Text className="text-14">
                                                {Utils.capitalizeFirstChar(category?.categoryName)}
                                            </Text>
                                        </>
                                    )}

                                    {type === 'grouphead' && (
                                        <>
                                            {isIndividual && (
                                                <>
                                                    <Text className="font-bold">
                                                        {`${Utils.capitalizeFirstChar(
                                                            user?.firstName
                                                        )} ${Utils.capitalizeFirstChar(user?.lastName)}`}
                                                    </Text>
                                                    <Text className="text-14 font-bold">
                                                        {campus?.campusName}
                                                    </Text>
                                                    <Text>{departmentName || ''}</Text>
                                                </>
                                            )}

                                            {isDepartment && (
                                                <>
                                                    <Text className="text-14 font-bold">
                                                        {campus?.campusName}
                                                    </Text>
                                                    <Text className="text-14 font-bold">
                                                        {departmentName}
                                                    </Text>
                                                </>
                                            )}
                                            <Text className="text-14">
                                                {Utils.capitalizeFirstChar(category?.categoryName)}
                                            </Text>
                                        </>
                                    )}
                                </View>
                            </View>
                            <StatusTag>{status}</StatusTag>
                        </View>
                    </TouchableOpacity>
                );
            })}
        </>
    );
});

const MyTicketsList: React.FC<{ updatedListItem: ITicket; reload: boolean }> = memo(({ updatedListItem, reload }) => {
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
    const { data, isLoading, isSuccess, isFetching, refetch, isUninitialized } = useGetTicketsQuery(
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

    useScreenFocus({
        onFocus: () => {
            if (reload && !isUninitialized) refetch();
        },
    });

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
            getItemLayout={(data, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
        />
    );
});

const MyTeamTicketsList: React.FC<{ updatedListItem: ITicket; reload: boolean }> = memo(
    ({ updatedListItem, reload }) => {
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
        const { data, isLoading, isSuccess, isFetching, refetch, isUninitialized } = useGetTicketsQuery(
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

        const preparedForSortData = React.useMemo(
            () =>
                moreData?.map((ticket: ITicket) => {
                    return { ...ticket, sortDateKey: ticket?.updatedAt || ticket?.createdAt };
                }),
            [moreData]
        );

        const sortedData = React.useMemo(
            () => Utils.sortByDate(preparedForSortData || [], 'sortDateKey'),
            [preparedForSortData]
        );

        const groupedData = React.useMemo(
            () =>
                Utils.groupListByKey(
                    !!updatedListItem?._id
                        ? Utils.replaceArrayItemByNestedKey(sortedData || [], updatedListItem, [
                              '_id',
                              updatedListItem?._id,
                          ])
                        : sortedData,
                    'sortDateKey'
                ),
            [updatedListItem?._id, sortedData]
        );

        useScreenFocus({
            onFocus: () => {
                if (reload && !isUninitialized) refetch();
            },
        });

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
                getItemLayout={(data, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
            />
        );
    }
);

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

    const preparedForSortData = React.useMemo(
        () =>
            data?.map((ticket: ITicket) => {
                return { ...ticket, sortDateKey: ticket?.updatedAt || ticket?.createdAt };
            }),
        [data]
    );

    const sortedData = React.useMemo(
        () => Utils.sortByDate(preparedForSortData || [], 'sortDateKey'),
        [preparedForSortData]
    );

    const groupedData = React.useMemo(
        () =>
            Utils.groupListByKey(
                Utils.replaceArrayItemByNestedKey(sortedData || [], updatedListItem, ['_id', updatedListItem?._id]),
                'sortDateKey'
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
            getItemLayout={(data, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
        />
    );
});

const CampusTickets: React.FC<{ updatedListItem: ITicket; reload: boolean }> = memo(({ updatedListItem, reload }) => {
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

    const { data, isLoading, isSuccess, isFetching, refetch, isUninitialized } = useGetTicketsQuery(
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

    const preparedForSortData = React.useMemo(
        () =>
            moreData?.map((data: ITicket) => {
                return { ...data, sortDateKey: data?.updatedAt || data?.createdAt };
            }),
        [moreData]
    );

    const sortedData = React.useMemo(
        () => Utils.sortByDate(preparedForSortData || [], 'sortDateKey'),
        [preparedForSortData]
    );

    const groupedData = React.useMemo(
        () =>
            Utils.groupListByKey(
                Utils.replaceArrayItemByNestedKey(sortedData || [], updatedListItem, ['_id', updatedListItem?._id]),
                'sortDateKey'
            ),
        [updatedListItem?._id, sortedData]
    );

    useScreenFocus({
        onFocus: () => {
            if (reload && !isUninitialized) refetch();
        },
    });

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
            getItemLayout={(data, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
        />
    );
});

const GroupTicketsList: React.FC<{ updatedListItem: ITicket; reload: boolean }> = memo(
    ({ updatedListItem, reload }) => {
        const groupTicketsColumns: IFlatListColumn[] = [
            {
                dataIndex: 'createdAt',
                render: (_: ITicket, key) => <TicketListRow type="grouphead" {..._} key={key} />,
            },
        ];

        const [page, setPage] = React.useState<number>(1);
        const { data, isLoading, isSuccess, isFetching, refetch, isUninitialized } = useGetTicketsQuery(
            {
                isGH: true,
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

        const preparedForSortData = React.useMemo(
            () =>
                moreData?.map((ticket: ITicket) => {
                    return { ...ticket, sortDateKey: ticket?.updatedAt || ticket?.createdAt };
                }),
            [moreData]
        );

        const sortedData = React.useMemo(
            () => Utils.sortByDate(preparedForSortData || [], 'sortDateKey'),
            [preparedForSortData]
        );

        const groupedData = React.useMemo(
            () =>
                Utils.groupListByKey(
                    !!updatedListItem?._id
                        ? Utils.replaceArrayItemByNestedKey(sortedData || [], updatedListItem, [
                              '_id',
                              updatedListItem?._id,
                          ])
                        : sortedData,
                    'sortDateKey'
                ),
            [updatedListItem?._id, sortedData]
        );

        useScreenFocus({
            onFocus: () => {
                if (reload && !isUninitialized) refetch();
            },
        });

        return (
            <FlatListComponent
                data={groupedData}
                columns={groupTicketsColumns}
                fetchMoreData={fetchMoreData}
                isLoading={isLoading || isFetching}
                refreshing={isLoading || isFetching}
                emptyMessage="There are no tickets issued"
                getItemLayout={(data, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
            />
        );
    }
);

export { MyTicketsList, MyTeamTicketsList, LeadersTicketsList, CampusTickets, GroupTicketsList };
