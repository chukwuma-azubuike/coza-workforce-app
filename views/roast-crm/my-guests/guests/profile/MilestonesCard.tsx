import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card';
import { Checkbox } from '~/components/ui/checkbox';
import { CheckCircle } from 'lucide-react-native';
import { Milestone, MilestoneStatus } from '~/store/types';
import { Text } from '~/components/ui/text';
import { View } from 'react-native';

interface MilestonesCardProps {
    milestones: Milestone[];
    onToggle: (milestoneId: string) => void;
}

export function MilestonesCard({ milestones, onToggle }: MilestonesCardProps) {
    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5" />
                    <Text>Assimilation Milestones</Text>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <View className="space-y-3">
                    {milestones?.map(milestone => (
                        <View key={milestone._id} className="flex items-center space-x-3">
                            <Checkbox
                                checked={milestone.status === MilestoneStatus.COMPLETED}
                                onCheckedChange={() => onToggle(milestone._id)}
                            />
                            <View className="flex-1">
                                <Text
                                    className={
                                        milestone.status === MilestoneStatus.COMPLETED
                                            ? 'line-through text-gray-500'
                                            : ''
                                    }
                                >
                                    {milestone.title}
                                </Text>
                                {milestone.status === MilestoneStatus.COMPLETED && milestone.completedAt && (
                                    <Text className="text-xs text-gray-500 ml-2">
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
}
