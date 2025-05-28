import { Text } from '~/components/ui/text';
import React, { memo, useCallback, useMemo } from 'react';
import { TouchableOpacity, View } from 'react-native';
import AvatarComponent from '@components/atoms/avatar';
import StatusTag from '@components/atoms/status-tag';
import ErrorBoundary from '@components/composite/error-boundary';
import { AVATAR_FALLBACK_URL } from '@constants/index';
import useRole from '@hooks/role';
import { useGetPermissionsQuery } from '@store/services/permissions';
import { IDefaultQueryParams, IPermission } from '@store/types';
import Utils from '@utils/index';
import SectionListComponent from '~/components/composite/section-list';
import { router } from 'expo-router';
import useInfiniteData from '~/hooks/fetch-more-data/use-infinite-data';

export const PermissionSectionRow: React.FC<IPermission & { type: 'own' | 'team' | 'campus' | 'grouphead' }> = data => {
    const handlePress = () => {
        router.push({ pathname: '/permissions/permission-details', params: data as any });
    };

    const { requestor, departmentName, categoryName, status, campus, type, description } = data;

    return (
        <TouchableOpacity activeOpacity={0.6} onPress={handlePress} style={{ flex: 1 }} className="py-3">
            <ErrorBoundary>
                <View className="items-end justify-between flex-row gap-2">
                    <View className="items-center gap-4 flex-row flex-1">
                        <AvatarComponent alt="avatar" imageUrl={requestor?.pictureUrl || AVATAR_FALLBACK_URL} />
                        <View className="justify-between flex-1">
                            {type === 'own' && (
                                <>
                                    <Text className="font-bold">
                                        {`${Utils.capitalizeFirstChar(
                                            requestor?.firstName
                                        )} ${Utils.capitalizeFirstChar(requestor?.lastName)}`}
                                    </Text>
                                    <Text className="font-bold text-muted-foreground text-base truncate line-clamp-2">
                                        {description}
                                    </Text>
                                </>
                            )}
                            {type === 'team' && (
                                <>
                                    <Text className="font-bold">
                                        {`${Utils.capitalizeFirstChar(
                                            requestor?.firstName
                                        )} ${Utils.capitalizeFirstChar(requestor?.lastName)}`}
                                    </Text>
                                    <Text className="font-bold text-muted-foreground text-base">{categoryName}</Text>
                                </>
                            )}
                            {type === 'campus' && (
                                <>
                                    <Text className="font-bold">
                                        {`${Utils.capitalizeFirstChar(
                                            requestor?.firstName
                                        )} ${Utils.capitalizeFirstChar(requestor?.lastName)}`}
                                    </Text>
                                    <Text className="font-bold text-base">{departmentName}</Text>
                                    <Text className="font-bold text-muted-foreground text-base">{categoryName}</Text>
                                </>
                            )}

                            {type === 'grouphead' && (
                                <>
                                    <Text className="font-bold">
                                        {`${Utils.capitalizeFirstChar(
                                            requestor?.firstName
                                        )} ${Utils.capitalizeFirstChar(requestor?.lastName)}`}
                                    </Text>
                                    <Text className="font-bold text-base">{campus.campusName ?? ''}</Text>
                                    <Text className="text-base">{departmentName}</Text>
                                    <Text className="text-base text-muted-foreground">{categoryName}</Text>
                                </>
                            )}
                        </View>
                    </View>
                    <StatusTag>{status}</StatusTag>
                </View>
            </ErrorBoundary>
        </TouchableOpacity>
    );
};

interface IPermissionListRowProps extends IPermission {
    screen?: { name: string; value: string } | undefined;
    type: 'own' | 'team' | 'campus' | 'grouphead';
    '0'?: string;
    '1'?: IPermission[];
}

