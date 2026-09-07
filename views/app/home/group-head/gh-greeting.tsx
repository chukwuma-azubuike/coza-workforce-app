import React from 'react';
import { View } from 'react-native';
import dayjs from 'dayjs';
import { Text } from '~/components/ui/text';

interface GHGreetingProps {
    firstName?: string;
    campus?: string;
}

const GHGreeting: React.FC<GHGreetingProps> = ({ firstName, campus }) => {
    const hour = dayjs().hour();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    const dateStr = dayjs().format('dddd, D MMMM');

    return (
        <View className="px-4 pt-4 pb-2">
            <Text className="!text-2xl font-bold">
                {greeting}, {firstName ?? 'there'}
            </Text>
            <Text className="!text-sm text-muted-foreground mt-1">
                {dateStr}{campus ? ` · ${campus}` : ''}
            </Text>
        </View>
    );
};

export default React.memo(GHGreeting);
