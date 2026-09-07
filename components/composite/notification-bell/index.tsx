import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Text } from '~/components/ui/text';
import useUnreadNotifications from '@hooks/push-notifications/useUnreadNotifications';
import { cn } from '~/lib/utils';

interface NotificationBellProps {
    /** Icon size — the two top bars size their icons differently. */
    size?: number;
    color?: string;
    className?: string;
}

/**
 * The bell, in one place.
 *
 * There are two top bars — the worker one and the GH/CP/GSP one — and they had drifted:
 * one had a live badge, the other a hardcoded dot on a button that did nothing. Both now
 * render this, so the count, the cap and the destination cannot disagree between them.
 */
const NotificationBell: React.FC<NotificationBellProps> = ({ size = 22, color, className }) => {
    const { unreadCount } = useUnreadNotifications();

    return (
        <TouchableOpacity
            activeOpacity={0.6}
            accessibilityRole="button"
            accessibilityLabel={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
            onPress={() => router.push('/notifications')}
            className={cn('w-9 h-9 items-center justify-center rounded-full', className)}
        >
            <Ionicons name="notifications-outline" size={size} color={color} />
            {unreadCount > 0 && (
                // A count, not a dot: "you have something" is not actionable, and the number
                // is what tells a worker whether it can wait. Capped so a long backlog cannot
                // push the badge out past the icon.
                <View className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-destructive items-center justify-center">
                    <Text className="!text-[10px] font-bold leading-none text-white">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

export default React.memo(NotificationBell);
