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
 * **The badge counts everything upcoming; the colour says whether any of it is due.**
 *
 * The two carry different jobs. The number is a receipt — a worker who has just set a
 * reminder needs the button to acknowledge it, and a badge that only counts what is due
 * *right now* stays on 0 after setting one for tomorrow, which reads as the save having
 * silently failed. The urgency, which is the thing worth acting on, is carried by the
 * button turning primary the moment something is actually due.
 *
 * Both move without a round trip: `createReminder` and `deleteReminder` patch every
 * cached reminder list optimistically, this one included.
 */
const RemindersEntryButton: React.FC = () => {
    const { data: page } = useGetRemindersQuery({ status: REMINDER_STATUS.UPCOMING, limit: 200 });
    const reminders = page?.data ?? [];

    const upcoming = reminders.length;

    const dueNow = useMemo(() => {
        const now = Date.now();

        return reminders.filter(reminder => Date.parse(reminder.dueAt) <= now).length;
    }, [reminders]);

    return (
        <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => {
                Haptics.selectionAsync();
                router.push('/roast-crm/reminders');
            }}
            className={cn(
                'flex-row items-center gap-2 h-10 px-3 rounded-full border',
                dueNow ? 'border-blue-600' : 'border-border'
            )}
        >
            <Icon type="feather" name="bell" size={16} color={dueNow ? THEME_CONFIG.blue : THEME_CONFIG.lightGray} />
            <Text className={cn('!text-sm', dueNow && 'text-blue-600')}>Reminders</Text>

            {!!upcoming && (
                <View
                    className={cn(
                        'min-w-5 h-5 px-1.5 rounded-full items-center justify-center',
                        dueNow ? 'bg-blue-600' : 'bg-muted'
                    )}
                >
                    <Text
                        className={cn(
                            'text-sm',
                            dueNow ? 'text-blue-600 dark:text-white' : 'text-muted-foreground'
                        )}
                    >
                        {upcoming}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

export default RemindersEntryButton;
