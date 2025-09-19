import React, { memo } from 'react';
import { Card, CardHeader, CardContent } from '~/components/ui/card';
import { Checkbox } from '~/components/ui/checkbox';
import { CheckCircle } from 'lucide-react-native';
import { Milestone, MilestoneStatus } from '~/store/types';
import { View } from 'react-native';
import { Text } from '~/components/ui/text';
import { cn } from '~/lib/utils';

interface MilestonesCardProps {
    milestones: Milestone[];
    onToggle: (milestoneId: string) => void;
}

const MilestonesCard: React.FC<MilestonesCardProps> = ({ milestones, onToggle }) => {
    const handleCheck = (milestoneId: string) => () => {
        onToggle(milestoneId);
    };

    return (
        <Card>
            <CardHeader className="flex-row items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <Text className="text-lg font-bold">Assimilation Milestones</Text>
            </CardHeader>
            <CardContent>
                <View className="gap-4">
                    {milestones?.map(milestone => (
                        <View key={milestone._id} className="flex-row items-center gap-4">
                            <Checkbox
                                onCheckedChange={handleCheck(milestone?._id)}
                                checked={milestone.status === MilestoneStatus.COMPLETED}
                            />
                            <View className="flex-row items-center gap-1">
                                <Text
                                    className={cn(
                                        milestone.status === MilestoneStatus.COMPLETED &&
                                            'line-through text-muted-foreground'
                                    )}
                                >
                                    {milestone.title}
                                </Text>
                                {milestone.status === MilestoneStatus.COMPLETED && milestone.completedAt && (
                                    <Text className="text-sm text-muted-foreground ml-2">
                                        ✓ {new Date(milestone.completedAt).toLocaleString()}
                                    </Text>
                                )}
                            </View>
                        </View>
                    ))}
                </View>
            </CardContent>
        </Card>
    );
};

export default memo(MilestonesCard);

MilestonesCard.displayName = 'MilestonesCard';
