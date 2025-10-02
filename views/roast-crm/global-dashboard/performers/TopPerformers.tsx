import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card';
import { TopPerformerCard } from './TopPerformerCard';
import { TrendDirection } from '~/store/types';
import { View } from 'react-native';

interface TopPerformersProps {
    performers: Array<{
        name: string;
        zone: string;
        conversions: number;
        trend: TrendDirection;
    }>;
}

export function TopPerformers({ performers }: TopPerformersProps) {
    return (
        <Card className="flex-1">
            <CardHeader>
                <CardTitle>Top Performing Workers</CardTitle>
            </CardHeader>
            <CardContent>
                <View className="gap-3">
                    {performers.map((performer, index) => (
                        <TopPerformerCard key={performer.name} {...performer} rank={index + 1} />
                    ))}
                </View>
            </CardContent>
        </Card>
    );
}