export const PermissionListRow: React.FC<IPermissionListRowProps> = memo(props => {
    const { type, screen } = props;

    return (
        <ErrorBoundary>
            {props[1]?.map((elm, index) => {
                if (!elm) {
                    return;
                }

                const handlePress = () => {
                    router.push({ pathname: '/permissions/permission-details', params: { ...elm, screen } as any });
                };

                const { requestor, departmentName, categoryName, description, status, campus } = elm;

                return (
                    <TouchableOpacity key={index} activeOpacity={0.6} onPress={handlePress} style={{ flex: 1 }}>
                        <View className="py-2 items-end justify-between flex-row">
                            <View className="items-center gap-4 flex-row">
                                <AvatarComponent alt="avatar" imageUrl={requestor?.pictureUrl || AVATAR_FALLBACK_URL} />
                                <View className="justify-between">
                                    {type === 'own' && (
                                        <>
                                            <Text className="font-bold text-muted-foreground">{categoryName}</Text>
                                            <Text className="text-base">{description}</Text>
                                        </>
                                    )}
                                    {type === 'team' && (
                                        <>
                                            <Text className="font-bold">
                                                {`${Utils.capitalizeFirstChar(
                                                    requestor?.firstName
                                                )} ${Utils.capitalizeFirstChar(requestor?.lastName)}`}
                                            </Text>
                                            <Text className="font-bold text-muted-foreground text-base">
                                                {categoryName}
                                            </Text>
                                        </>
                                    )}
                                    {type === 'campus' && (
                                        <>
                                            <Text className="font-bold">
                                                {`${Utils.capitalizeFirstChar(
                                                    requestor?.firstName
                                                )} ${Utils.capitalizeFirstChar(requestor?.lastName)}`}
                                            </Text>
                                            <Text className="font-bold text-base">{departmentName}</Text>
                                            <Text className="font-bold text-muted-foreground text-base">
                                                {categoryName}
                                            </Text>
                                        </>
                                    )}

                                    {type === 'grouphead' && (
                                        <>
                                            <Text className="font-bold">
                                                {`${Utils.capitalizeFirstChar(
                                                    requestor?.firstName
                                                )} ${Utils.capitalizeFirstChar(requestor?.lastName)}`}
                                            </Text>
                                            <Text className="font-bold text-base">{campus.campusName ?? ''}</Text>
                                            <Text className="text-base">{departmentName}</Text>
                                            <Text className="text-base text-muted-foreground">{categoryName}</Text>
                                        </>
                                    )}
                                </View>
                            </View>
                            <StatusTag>{status}</StatusTag>
                        </View>
                    </TouchableOpacity>
                );
            })}
        </ErrorBoundary>
    );
});

const MyPermissionsList: React.FC = memo(() => {
    const {
        user: { userId },
    } = useRole();

    const {
        data = [],
        isLoading,
        isFetchingNextPage,
        fetchNextPage,
        refetch,
        hasNextPage,
    } = useInfiniteData<IPermission, Omit<IDefaultQueryParams, 'userId'>>(
        {
            limit: 20, // TODO: Restore after backend is fixed
            requestor: userId,
        },
        useGetPermissionsQuery as any,
        '_id',
        !userId
    );

    return (
        <ErrorBoundary>
            <SectionListComponent
                data={data}
                field="createdAt"
                itemHeight={66.7}
                refetch={refetch}
                isLoading={isLoading}
                hasNextPage={hasNextPage}
                extraProps={{ type: 'own' }}
                column={PermissionSectionRow}
                fetchNextPage={fetchNextPage}
                isFetchingNextPage={isFetchingNextPage}
            />
        </ErrorBoundary>
    );
});

const TeamPermissionsList: React.FC = memo(() => {
    const currentUser = useRole();
    const _id = currentUser?.user?.department?._id;

    const {
        data = [],
        isLoading,
        isFetchingNextPage,
        fetchNextPage,
        refetch,
        hasNextPage,
    } = useInfiniteData<IPermission, Omit<IDefaultQueryParams, 'userId'>>(
        {
            limit: 20, // TODO: Restore after backend is fixed
            departmentId: _id,
        },
        useGetPermissionsQuery as any,
        '_id',
        !_id
    );

    return (
        <ErrorBoundary>
            <SectionListComponent
                data={data}
                field="createdAt"
                refetch={refetch}
                itemHeight={66.7}
                isLoading={isLoading}
                hasNextPage={hasNextPage}
                extraProps={{ type: 'team' }}
                column={PermissionSectionRow}
                fetchNextPage={fetchNextPage}
                isFetchingNextPage={isFetchingNextPage}
            />
        </ErrorBoundary>
    );
});

