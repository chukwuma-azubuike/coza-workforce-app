import { Text } from '~/components/ui/text';
import React, { memo, useCallback, useMemo } from 'react';
import { TouchableOpacity, View } from 'react-native';
import AvatarComponent from '@components/atoms/avatar';
import StatusTag from '@components/atoms/status-tag';
import { AVATAR_FALLBACK_URL, AVATAR_GROUP_FALLBACK_URL } from '@constants/index';
import useRole from '@hooks/role';
import { useGetTicketsQuery } from '@store/services/tickets';
import { IDefaultQueryParams, ITicket } from '@store/types';
import Utils from '@utils/index';
import { router } from 'expo-router';
import SectionListComponent from '~/components/composite/section-list';
import ErrorBoundary from '~/components/composite/error-boundary';
import useInfiniteData from '~/hooks/fetch-more-data/use-infinite-data';

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
                <View className="items-center gap-4 flex-row flex-1">
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
            limit: 20, // TODO: Restore after backend is fixed
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
                itemHeight={77.3}
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
            limit: 20, // TODO: Restore after backend is fixed
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
                itemHeight={77.3}
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
    const {
        user: { campus },
        leaderRoleIds,
    } = useRole();

    const {
        data: hodsTickets = [],
        isLoading: hodLoading,
        isFetchingNextPage: hodIsFetching,
        fetchNextPage: hodFetchNextPage,
        refetch: hodRefetch,
        hasNextPage: hodHasNextPage,
    } = useInfiniteData<ITicket, Omit<IDefaultQueryParams, 'userId'>>(
        {
            limit: 20, // TODO: Restore after backend is fixed
            campusId: campus?._id,
            roleId: leaderRoleIds && leaderRoleIds[0],
        },
        useGetTicketsQuery as any,
        '_id',
        !leaderRoleIds?.length
    );

    const {
        data: ahodsTickets = [],
        isLoading: ahodLoading,
        isFetchingNextPage: ahodIsFetching,
        fetchNextPage: ahodFetchNextPage,
        refetch: ahodRefetch,
        hasNextPage: ahodHasNextPage,
    } = useInfiniteData<ITicket, Omit<IDefaultQueryParams, 'userId'>>(
        {
            limit: 20, // TODO: Restore after backend is fixed
            campusId: campus?._id,
            roleId: leaderRoleIds && leaderRoleIds[1],
        },
        useGetTicketsQuery as any,
        '_id',
        !leaderRoleIds?.length
    );

    const isLoading = hodLoading || ahodLoading;
    const isFetching = hodIsFetching || ahodIsFetching;

    const data = useMemo(
        () => (ahodsTickets && hodsTickets ? [...ahodsTickets, ...hodsTickets] : []),
        [ahodsTickets, hodsTickets]
    );

    const hasNextPage = hodHasNextPage || ahodHasNextPage;

    const handleRefetch = () => {
        hodRefetch();
        ahodRefetch();
    };

    const fetchNextPage = useCallback(() => {
        hodFetchNextPage();
        ahodFetchNextPage();
    }, []);

    return (
        <ErrorBoundary>
            <SectionListComponent
                data={data}
                field="createdAt"
                itemHeight={77.3}
                isLoading={isLoading}
                column={TicketListRow}
                refetch={handleRefetch}
                hasNextPage={hasNextPage}
                extraProps={{ type: 'team' }}
                fetchNextPage={fetchNextPage}
                isFetchingNextPage={isFetching}
                emptyMessage="There are no tickets issued"
            />
        </ErrorBoundary>
    );
});

const CampusTickets: React.FC = memo(() => {
    const {
        user: { campus },
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
            limit: 20, // TODO: Restore after backend is fixed
            campusId: campus?._id,
        },
        useGetTicketsQuery as any,
        '_id',
        !campus?._id
    );

    return (
        <ErrorBoundary>
            <SectionListComponent
                data={data}
                field="createdAt"
                itemHeight={77.3}
                isLoading={isLoading}
                column={TicketListRow}
                refetch={refetch}
                hasNextPage={hasNextPage}
                extraProps={{ type: 'campus' }}
                fetchNextPage={fetchNextPage}
                isFetchingNextPage={isFetchingNextPage}
                emptyMessage={
                    isCampusPastor || isGlobalPastor
                        ? 'There are no tickets issued'
                        : "Nothing here, let's keep it that way 😇"
                }
            />
        </ErrorBoundary>
    );
});

const GroupTicketsList: React.FC = memo(() => {
    const { data, isLoading, isFetchingNextPage, fetchNextPage, refetch, hasNextPage } = useInfiniteData<
        ITicket,
        Omit<IDefaultQueryParams, 'userId'>
    >(
        {
            limit: 20, // TODO: Restore after backend is fixed
            isGH: true,
        },
        useGetTicketsQuery as any,
        '_id'
    );

    return (
        <ErrorBoundary>
            <SectionListComponent
                data={data}
                field="createdAt"
                itemHeight={77.3}
                isLoading={isLoading}
                column={TicketListRow}
                refetch={refetch}
                hasNextPage={hasNextPage}
                extraProps={{ type: 'campus' }}
                fetchNextPage={fetchNextPage}
                isFetchingNextPage={isFetchingNextPage}
                emptyMessage="There are no tickets issued"
            />
        </ErrorBoundary>
    );
});

export { MyTicketsList, MyTeamTicketsList, LeadersTicketsList, CampusTickets, GroupTicketsList };
