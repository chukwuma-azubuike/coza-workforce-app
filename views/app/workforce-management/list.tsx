import React, { memo } from 'react';
import { Text } from '~/components/ui/text';
import { TouchableOpacity, View } from 'react-native';
import AvatarComponent from '@components/atoms/avatar';
import StatusTag from '@components/atoms/status-tag';
import FlatListComponent, { IFlatListColumn } from '@components/composite/flat-list';
import { AVATAR_FALLBACK_URL } from '@constants/index';
import useRole from '@hooks/role';
import { useGetUsersQuery } from '@store/services/account';
import { IUser } from '@store/types';
import Utils from '@utils/index';
import ViewWrapper from '@components/layout/viewWrapper';
import { router } from 'expo-router';
import UserContextMenu from './components/user-context-menu';

const UserListRow: React.FC<IUser> = memo(user => {
    const handlePress = () => {
        router.push({ pathname: '/workforce-summary/user-profile', params: user as any });
    };

    return (
        <TouchableOpacity delayPressIn={0} activeOpacity={0.6} onPress={handlePress} accessibilityRole="button">
            <View className="p-2 flex-row">
                <View className="items-center gap-4">
                    <AvatarComponent alt="profile-pic" imageUrl={user?.pictureUrl || AVATAR_FALLBACK_URL} />
                    <View>
                        <Text className="font-bold">
                            {Utils.capitalizeFirstChar(user?.firstName)} {Utils.capitalizeFirstChar(user?.lastName)}
                        </Text>
                        <Text className="text-sm">{user?.email}</Text>
                    </View>
                </View>
                <StatusTag>{user?.status || 'ACTIVE'}</StatusTag>
            </View>
        </TouchableOpacity>
    );
});

interface CampusUserList {
    '0'?: string;
    '1'?: IUser[];
}

const CampusListRow: React.FC<CampusUserList> = memo(user => {
    const { leaderRoleIds } = useRole();

    return (
        <>
            {user[1]?.map((user, index) => {
                const handlePress = () => {
                    router.push({ pathname: '/workforce-summary/user-profile', params: user as any });
                };

                const isHOD = leaderRoleIds && user.roleId === leaderRoleIds[1];
                const isAHOD = leaderRoleIds && user.roleId === leaderRoleIds[0];

                return (
                    <UserContextMenu user={user}>
                        <TouchableOpacity
                            key={index}
                            disabled={false}
                            delayPressIn={0}
                            activeOpacity={0.6}
                            onPress={handlePress}
                            accessibilityRole="button"
                        >
                            <View className="py-3 flex-row w-full justify-between items-center gap-3">
                                <View className="items-center gap-2 flex-row flex-1">
                                    <AvatarComponent
                                        alt="profile-pic"
                                        imageUrl={user?.pictureUrl || AVATAR_FALLBACK_URL}
                                    />
                                    <View className="flex-1">
                                        <Text className="font-bold">
                                            {Utils.capitalizeFirstChar(user?.firstName)}{' '}
                                            {Utils.capitalizeFirstChar(user?.lastName)}
                                        </Text>
                                        <Text className="text-base text-muted-foreground">{user?.email}</Text>
                                    </View>
                                </View>
                                {(isHOD || isAHOD) && (
                                    <StatusTag capitalise={false}>
                                        {isHOD ? 'HOD' : isAHOD ? 'AHOD' : ('' as any)}
                                    </StatusTag>
                                )}
                                <StatusTag>{user?.status}</StatusTag>
                            </View>
                        </TouchableOpacity>
                    </UserContextMenu>
                );
            })}
        </>
    );
});

const MyTeam: React.FC<{ departmentId: string }> = memo(({ departmentId }) => {
    const teamColumns: IFlatListColumn[] = [
        {
            dataIndex: '_id',
            render: (_: IUser, key) => <UserListRow {..._} key={key} />,
        },
    ];

    const {
        user: { department },
    } = useRole();

    const { data, isLoading, isFetching } = useGetUsersQuery({ departmentId: department._id });

    return (
        <FlatListComponent
            data={data || []}
            columns={teamColumns}
            refreshing={isFetching}
            isLoading={isLoading || isFetching}
        />
    );
});

const Department: React.FC<{ departmentId: string }> = memo(({ departmentId }) => {
    const departmentColumns: IFlatListColumn[] = [
        {
            dataIndex: 'createdAt',
            render: (_: IUser, key) => <CampusListRow {..._} key={key} />,
        },
    ];

    const { data, isLoading, isFetching, isUninitialized, refetch } = useGetUsersQuery({ departmentId });
    const isRefreshing = isLoading || isFetching;

    const sortedGroupedData = React.useMemo(
        () => data && Utils.groupListByKey(Utils.sortStringAscending(data, 'firstName'), 'departmentName'),
        [data]
    );

    const refresh = () => {
        !isUninitialized && refetch();
    };

    return (
        <ViewWrapper onRefresh={refresh} refreshing={isRefreshing}>
            <FlatListComponent
                showHeader={false}
                refreshing={isFetching}
                columns={departmentColumns}
                data={sortedGroupedData || []}
                isLoading={isLoading || isFetching}
            />
        </ViewWrapper>
    );
});

export { MyTeam, Department };
