import { Text } from '~/components/ui/text';
import React, { memo } from 'react';
import { TouchableOpacity, View } from 'react-native';
import AvatarComponent from '@components/atoms/avatar';
import StatusTag from '@components/atoms/status-tag';
import FlatListComponent, { IFlatListColumn } from '@components/composite/flat-list';
import { AVATAR_FALLBACK_URL, AVATAR_GROUP_FALLBACK_URL } from '@constants/index';
import useFetchMoreData from '@hooks/fetch-more-data';
import useRole from '@hooks/role';
import { useGetTicketsQuery } from '@store/services/tickets';
import { IDefaultQueryParams, ITicket } from '@store/types';
import Utils from '@utils/index';
import useScreenFocus from '@hooks/focus';
import { router } from 'expo-router';
import SectionListComponent from '~/components/composite/section-list';
import ErrorBoundary from '~/components/composite/error-boundary';
import useInfiniteData from '~/hooks/fetch-more-data/use-infinite-data';

const ITEM_HEIGHT = 60;
export interface TicketListRowProps extends ITicket {
    type: 'own' | 'team' | 'campus' | 'grouphead';
}

export const TicketListRow: React.FC<TicketListRowProps> = memo(props => {
    const { type } = props;

    const handlePress = () => {
        router.push({ pathname: '/tickets/ticket-details', params: props as any });
    };

    const { status, category, isIndividual, isDepartment, user, departmentName, campus } = props;

    return (
        <TouchableOpacity delayPressIn={0} activeOpacity={0.6} onPress={handlePress} accessibilityRole="button">
            <View className="py-4 px-2 items-center w-full justify-between flex-row">
                <View className="items-center gap-4 flex-row">
                    <AvatarComponent
                        alt="ticket-list"
                        imageUrl={isIndividual ? user?.pictureUrl || AVATAR_FALLBACK_URL : AVATAR_GROUP_FALLBACK_URL}
                    />
                    <View className="justify-between">
                        {type === 'own' && (
                            <>
                                <Text>{Utils.capitalizeFirstChar(category?.categoryName)}</Text>
                                <Text>{Utils.truncateString(departmentName)}</Text>
                            </>
                        )}
                        {type === 'team' && (
                            <>
                                <Text className="font-bold">
                                    {isDepartment
                                        ? departmentName
                                        : `${Utils.capitalizeFirstChar(user?.firstName)} ${Utils.capitalizeFirstChar(
                                              user?.lastName
                                          )}`}
                                </Text>
                                <Text>{Utils.capitalizeFirstChar(category?.categoryName)}</Text>
                            </>
                        )}
                        {type === 'campus' && (
                            <>
                                {isIndividual && (
                                    <Text className="font-bold">
                                        {`${Utils.capitalizeFirstChar(user?.firstName)} ${Utils.capitalizeFirstChar(
                                            user?.lastName
                                        )}`}
                                    </Text>
                                )}
                                <Text>{departmentName}</Text>
                                {isDepartment && <Text className="font-bold">Departmental</Text>}
                                <Text>{Utils.capitalizeFirstChar(category?.categoryName)}</Text>
                            </>
                        )}

                        {type === 'grouphead' && (
                            <>
                                {isIndividual && (
                                    <>
                                        <Text className="font-bold">
                                            {`${Utils.capitalizeFirstChar(user?.firstName)} ${Utils.capitalizeFirstChar(
                                                user?.lastName
                                            )}`}
                                        </Text>
                                        <Text className="font-bold">{campus?.campusName}</Text>
                                        <Text>{departmentName || ''}</Text>
                                    </>
                                )}

                                {isDepartment && (
                                    <>
                                        <Text className="font-bold">{campus?.campusName}</Text>
                                        <Text className="font-bold">{departmentName}</Text>
                                    </>
                                )}
                                <Text>{Utils.capitalizeFirstChar(category?.categoryName)}</Text>
                            </>
                        )}
                    </View>
                </View>
                <StatusTag>{status}</StatusTag>
            </View>
        </TouchableOpacity>
    );
});

const MyTicketsList: React.FC = memo(() => {
    const {
        user: { userId },
        isCampusPastor,
        isGlobalPastor,
    } = useRole();
    const {
        data = [],
        isLoading,
        isFetchingNextPage,
        fetchNextPage,
        refetch,
        hasNextPage,
    } = useInfiniteData<ITicket, Omit<IDefaultQueryParams, 'userId'>>(
        {
            // limit: 100, // TODO: Restore after backend is fixed
            userId,
        },
        useGetTicketsQuery as any,
        '_id',
        !userId
    );

    return (
        <ErrorBoundary>
            <SectionListComponent
                data={data}
                field="createdAt"
                refetch={refetch}
                itemHeight={66.7}
                isLoading={isLoading}
                column={TicketListRow}
                hasNextPage={hasNextPage}
                extraProps={{ type: 'own' }}
                fetchNextPage={fetchNextPage}
                isFetchingNextPage={isFetchingNextPage}
                emptyMessage={
                    isCampusPastor || isGlobalPastor
                        ? 'There are no tickets issued sir'
                        : "Nothing here, let's keep it that way 😇"
                }
            />
        </ErrorBoundary>
    );
});

const MyTeamTicketsList: React.FC = memo(() => {
    const {
        user: { department },
        isCampusPastor,
        isGlobalPastor,
    } = useRole();

    const {
        data = [],
        isLoading,
        isFetchingNextPage,
        fetchNextPage,
        refetch,
        hasNextPage,
    } = useInfiniteData<ITicket, Omit<IDefaultQueryParams, 'userId'>>(
        {
            limit: 100, // TODO: Restore after backend is fixed
            departmentId: department?._id,
        },
        useGetTicketsQuery as any,
        '_id',
        !department?._id
    );
    return (
        <ErrorBoundary>
            <SectionListComponent
                data={data}
                field="createdAt"
                refetch={refetch}
                itemHeight={66.7}
                isLoading={isLoading}
                column={TicketListRow}
                hasNextPage={hasNextPage}
                extraProps={{ type: 'team' }}
                fetchNextPage={fetchNextPage}
                isFetchingNextPage={isFetchingNextPage}
                emptyMessage={
                    isCampusPastor || isGlobalPastor
                        ? 'There are no tickets issued sir'
                        : "Nothing here, let's keep it that way 😇"
                }
            />
        </ErrorBoundary>
    );
});

const LeadersTicketsList: React.FC = memo(() => {
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
    const data = ahodsTickets && hodsTickets ? [...ahodsTickets, ...hodsTickets] : [];

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

    const handleRefetch = () => {
        hodRefetch();
        ahodRefetch();
    };

    return (
        <FlatListComponent
            data={sortedData}
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

const CampusTickets: React.FC = memo(() => {
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

    useScreenFocus({
        onFocus: () => {
            if (!isUninitialized) refetch();
        },
    });

    return (
        <FlatListComponent
            data={sortedData}
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

const GroupTicketsList: React.FC = memo(() => {
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

    useScreenFocus({
        onFocus: () => {
            if (!isUninitialized) refetch();
        },
    });

    return (
        <FlatListComponent
            data={sortedData}
            columns={groupTicketsColumns}
            fetchMoreData={fetchMoreData}
            isLoading={isLoading || isFetching}
            refreshing={isLoading || isFetching}
            emptyMessage="There are no tickets issued"
            getItemLayout={(data, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
        />
    );
});

export { MyTicketsList, MyTeamTicketsList, LeadersTicketsList, CampusTickets, GroupTicketsList };
