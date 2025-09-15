import React from 'react';
import { View } from 'react-native';
import { Alert } from '~/components/ui/alert';

import { Text } from '~/components/ui/text';

interface QuickTipsProps {
    tips: string[];
}

export function QuickTips({ tips }: QuickTipsProps) {
    return (
        <Alert className="shadow-sm rounded-3xl">
            <Text className="font-medium mb-2">Quick Tips</Text>
            <View className="gap-1">
                {tips.map((tip, index) => (
                    <Text className="text-base text-muted-foreground" key={index}>
                        • {tip}
                    </Text>
                ))}
            </View>
        </Alert>
    );
}
