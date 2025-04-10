import React from 'react';
import AvatarComponent from '@components/atoms/avatar';

import { THEME_CONFIG } from '@config/appConfig';
import useRole from '@hooks/role';
import useAppColorMode from '@hooks/theme/colorMode';
import { Linking, TouchableOpacity, View } from 'react-native';
import { AVATAR_FALLBACK_URL } from '@constants/index';
import { useGetLatestServiceQuery } from '@store/services/services';

import { STATUS_COLORS } from '@constants/notification-types';
import { Text } from '~/components/ui/text';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const TopNav: React.FC = () => {
    const handleSupportPress = () => {
        Linking.openURL(`mailto:${process.env.SUPPORT_EMAIL}`);
    };

    const handlePress = () => router.push('/(stacks)/profile');

    const { user } = useRole();
    const { isLightMode } = useAppColorMode();

    const { data, isError, isLoading } = useGetLatestServiceQuery(user?.campus?._id as string, {
        skip: !user,
        refetchOnMountOrArgChange: true,
    });

    return (
        <View className="px-4 w-full z-20 items-center bg-background justify-between flex-row">
            <TouchableOpacity onPress={handlePress} activeOpacity={0.6}>
                <AvatarComponent
                    badge
                    alt="profile-pic"
                    lastName={user?.lastName}
                    firstName={user?.firstName}
                    badgeColor={STATUS_COLORS[user?.status]}
                    imageUrl={user.pictureUrl ?? AVATAR_FALLBACK_URL}
                />
            </TouchableOpacity>
            <Text className="text-xl font-light text-center justify-center text-muted-foreground">
                {isLoading ? 'Searching for service...' : !isError ? data?.name : 'No service today'}
            </Text>
            {/* <TouchableOpacity onPress={handleNotificationPress} activeOpacity={0.6}>
                <Ionicons
                    size={16}
                    type="ionicon"
                    borderRadius={10}
                    name="notifications"
                    underlayColor="white"
                    iconStyle={{ fontSize: 35 }}
                    color={isLightMode ? THEME_CONFIG.gray : THEME_CONFIG.lightGray}
                />
            </TouchableOpacity> */}
            <TouchableOpacity onPress={handleSupportPress} activeOpacity={0.6} className="w-12">
                <Ionicons
                    size={44}
                    type="Entypo"
                    name='help-circle'
                    borderRadius={10}
                    underlayColor="white"
                    iconStyle={{ fontSize: 36, marginRight: -3 }}
                    color={isLightMode ? THEME_CONFIG.gray : THEME_CONFIG.lightGray}
                />
            </TouchableOpacity>
        </View>
    );
};

export default React.memo(TopNav);
