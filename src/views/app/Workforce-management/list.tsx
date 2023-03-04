import { useIsFocused, useNavigation } from '@react-navigation/native';
import { HStack, Text, VStack } from 'native-base';
import React, { memo, useMemo } from 'react';
import { TouchableNativeFeedback } from 'react-native';
import AvatarComponent from '../../../components/atoms/avatar';
import StatusTag from '../../../components/atoms/status-tag';
import FlatListComponent, { IFlatListColumn } from '../../../components/composite/flat-list';
import { THEME_CONFIG } from '../../../config/appConfig';
import { AVATAR_FALLBACK_URL } from '../../../constants';
import useScreenFocus from '../../../hooks/focus';
import useRole from '../../../hooks/role';
import useAppColorMode from '../../../hooks/theme/colorMode';
import { useGetUsersQuery } from '../../../store/services/account';
import {} from '../../../store/services/tickets';
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
                            {Utils.capitalizeFirstChar(user?.department?.departmentName)}
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
    const { isLightMode } = useAppColorMode();

    return (
        <>
            {user[1]?.map((user, index) => {
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
                                        {Utils.capitalizeFirstChar(user?.department?.departmentName)}
                                    </Text>
                                </VStack>
                            </HStack>
                            <StatusTag>{user?.status || 'ACTIVE'}</StatusTag>
                        </HStack>
                    </TouchableNativeFeedback>
                );
            })}
        </>
    );
};

const MyTeam: React.FC = memo(() => {
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

    const { data, isLoading, error, refetch, isFetching } = useGetUsersQuery(
        { departmentId: department._id },
        { skip: !isScreenFocused }
    );

    useScreenFocus({ onFocus: refetch });

    return (
        <FlatListComponent
            data={data || []}
            onRefresh={refetch}
            columns={teamColumns}
            isLoading={isLoading || isFetching}
            refreshing={isLoading || isFetching}
        />
    );
});

const Campus: React.FC = memo(() => {
    const campusColumns: IFlatListColumn[] = [
        {
            dataIndex: 'createdAt',
            render: (_: IUser, key) => <CampusListRow {..._} key={key} />,
        },
    ];

    const {
        user: { campus },
    } = useRole();

    const isScreenFocused = useIsFocused();

    const { data, isLoading, error, refetch, isFetching } = useGetUsersQuery(
        { campusId: campus._id, limit: 200 },
        { skip: !isScreenFocused }
    );

    useScreenFocus({ onFocus: refetch });

    const memoizedData = useMemo(() => Utils.groupListByKey(data, 'departmentName'), [isLoading]);

    return (
        <FlatListComponent
            data={memoizedData}
            onRefresh={refetch}
            columns={campusColumns}
            isLoading={isLoading || isFetching}
            refreshing={isLoading || isFetching}
        />
    );
});

export { MyTeam, Campus };
