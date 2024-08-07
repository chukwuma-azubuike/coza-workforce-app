import { useNavigation } from '@react-navigation/native';
import uniqBy from 'lodash/uniqBy';
import React, { memo, useMemo } from 'react';
import { TouchableOpacity } from 'react-native';
import AvatarComponent from '@components/atoms/avatar';
import StatusTag from '@components/atoms/status-tag';
import ErrorBoundary from '@components/composite/error-boundary';
import FlatListComponent, { IFlatListColumn } from '@components/composite/flat-list';
import { AVATAR_FALLBACK_URL } from '@constants/index';
import useFetchMoreData from '@hooks/fetch-more-data';
import useRole from '@hooks/role';
import { useGetPermissionsQuery } from '@store/services/permissions';
import { IPermission } from '@store/types';
import Utils from '@utils/index';
import useScreenFocus from '@hooks/focus';
import HStackComponent from '@components/layout/h-stack';
import VStackComponent from '@components/layout/v-stack';
import TextComponent from '@components/text';

interface IPermissionListRowProps extends IPermission {
    screen?: { name: string; value: string } | undefined;
    type: 'own' | 'team' | 'campus';
    '0'?: string;
    '1'?: IPermission[];
}

export const PermissionListRow: React.FC<IPermissionListRowProps> = memo(props => {
    const navigation = useNavigation();

    const { type, screen } = props;

    return (
        <ErrorBoundary>
            {props[1]?.map((elm, index) => {
                if (!elm) {
                    return;
                }

                const handlePress = () => {
                    navigation.navigate('Permission Details' as never, { ...elm, screen } as never);
                };

                const { requestor, departmentName, categoryName, description, status } = elm;

                return (
                    <TouchableOpacity activeOpacity={0.6} onPress={handlePress} style={{ flex: 1 }}>
                        <HStackComponent
                            style={{ paddingVertical: 12, alignItems: 'center', justifyContent: 'space-between' }}
                        >
                            <HStackComponent space={6} style={{ alignItems: 'center' }}>
                                <AvatarComponent imageUrl={requestor?.pictureUrl || AVATAR_FALLBACK_URL} />
                                <VStackComponent style={{ justifyContent: 'space-between' }}>
                                    {type === 'own' && (
                                        <>
                                            <TextComponent bold>{categoryName}</TextComponent>
                                            <TextComponent size="sm">{description}</TextComponent>
                                        </>
                                    )}
                                    {type === 'team' && (
                                        <>
                                            <TextComponent bold>
                                                {`${Utils.capitalizeFirstChar(
                                                    requestor?.firstName
                                                )} ${Utils.capitalizeFirstChar(requestor?.lastName)}`}
                                            </TextComponent>
                                            <TextComponent bold size="sm">
                                                {categoryName}
                                            </TextComponent>
                                        </>
                                    )}
                                    {type === 'campus' && (
                                        <>
                                            <TextComponent bold>
                                                {`${Utils.capitalizeFirstChar(
                                                    requestor?.firstName
                                                )} ${Utils.capitalizeFirstChar(requestor?.lastName)}`}
                                            </TextComponent>
                                            <TextComponent bold size="sm">
                                                {departmentName}
                                            </TextComponent>
                                            <TextComponent bold size="sm">
                                                {categoryName}
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
        </ErrorBoundary>
    );
});

const MyPermissionsList: React.FC<{ updatedListItem: IPermission; reload: boolean }> = memo(
    ({ updatedListItem, reload }) => {
        const myPermissionsColumns: IFlatListColumn[] = [
            {
                dataIndex: 'dateCreated',
                render: (_: IPermission, key) => <PermissionListRow type="own" {..._} key={key} />,
            },
        ];

        const {
            user: { userId },
        } = useRole();

        const [page, setPage] = React.useState<number>(1);

        const { data, isLoading, isFetching, isSuccess, refetch, isUninitialized } = useGetPermissionsQuery(
            { requestor: userId, limit: 20, page },
            {
                refetchOnMountOrArgChange: true,
            }
        );

        const { data: moreData } = useFetchMoreData({ uniqKey: '_id', dataSet: data, isSuccess });

        const fetchMoreData = () => {
            if (!isFetching && !isLoading) {
                if (data?.length) {
                    setPage(prev => prev + 1);
                } else {
                    setPage(prev => prev - 1);
                }
            }
        };

        const memoizedData = useMemo(
            () =>
                Utils.groupListByKey(
                    uniqBy(
                        [updatedListItem?.requestor?._id === userId ? updatedListItem : null, ...(moreData || [])],
                        '_id'
                    ),
                    'createdAt'
                ),
            [moreData]
        );

        useScreenFocus({
            onFocus: () => {
                if (reload && !isUninitialized) refetch();
            },
        });

        const ITEM_HEIGHT = 60;

        return (
            <ErrorBoundary>
                {/* <PermissionStats total={5} pending={1} declined={0} approved={4} /> */}
                <FlatListComponent
                    data={memoizedData}
                    refreshing={isFetching}
                    fetchMoreData={fetchMoreData}
                    columns={myPermissionsColumns}
                    isLoading={isLoading || isFetching}
                    getItemLayout={(data, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
                />
            </ErrorBoundary>
        );
    }
);

const MyTeamPermissionsList: React.FC<{ updatedListItem: IPermission; reload: boolean }> = memo(
    ({ updatedListItem, reload }) => {
        const teamPermissionsColumns: IFlatListColumn[] = [
            {
                dataIndex: 'dateCreated',
                render: (_: IPermission, key) => <PermissionListRow type="team" {..._} key={key} />,
            },
        ];

        const {
            user: {
                department: { _id },
            },
        } = useRole();

        const [page, setPage] = React.useState<number>(1);

        const { data, isLoading, isFetching, isSuccess, refetch, isUninitialized } = useGetPermissionsQuery(
            { departmentId: _id, limit: 20, page },
            {
                refetchOnMountOrArgChange: true,
            }
        );

        const { data: moreData } = useFetchMoreData({ uniqKey: '_id', dataSet: data, isSuccess });

        const fetchMoreData = () => {
            if (!isFetching && !isLoading) {
                if (data?.length) {
                    setPage(prev => prev + 1);
                } else {
                    setPage(prev => prev - 1);
                }
            }
        };

        const memoizedData = useMemo(
            () =>
                Utils.groupListByKey(
                    Utils.sortByDate(
                        Utils.replaceArrayItemByNestedKey(moreData || [], updatedListItem, [
                            '_id',
                            updatedListItem?._id,
                        ]),
                        'createdAt'
                    ),
                    'createdAt'
                ),
            [updatedListItem?._id, moreData]
        );

        useScreenFocus({
            onFocus: () => {
                if (reload && !isUninitialized) refetch();
            },
        });

        const ITEM_HEIGHT = 60;

        return (
            <ErrorBoundary>
                <FlatListComponent
                    data={memoizedData}
                    refreshing={isFetching}
                    fetchMoreData={fetchMoreData}
                    columns={teamPermissionsColumns}
                    isLoading={isLoading || isFetching}
                    getItemLayout={(data, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
                />
            </ErrorBoundary>
        );
    }
);

const LeadersPermissionsList: React.FC<{ updatedListItem: IPermission }> = memo(({ updatedListItem }) => {
    const LeadersPermissionsColumns: IFlatListColumn[] = [
        {
            dataIndex: 'dateCreated',
            render: (_: IPermission, key) => <PermissionListRow type="campus" {..._} key={key} />,
        },
    ];

    const {
        leaderRoleIds,
        user: { campus },
    } = useRole();

    const [page, setPage] = React.useState<number>(1);

    const {
        refetch: hodRefetch,
        data: hodsPermissions,
        isLoading: hodLoading,
        isSuccess: hodIsSuccess,
        isFetching: hodIsFetching,
    } = useGetPermissionsQuery(
        {
            // page,
            // limit: 20,
            campusId: campus._id,
            roleId: leaderRoleIds && leaderRoleIds[0],
        },
        { refetchOnMountOrArgChange: true, skip: !leaderRoleIds?.length }
    );

    const {
        refetch: ahodRefetch,
        data: ahodsPermissions,
        isLoading: ahodLoading,
        isSuccess: ahodIsSuccess,
        isFetching: ahodIsFetching,
    } = useGetPermissionsQuery(
        {
            // page,
            // limit: 20,
            campusId: campus._id,
            roleId: leaderRoleIds && leaderRoleIds[1],
        },
        { refetchOnMountOrArgChange: true, skip: !leaderRoleIds?.length }
    );

    const isLoading = hodLoading || ahodLoading;
    const isSuccess = hodIsSuccess && ahodIsSuccess;
    const isFetching = hodIsFetching || ahodIsFetching;
    const data = hodsPermissions && ahodsPermissions ? [...ahodsPermissions, ...hodsPermissions] : [];

    // const { data: moreData } = useFetchMoreData({ uniqKey: '_id', dataSet: data, isSuccess });

    // const fetchMoreData = () => {
    //     if (!isFetching && !isLoading) {
    //         if (data?.length) {
    //             setPage(prev => prev + 1);
    //         } else {
    //             setPage(prev => prev - 1);
    //         }
    //     }
    // };

    const memoizedData = useMemo(
        () =>
            Utils.groupListByKey(
                Utils.replaceArrayItemByNestedKey(data || [], updatedListItem, ['_id', updatedListItem?._id]),
                'createdAt'
            ),
        [updatedListItem?._id, data]
    );

    const handleRefetch = () => {
        hodRefetch();
        ahodRefetch();
    };

    const ITEM_HEIGHT = 60;

    return (
        <ErrorBoundary>
            <FlatListComponent
                data={memoizedData}
                refreshing={isFetching}
                onRefresh={handleRefetch}
                // fetchMoreData={fetchMoreData}
                columns={LeadersPermissionsColumns}
                isLoading={isLoading || isFetching}
                getItemLayout={(data, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
            />
        </ErrorBoundary>
    );
});

const CampusPermissions: React.FC<{ updatedListItem: IPermission; reload: boolean }> = memo(
    ({ updatedListItem, reload }) => {
        const teamPermissionsColumns: IFlatListColumn[] = [
            {
                dataIndex: 'dateCreated',
                render: (_: IPermission, key) => <PermissionListRow type="campus" {..._} key={key} />,
            },
        ];

        const {
            user: {
                campus: { _id },
            },
        } = useRole();

        const [page, setPage] = React.useState<number>(1);

        const { data, isLoading, isFetching, isSuccess, refetch, isUninitialized } = useGetPermissionsQuery(
            {
                campusId: _id,
                limit: 20,
                page,
            },
            {
                refetchOnMountOrArgChange: true,
            }
        );

        const { data: moreData } = useFetchMoreData({ uniqKey: '_id', dataSet: data, isSuccess });

        const memoizedData = useMemo(() => Utils.groupListByKey(moreData, 'createdAt'), [moreData]);

        const fetchMoreData = () => {
            if (!isFetching && !isLoading) {
                if (data?.length) {
                    setPage(prev => prev + 1);
                } else {
                    setPage(prev => prev - 1);
                }
            }
        };

        useScreenFocus({
            onFocus: () => {
                if (reload && !isUninitialized) refetch();
            },
        });

        const ITEM_HEIGHT = 60;

        return (
            <ErrorBoundary>
                {/* <PermissionStats total={67} pending={17} declined={15} approved={35} /> */}
                <FlatListComponent
                    data={memoizedData}
                    refreshing={isFetching}
                    fetchMoreData={fetchMoreData}
                    columns={teamPermissionsColumns}
                    isLoading={isLoading || isFetching}
                    getItemLayout={(data, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
                />
            </ErrorBoundary>
        );
    }
);

export { MyPermissionsList, MyTeamPermissionsList, LeadersPermissionsList, CampusPermissions };
