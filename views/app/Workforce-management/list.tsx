import { Text } from "~/components/ui/text";
import { useIsFocused, useNavigation } from '@react-navigation/native';
import React, { memo } from 'react';
import { TouchableOpacity, View } from 'react-native';
import AvatarComponent from '@components/atoms/avatar';
import StatusTag from '@components/atoms/status-tag';
import FlatListComponent, { IFlatListColumn } from '@components/composite/flat-list';
import { AVATAR_FALLBACK_URL } from '@constants/index';
import useRole from '@hooks/role';
import { useGetUsersQuery } from '@store/services/account';
import { IUser } from '@store/types';
import Utils from '@utils/index';
import TextComponent from '@components/text';
import VStackComponent from '@components/layout/v-stack';
import HStackComponent from '@components/layout/h-stack';
import ViewWrapper from '@components/layout/viewWrapper';

const UserListRow: React.FC<IUser> = memo(user => {
    const navigation = useNavigation();

    const handlePress = () => {
        navigation.navigate('User Profile' as never, user as never);
    };

    return (
        <TouchableOpacity delayPressIn={0} activeOpacity={0.6} onPress={handlePress} accessibilityRole="button">
            <View className="p-2">
                <View space={6} className="items-center">
                    <AvatarComponent imageUrl={user?.pictureUrl || AVATAR_FALLBACK_URL} />
                    <View>
                        <Text className="font-bold">
                            {Utils.capitalizeFirstChar(user?.firstName)} {Utils.capitalizeFirstChar(user?.lastName)}
                        </Text>
                        <Text fontSize="sm">{user?.email}</Text>
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
    const navigation = useNavigation();
    const { leaderRoleIds } = useRole();

    return (
        <>
            {user[1]?.map((user, index) => {
                const handlePress = () => {
                    navigation.navigate('User Profile' as never, user as never);
                };

                const isHOD = leaderRoleIds && user.roleId === leaderRoleIds[1];
                const isAHOD = leaderRoleIds && user.roleId === leaderRoleIds[0];

                return (
                    <TouchableOpacity
                        key={index}
                        disabled={false}
                        delayPressIn={0}
                        activeOpacity={0.6}
                        onPress={handlePress}
                        accessibilityRole="button"
                    >
                        <View className="p-2 py-6">
                            <View space={6} className="items-center">
                                <AvatarComponent size="sm" imageUrl={user?.pictureUrl || AVATAR_FALLBACK_URL} />
                                <View space={2}>
                                    <Text className="font-bold">
                                        {Utils.capitalizeFirstChar(user?.firstName)}{' '}
                                        {Utils.capitalizeFirstChar(user?.lastName)}
                                    </Text>
                                    <Text size="sm">{user?.email}</Text>
                                </View>
                            </View>
                            {(isHOD || isAHOD) && (
                                <StatusTag capitalise={false} style={{ marginRight: 8 }}>
                                    {isHOD ? 'HOD' : isAHOD ? 'AHOD' : ('' as any)}
                                </StatusTag>
                            )}
                            <StatusTag>{user?.status}</StatusTag>
                        </View>
                    </TouchableOpacity>
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

    const isScreenFocused = useIsFocused();

    const { data, isLoading, isFetching } = useGetUsersQuery(
        { departmentId: department._id },
        { skip: !isScreenFocused, refetchOnMountOrArgChange: true }
    );

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

    const isScreenFocused = useIsFocused();

    const { data, isLoading, isFetching, isUninitialized, refetch } = useGetUsersQuery(
        { departmentId },
        { skip: !isScreenFocused, refetchOnMountOrArgChange: true }
    );
    const isRefreshing = isLoading || isFetching;

    const sortedGroupedData = React.useMemo(
        () => data && Utils.groupListByKey(Utils.sortStringAscending(data, 'firstName'), 'departmentName'),
        [data]
    );

    const refresh = () => {
        !isUninitialized && refetch();
    };

    return (
        <ViewWrapper scroll onRefresh={refresh} refreshing={isRefreshing}>
            <FlatListComponent
                showHeader={false}
                refreshing={isFetching}
                style={{ marginTop: 16 }}
                columns={departmentColumns}
                data={sortedGroupedData || []}
                isLoading={isLoading || isFetching}
            />
        </ViewWrapper>
    );
});

export { MyTeam, Department };
