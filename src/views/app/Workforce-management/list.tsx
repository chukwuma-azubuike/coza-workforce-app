import { useIsFocused, useNavigation } from '@react-navigation/native';
import { HStack, Text, VStack } from 'native-base';
import React, { memo } from 'react';
import { TouchableOpacity } from 'react-native';
import AvatarComponent from '@components/atoms/avatar';
import StatusTag from '@components/atoms/status-tag';
import FlatListComponent, { IFlatListColumn } from '@components/composite/flat-list';
import { AVATAR_FALLBACK_URL } from '@constants';
import useRole from '@hooks/role';
import { useGetUsersQuery } from '@store/services/account';
import { IUser } from '@store/types';
import Utils from '@utils';

const UserListRow: React.FC<IUser> = user => {
    const navigation = useNavigation();

    const handlePress = () => {
        navigation.navigate('User Profile' as never, user as never);
    };

    return (
        <TouchableOpacity delayPressIn={0} activeOpacity={0.6} onPress={handlePress} accessibilityRole="button">
            <HStack p={2} flex={1} w="full" alignItems="center" justifyContent="space-between">
                <HStack space={3} alignItems="center">
                    <AvatarComponent imageUrl={user?.pictureUrl || AVATAR_FALLBACK_URL} />
                    <VStack justifyContent="space-between">
                        <Text bold>
                            {Utils.capitalizeFirstChar(user?.firstName)} {Utils.capitalizeFirstChar(user?.lastName)}
                        </Text>
                        <Text fontSize="sm" color="gray.400">
                            {Utils.truncateString(user?.email)}
                        </Text>
                    </VStack>
                </HStack>
                <StatusTag>{user?.status || 'ACTIVE'}</StatusTag>
            </HStack>
        </TouchableOpacity>
    );
};

interface CampusUserList {
    '0'?: string;
    '1'?: IUser[];
}

const CampusListRow: React.FC<CampusUserList> = user => {
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
                        <HStack p={2} flex={1} w="full" alignItems="center" justifyContent="space-between">
                            <HStack space={3} alignItems="center">
                                <AvatarComponent imageUrl={user?.pictureUrl || AVATAR_FALLBACK_URL} />
                                <VStack justifyContent="space-between">
                                    <Text bold>
                                        {Utils.capitalizeFirstChar(user?.firstName)}{' '}
                                        {Utils.capitalizeFirstChar(user?.lastName)}
                                    </Text>
                                    <Text fontSize="sm" color="gray.400">
                                        {Utils.truncateString(user?.email)}
                                    </Text>
                                </VStack>
                            </HStack>
                            <StatusTag>{isHOD ? 'HOD' : isAHOD ? 'AHOD' : user?.status || 'ACTIVE'}</StatusTag>
                        </HStack>
                    </TouchableOpacity>
                );
            })}
        </>
    );
};

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

    const { data, isLoading, isFetching } = useGetUsersQuery(
        { departmentId },
        { skip: !isScreenFocused, refetchOnMountOrArgChange: true }
    );

    const sortedGroupedData = React.useMemo(
        () => data && Utils.groupListByKey(Utils.sortStringAscending(data, 'firstName'), 'departmentName'),
        [data]
    );

    return (
        <FlatListComponent
            showHeader={false}
            refreshing={isFetching}
            columns={departmentColumns}
            data={sortedGroupedData || []}
            isLoading={isLoading || isFetching}
        />
    );
});

export { MyTeam, Department };
