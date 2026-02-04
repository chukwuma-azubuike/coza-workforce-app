import React from 'react';
import { View } from 'react-native';
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card';
import { Progress } from '~/components/ui/progress';
import { Text } from '~/components/ui/text';
import { cn } from '~/lib/utils';

interface DropoffAnalysisProps {
    data: Array<{
        stage: string;
        dropOff: number;
        reason: string;
    }>;
}

export function DropoffAnalysis({ data }: DropoffAnalysisProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Drop-off Analysis</CardTitle>
            </CardHeader>
            <CardContent>
                <View className="gap-4">
                    {data.map((item, index) => (
                        <View key={index} className="p-4 border border-border rounded-xl gap-2">
                            <View className="flex-row items-center justify-between mb-2">
                                <Text className="font-medium">{item.stage}</Text>
                                <Text
                                    className={cn(
                                        'text-lg font-bold text-destructive',
                                        item.dropOff < 30 ? 'text-yellow-500' : 'text-red-500'
                                    )}
                                >
                                    {item.dropOff}% Drop-off
                                </Text>
                            </View>
                            <Text className="text-muted-foreground line-clamp-none">
                                <Text>Primary reason:</Text> {item.reason}
                            </Text>
                            <Progress
                                value={item.dropOff}
                                indicatorClassName={item.dropOff < 30 ? 'bg-yellow-500' : 'bg-destructive'}
                            />
                        </View>
                    ))}
                </View>
            </CardContent>
        </Card>
    );
}
