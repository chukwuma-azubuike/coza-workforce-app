import { Text } from '~/components/ui/text';
import React from 'react';

import AvatarComponent from '@components/atoms/avatar';
import useRole from '@hooks/role';
import { TouchableOpacity, View } from 'react-native';
import { AVATAR_FALLBACK_URL } from '@constants/index';

import { useGetLatestServiceQuery } from '@store/services/services';
import { STATUS_COLORS } from '@constants/notification-types';
import { router } from 'expo-router';
import ModeToggle from '~/components/ModeToggle';
import { appSelectors } from '~/store/actions/app';
import { useAppSelector } from '~/store/hooks';

const TopNav: React.FC = () => {
    const { user } = useRole();
    const mode = useAppSelector(store => appSelectors.selectMode(store));

    const handlePress = () => router.push('/profile');

    const { data, isLoading } = useGetLatestServiceQuery(user?.campus?._id as string, {
        skip: !user,
        refetchOnMountOrArgChange: true,
    });

    return (
        <View className="px-2 w-full z-20 items-center justify-between flex-row bg-background">
            <ModeToggle />
            {mode === 'ops' ? (
                <Text className="text-xl font-light text-center justify-center text-muted-foreground px-6 w-maxmx mx-auto">
                    {isLoading ? 'Searching for service...' : data?.name || 'No service today'}
                </Text>
            ) : (
                <Text style={{ fontFamily: 'Angelos', fontSize: 24, lineHeight: 38 }} className="text-2xl">
                    Roast
                </Text>
            )}
            <View className="w-[76px] justify-end flex-row">
                <TouchableOpacity onPress={handlePress} activeOpacity={0.6}>
                    <AvatarComponent
                        badge
                        alt="profile-pic"
                        className="w-10 h-10"
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
