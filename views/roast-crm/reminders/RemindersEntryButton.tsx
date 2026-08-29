import React, { useMemo } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { Icon } from '@rneui/themed';
import * as Haptics from 'expo-haptics';

import { Text } from '~/components/ui/text';
import { cn } from '~/lib/utils';
import { THEME_CONFIG } from '~/config/appConfig';
import { REMINDER_STATUS } from '~/store/types';
import { useGetRemindersQuery } from '~/store/services/roast-engagement';

/**
 * The way into My Reminders (US-2.6), from the top of My Guests.
 *
 * Deliberately not a sixth tab. The Roast tab bar already lays five fixed-width items
 * across a phone screen and an admin's row is tight as it is; a sixth would push it into
 * a horizontal overflow for the users who have the most to lose from one.
 *
 * The badge counts what is **due or overdue right now**, not everything upcoming. A count
 * of "31" that includes a reminder set for next month is a number nobody acts on, and a
 * badge nobody acts on is a badge people learn to ignore.
 */
const RemindersEntryButton: React.FC = () => {
    const { data: page } = useGetRemindersQuery({ status: REMINDER_STATUS.UPCOMING, limit: 200 });
    const reminders = page?.data ?? [];

    const dueNow = useMemo(() => {
        const now = Date.now();

        return reminders.filter(reminder => Date.parse(reminder.dueAt) <= now).length;
    }, [reminders]);

    return (
        <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => {
                Haptics.selectionAsync();
                router.push('/roast-crm/reminders' as any);
            }}
            className={cn(
                'flex-row items-center gap-2 h-10 px-3 rounded-full border',
                dueNow ? 'border-primary' : 'border-border'
            )}
        >
            <Icon type="feather" name="bell" size={16} color={dueNow ? THEME_CONFIG.primary : THEME_CONFIG.lightGray} />
            <Text className={cn('!text-sm', dueNow && 'text-primary')}>Reminders</Text>

            {!!dueNow && (
                <View className="min-w-5 h-5 px-1.5 rounded-full bg-primary items-center justify-center">
                    <Text className="!text-[11px] text-primary-foreground dark:text-white">{dueNow}</Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

export default RemindersEntryButton;
