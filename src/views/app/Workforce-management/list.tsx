import { useIsFocused, useNavigation } from '@react-navigation/native';
import { HStack, Text, VStack } from 'native-base';
import React, { memo } from 'react';
import { TouchableNativeFeedback } from 'react-native';
import AvatarComponent from '../../../components/atoms/avatar';
import StatusTag from '../../../components/atoms/status-tag';
import FlatListComponent, { IFlatListColumn } from '../../../components/composite/flat-list';
import { THEME_CONFIG } from '../../../config/appConfig';
import { AVATAR_FALLBACK_URL } from '../../../constants';
import useRole from '../../../hooks/role';
import useAppColorMode from '../../../hooks/theme/colorMode';
import { useGetUsersQuery } from '../../../store/services/account';
import { IUser } from '../../../store/types';
import Utils from '../../../utils';

const UserListRow: React.FC<IUser> = user => {
    const navigation = useNavigation();
    const { isLightMode } = useAppColorMode();

    const handlePress = () => {
        navigation.navigate('User Profile' as never, user as never);
    };

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
            style={{ paddingHorizontal: 20 }}
        >
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
        </TouchableNativeFeedback>
    );
};

interface CampusUserList {
    '0'?: string;
    '1'?: IUser[];
}

const CampusListRow: React.FC<CampusUserList> = user => {
    const navigation = useNavigation();
    const { leaderRoleIds } = useRole();
    const { isLightMode } = useAppColorMode();

    return (
        <>
            {user[1]?.map((user, index) => {
                const handlePress = () => {
                    navigation.navigate('User Profile' as never, user as never);
                };

                const isHOD = leaderRoleIds && user.roleId === leaderRoleIds[1];
                const isAHOD = leaderRoleIds && user.roleId === leaderRoleIds[0];

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
                    </TouchableNativeFeedback>
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
