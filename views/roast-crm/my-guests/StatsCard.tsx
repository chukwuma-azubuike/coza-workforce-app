import React, { memo } from 'react';
import { View } from 'react-native';
import { Card, CardContent } from '~/components/ui/card';
import { AssimilationStage } from '~/store/types';

interface StatsCardProps {
    stage: AssimilationStage;
    count: number;
}

export const StatsCard = memo(function StatsCard({ stage, count }: StatsCardProps) {
    const getStageText = () => {
        switch (stage) {
            case 'invited':
                return { title: 'Invited', color: 'text-blue-600' };
            case 'attended':
                return { title: 'Attended', color: 'text-green-600' };
            case 'discipled':
                return { title: 'Discipled', color: 'text-purple-600' };
            case 'joined':
                return { title: 'Joined', color: 'text-gray-600' };
        }
    };

    const stageInfo = getStageText();

    return (
        <Card className="text-center">
            <CardContent className="p-4">
                <View className={`text-2xl font-bold ${stageInfo?.color}`}>{count}</View>
                <View className="text-sm text-gray-600">{stageInfo?.title}</View>
            </CardContent>
        </Card>
    );
});
