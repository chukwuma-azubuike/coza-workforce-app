import React, { memo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native';
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
    type: 'own' | 'team' | 'campus';
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

                const { status, category, isIndividual, isDepartment, user, departmentName } = elm;

                return (
                    <TouchableOpacity
                        key={index}
                        delayPressIn={0}
                        activeOpacity={0.6}
                        onPress={handlePress}
                        accessibilityRole="button"
                    >
                        <HStackComponent
                            style={{ paddingVertical: 12, alignItems: 'center', justifyContent: 'space-between' }}
                        >
                            <HStackComponent space={6} style={{ alignItems: 'center' }}>
                                <AvatarComponent
                                    size="sm"
                                    imageUrl={
                                        isIndividual
                                            ? user?.pictureUrl || AVATAR_FALLBACK_URL
                                            : AVATAR_GROUP_FALLBACK_URL
                                    }
                                />
                                <VStackComponent style={{ justifyContent: 'space-between' }}>
                                    {type === 'own' && (
                                        <>
                                            <TextComponent>
                                                {Utils.capitalizeFirstChar(category?.categoryName)}
                                            </TextComponent>
                                            <TextComponent>{Utils.truncateString(departmentName)}</TextComponent>
                                        </>
                                    )}
                                    {type === 'team' && (
                                        <>
                                            <TextComponent bold>
                                                {isDepartment
                                                    ? departmentName
                                                    : `${Utils.capitalizeFirstChar(
                                                          user?.firstName
                                                      )} ${Utils.capitalizeFirstChar(user?.lastName)}`}
                                            </TextComponent>
                                            <TextComponent>
                                                {Utils.capitalizeFirstChar(category?.categoryName)}
                                            </TextComponent>
                                        </>
                                    )}
                                    {type === 'campus' && (
                                        <>
                                            {isIndividual && (
                                                <TextComponent bold>
                                                    {`${Utils.capitalizeFirstChar(
                                                        user?.firstName
                                                    )} ${Utils.capitalizeFirstChar(user?.lastName)}`}
                                                </TextComponent>
                                            )}
                                            <TextComponent>{departmentName || ''}</TextComponent>
                                            {isDepartment && (
                                                <TextComponent style={{ fontSize: 14 }} bold={isDepartment}>
                                                    Departmental
                                                </TextComponent>
                                            )}
                                            <TextComponent style={{ fontSize: 14 }}>
                                                {Utils.capitalizeFirstChar(category?.categoryName)}
                                            </TextComponent>
                                        </>
                                    )}
                                </VStackComponent>
                            </HStackComponent>
                            <StatusTag>{status}</StatusTag>
                        </HStackComponent>
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

export { MyTicketsList, MyTeamTicketsList, LeadersTicketsList, CampusTickets };
