import { ArrowRight } from 'lucide-react-native';
import { Card, CardContent } from '~/components/ui/card';
import { getStageColor } from '../utils/stageUtils';
import { AssimilationStage } from '~/store/types';
import { View } from 'react-native';
import { Text } from '~/components/ui/text';

export function PipelineInstructions() {
    const stages = [
        { name: 'Invited', type: AssimilationStage.INVITED },
        { name: 'Attended 1st', type: AssimilationStage.ATTENDED1 },
        { name: 'Attended 2nd', type: AssimilationStage.ATTENDED2 },
        { name: 'Attended 3rd', type: AssimilationStage.ATTENDED3 },
        { name: 'Attended 4th', type: AssimilationStage.ATTENDED4 },
        { name: 'Attended 5th', type: AssimilationStage.ATTENDED5 },
        { name: 'Attended 6th', type: AssimilationStage.ATTENDED6 },
        { name: 'MGI', type: AssimilationStage.MGI },
        { name: 'Joined', type: AssimilationStage.JOINED },
    ] as const;

    return (
        <Card>
            <CardContent className="p-4">
                <Text className="font-medium mb-2">Pipeline Management</Text>
                <Text className="text-sm line-clamp-none text-muted-foreground mb-2">
                    Drag and drop guest cards between stages to update their assimilation progress.
                </Text>
                <View className="flex-row flex-wrap items-center gap-2">
                    {stages.map((stage, index) => (
                        <View key={stage.type} className="flex-row items-center gap-1">
                            <View className={`w-3 h-3 rounded ${getStageColor(stage.type, 'bg')}`} />
                            <Text>{stage.name}</Text>
                            {index < stages.length - 1 && <ArrowRight className="w-3 h-3" />}
                        </View>
                    ))}
                </View>
            </CardContent>
        </Card>
    );
}
