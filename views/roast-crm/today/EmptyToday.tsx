import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';

import { Text } from '~/components/ui/text';
import ROAST_COPY, { pluralise } from '~/constants/roast-copy';

interface EmptyTodayProps {
    /** Turns the empty state from a shrug into a reward. Zero simply omits the line. */
    streak?: number;
}

/**
 * Nothing due.
 *
 * Not a shrug — a reward. This is the screen a worker sees on their best days, and an
 * empty-state illustration with "no items" would tell them their good day was
 * unremarkable. It names what they did and points forward.
 */
const EmptyToday: React.FC<EmptyTodayProps> = ({ streak = 0 }) => (
    <View className="items-center pt-20 px-8 gap-2">
        <Text className="!text-4xl">🔥</Text>

        <Text className="!text-lg font-semibold text-center">{ROAST_COPY.today.emptyTitle}</Text>

        <Text className="!text-sm text-muted-foreground text-center line-clamp-none">
            {streak > 0
                ? `You've cleared every guest on your list. ${pluralise(streak, 'day')} on and counting.`
                : ROAST_COPY.today.emptyBody}
        </Text>

        <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => router.push('/roast-crm/my-guests')}
            accessibilityRole="button"
            className="h-11 px-5 mt-3 rounded-full border border-border justify-center"
        >
            <Text className="!text-sm">See my guests</Text>
        </TouchableOpacity>
    </View>
);

export default EmptyToday;
