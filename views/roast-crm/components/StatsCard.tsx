import React, { memo, useCallback, useMemo } from 'react';
import { Card, CardContent } from '~/components/ui/card';
import { Text } from '~/components/ui/text';
import { AssimilationStage } from '~/store/types';

interface StatsCardProps {
    count: number;
    stage: AssimilationStage;
}

const StatsCard: React.FC<StatsCardProps> = ({ stage, count }: StatsCardProps) => {
    const getStageText = useCallback(() => {
        if (stage.includes('attended')) {
            return { title: 'Attended', color: 'text-green-600' };
        }

        switch (stage) {
            case AssimilationStage.INVITED:
                return { title: 'Invited', color: 'text-blue-600' };
            case AssimilationStage.MGI:
                return { title: 'Discipled', color: 'text-purple-600' };
            case AssimilationStage.JOINED:
                return { title: 'Joined', color: 'text-foreground' };
        }
    }, [stage]);

    const stageInfo = useMemo(() => getStageText(), [getStageText]);

    return (
        <Card className="items-center flex-1 min-w-[20%]">
            <CardContent className="py-4 px-2">
                <Text className={`text-3xl font-bold text-blue-600 text-center ${stageInfo?.color}`}>{count ?? 0}</Text>
                <Text className="text-foreground">{stageInfo?.title}</Text>
            </CardContent>
        </Card>
    );
};

export default memo(StatsCard);

StatsCard.displayName = 'StatsCard';
