import { Text } from '~/components/ui/text';
import React from 'react';

import AvatarComponent from '@components/atoms/avatar';
import useRole from '@hooks/role';
import { TouchableOpacity, View } from 'react-native';
import { AVATAR_FALLBACK_URL } from '@constants/index';

import { useGetLatestServiceQuery } from '@store/services/services';
import { STATUS_COLORS } from '@constants/notification-types';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ModeToggle from '~/components/ModeToggle';
import { appSelectors } from '~/store/actions/app';
import { useAppSelector } from '~/store/hooks';
import Logo from './atoms/logo';
import { useColorScheme } from '~/lib/useColorScheme';
import { THEME_CONFIG } from '~/config/appConfig';
import useUnreadNotifications from '~/hooks/push-notifications/useUnreadNotifications';

const TopNav: React.FC = () => {
    const { user, isAlphaTester } = useRole();
    const mode = useAppSelector(store => appSelectors.selectMode(store));
    const { isDarkColorScheme } = useColorScheme();
    const { unreadCount } = useUnreadNotifications();

    const iconColor = isDarkColorScheme ? THEME_CONFIG.lightGray : THEME_CONFIG.black;

    const handlePress = () => router.push('/profile');
    const handleNotificationsPress = () => router.push('/notifications');

    const { data, isLoading } = useGetLatestServiceQuery(user?.campus?._id as string, {
        skip: !user,
        refetchOnMountOrArgChange: true,
    });

    return (
        <View className="px-2 w-full h-14 z-20 items-center justify-between flex-row bg-background">
            <View className="min-w-[36px] flex-1">
                {/* Suspend toggle until Roast is approved for release */}
                {isAlphaTester ? (
                    <ModeToggle />
                ) : (
                    <View className="ml-1">
                        <Logo size={36} />
                    </View>
                )}
            </View>
            <View className="min-w-[40%] flex-1 items-center">
                {mode === 'ops' ? (
                    <Text className="text-xl font-light text-center justify-center text-muted-foreground w-full mx-auto">
                        {isLoading ? 'Searching for service...' : data?.name || 'No service today'}
                    </Text>
                ) : (
                    <View className="pt-3">
                        <Text style={{ fontFamily: 'Angelos', fontSize: 24, lineHeight: 38 }} className="text-2xl">
                            Roast
                        </Text>
                    </View>
                )}
            </View>
            <View className="min-w-[36px] flex-1 justify-end flex-row items-center gap-3">
                <TouchableOpacity
                    activeOpacity={0.6}
                    onPress={handleNotificationsPress}
                    className="w-9 h-9 items-center justify-center rounded-full"
                >
                    <Ionicons name="notifications-outline" size={22} color={iconColor} />
                    {unreadCount > 0 && (
                        // A count, not a dot: "you have something" is not actionable, and
                        // the number is what tells a worker whether it can wait. Capped so a
                        // long backlog cannot push the badge past the icon.
                        <View className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-destructive items-center justify-center">
                            <Text className="!text-[10px] font-bold leading-none text-white">
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>

                <TouchableOpacity onPress={handlePress} activeOpacity={0.6}>
                    <AvatarComponent
                        badge
                        alt="profile-pic"
                        className="w-6 h-6"
                        lastName={user?.lastName}
                        firstName={user?.firstName}
                        badgeColor={STATUS_COLORS[user?.status]}
                        imageUrl={user.pictureUrl ?? AVATAR_FALLBACK_URL}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default React.memo(TopNav);