const LeadersPermissionsList: React.FC = memo(() => {
    const {
        leaderRoleIds,
        user: { campus },
    } = useRole();

    const {
        data: hodsPermissions = [],
        isLoading: hodLoading,
        isFetchingNextPage: hodIsFetching,
        fetchNextPage: hodFetchNextPage,
        refetch: hodRefetch,
        hasNextPage: hodHasNextPage,
    } = useInfiniteData<IPermission, Omit<IDefaultQueryParams, 'userId'>>(
        {
            limit: 20, // TODO: Restore after backend is fixed
            campusId: campus?._id,
            roleId: leaderRoleIds && leaderRoleIds[0],
        },
        useGetPermissionsQuery as any,
        '_id',
        !leaderRoleIds?.length
    );

    const {
        data: ahodsPermissions = [],
        isLoading: ahodLoading,
        isFetchingNextPage: ahodIsFetching,
        fetchNextPage: ahodFetchNextPage,
        refetch: ahodRefetch,
        hasNextPage: ahodHasNextPage,
    } = useInfiniteData<IPermission, Omit<IDefaultQueryParams, 'userId'>>(
        {
            limit: 20, // TODO: Restore after backend is fixed
            campusId: campus?._id,
            roleId: leaderRoleIds && leaderRoleIds[1],
        },
        useGetPermissionsQuery as any,
        '_id',
        !leaderRoleIds?.length
    );

    const isLoading = hodLoading || ahodLoading;
    const isFetching = hodIsFetching || ahodIsFetching;
    const hasNextPage = hodHasNextPage || ahodHasNextPage;
    const refetch = hodRefetch || ahodRefetch;

    const fetchNextPage = useCallback(() => {
        hodFetchNextPage();
        ahodFetchNextPage();
    }, []);

    const data = useMemo(() => ahodsPermissions.concat(hodsPermissions), [ahodsPermissions, hodsPermissions]);

    return (
        <ErrorBoundary>
            <SectionListComponent
                data={data}
                field="createdAt"
                refetch={refetch}
                itemHeight={66.7}
                isLoading={isLoading}
                hasNextPage={hasNextPage}
                extraProps={{ type: 'team' }}
                column={PermissionSectionRow}
                fetchNextPage={fetchNextPage}
                isFetchingNextPage={isFetching}
            />
        </ErrorBoundary>
    );
});

const CampusPermissions: React.FC = memo(() => {
    const {
        user: {
            campus: { _id },
        },
    } = useRole();

    const {
        data = [],
        isLoading,
        isFetchingNextPage,
        fetchNextPage,
        refetch,
        hasNextPage,
    } = useInfiniteData<IPermission, Omit<IDefaultQueryParams, 'userId'>>(
        {
            limit: 20, // TODO: Restore after backend is fixed
            campusId: _id,
        },
        useGetPermissionsQuery as any,
        '_id',
        !_id
    );

    return (
        <ErrorBoundary>
            <SectionListComponent
                data={data}
                field="createdAt"
                refetch={refetch}
                itemHeight={66.7}
                isLoading={isLoading}
                hasNextPage={hasNextPage}
                column={PermissionSectionRow}
                fetchNextPage={fetchNextPage}
                extraProps={{ type: 'campus' }}
                isFetchingNextPage={isFetchingNextPage}
            />
        </ErrorBoundary>
    );
});

const GroupPermissionsList: React.FC = memo(() => {
    const {
        data = [],
        isLoading,
        isFetchingNextPage,
        fetchNextPage,
        refetch,
        hasNextPage,
    } = useInfiniteData<IPermission, Omit<IDefaultQueryParams, 'userId'>>(
        {
            limit: 20, // TODO: Restore after backend is fixed
            isGH: true,
        },
        useGetPermissionsQuery as any,
        '_id'
    );

    return (
        <ErrorBoundary>
            <SectionListComponent
                data={data}
                field="createdAt"
                refetch={refetch}
                itemHeight={66.7}
                isLoading={isLoading}
                hasNextPage={hasNextPage}
                column={PermissionSectionRow}
                fetchNextPage={fetchNextPage}
                extraProps={{ type: 'grouphead' }}
                isFetchingNextPage={isFetchingNextPage}
            />
        </ErrorBoundary>
    );
});

export { MyPermissionsList, TeamPermissionsList, LeadersPermissionsList, CampusPermissions, GroupPermissionsList };
