import React from 'react';
import { TouchableOpacity, View, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Text } from '~/components/ui/text';
import AvatarComponent from '@components/atoms/avatar';
import { AVATAR_FALLBACK_URL } from '@constants/index';
import dayjs from 'dayjs';

interface ServicePillProps {
    name?: string;
    serviceTime?: string;
}

const ServicePill: React.FC<ServicePillProps> = ({ name, serviceTime }) => (
    <View className="flex-row items-center gap-1.5 h-8 px-3.5 rounded-full bg-secondary">
        <View className="w-1.5 h-1.5 rounded-full bg-primary" />
        <Text className="text-sm font-semibold text-primary">
            {name ? name + " • " + dayjs(serviceTime).format('h:mm A') : 'No service today'}
        </Text>
    </View>
);
``
interface GHTopBarProps {
    pictureUrl?: string;
    firstName?: string;
    lastName?: string;
    serviceTime?: string;
    serviceName?: string;
    unread?: boolean;
}

const GHTopBar: React.FC<GHTopBarProps> = ({ pictureUrl, firstName, lastName, serviceTime, serviceName, unread }) => {
    const scheme = useColorScheme();
    const iconColor = scheme === 'dark' ? '#a1a1aa' : '#18181B';

    return (
        <View className="h-14 px-4 flex-row items-center justify-between bg-background border-b border-border">
            <TouchableOpacity onPress={() => router.push('/profile')} activeOpacity={0.6}>
                <AvatarComponent
                    alt="profile"
                    className="w-9 h-9"
                    firstName={firstName}
                    lastName={lastName}
                    imageUrl={pictureUrl ?? AVATAR_FALLBACK_URL}
                />
            </TouchableOpacity>

            <ServicePill name={serviceName} serviceTime={serviceTime} />

            <TouchableOpacity
                activeOpacity={0.6}
                className="w-9 h-9 items-center justify-center rounded-full"
                // onPress={() => router.push('/notifications' as any)}
            >
                <Ionicons name="notifications-outline" size={20} color={iconColor} />
                {unread && (
                    <View className="absolute top-1 right-1 w-2 h-2 rounded-full bg-destructive" />
                )}
            </TouchableOpacity>
        </View>
    );
};

export default React.memo(GHTopBar);
