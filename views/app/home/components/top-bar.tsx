import React from 'react';
import { TouchableOpacity, View, useColorScheme } from 'react-native';
import { router } from 'expo-router';
import { Text } from '~/components/ui/text';
import AvatarComponent from '@components/atoms/avatar';
import { AVATAR_FALLBACK_URL } from '@constants/index';
import dayjs from 'dayjs';
import useRole from '~/hooks/role';
import ModeToggle from '~/components/ModeToggle';
import NotificationBell from '@components/composite/notification-bell';
import { cn } from '~/lib/utils';

interface ServicePillProps {
    name?: string;
    serviceTime?: string;
}

const ServicePill: React.FC<ServicePillProps> = ({ name, serviceTime }) => (
    <View className="flex-row items-center gap-1.5 h-8 px-3.5 rounded-full bg-secondary">
        <View className="w-1.5 h-1.5 rounded-full bg-green-500" />
        <Text className="text-sm font-semibold">
            {name ? name + ' • ' + dayjs(serviceTime).format('h:mm A') : 'No service today'}
        </Text>
    </View>
);

export interface HomeTopBarProps {
    pictureUrl?: string;
    firstName?: string;
    lastName?: string;
    serviceTime?: string;
    serviceName?: string;
}

const HomeTopBar: React.FC<HomeTopBarProps> = ({ pictureUrl, firstName, lastName, serviceTime, serviceName }) => {
    const scheme = useColorScheme();
    const { isAlphaTester } = useRole();
    const iconColor = scheme === 'dark' ? '#a1a1aa' : '#18181B';
    return (
        <View className="h-14 px-4 flex-row items-center justify-between bg-background border-b border-border">
            <View className="flex-1 items-start">
                <TouchableOpacity onPress={() => router.push('/profile')} activeOpacity={0.6}>
                    <AvatarComponent
                        alt="profile"
                        className="w-9 h-9"
                        firstName={firstName}
                        lastName={lastName}
                        imageUrl={pictureUrl ?? AVATAR_FALLBACK_URL}
                    />
                </TouchableOpacity>
            </View>
            <View className="items-center flex-1">
                <ServicePill name={serviceName} serviceTime={serviceTime} />
            </View>
            <View className="items-end flex-1">
                <View className={cn('flex-row gap-2 items-center', isAlphaTester && 'scale-90 -mr-4')}>
                    {isAlphaTester && <ModeToggle />}
                    <NotificationBell size={26} color={iconColor} />
                </View>
            </View>
        </View>
    );
};

export default React.memo(HomeTopBar);
