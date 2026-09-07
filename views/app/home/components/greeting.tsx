import React from 'react';
import { View } from 'react-native';
import dayjs from 'dayjs';
import { Text } from '~/components/ui/text';

export interface HomeGreetingProps {
    firstName?: string;
    campus?: string;
    subtitle?: string;
    isPastor?: boolean;
}

const HomeGreeting: React.FC<HomeGreetingProps> = ({ firstName, campus, subtitle, isPastor }) => {
    const hour = dayjs().hour();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    const dateStr = dayjs().format('dddd, D MMMM');

    return (
        <View className="px-4 pt-4 pb-2">
            <Text className="!text-2xl font-bold">{greeting},{isPastor && ' Pastor'} {firstName ?? 'there'}</Text>
            <Text className="!text-sm text-muted-foreground mt-1">
                {subtitle ?? (dateStr + (campus ? ` · ${campus}` : ''))}
            </Text>
        </View>
    );
};

export default React.memo(HomeGreeting);
