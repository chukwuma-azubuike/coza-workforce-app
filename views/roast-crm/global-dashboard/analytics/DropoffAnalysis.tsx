import React from 'react';
import { View } from 'react-native';
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card';
import { Progress } from '~/components/ui/progress';
import { Text } from '~/components/ui/text';
import { cn } from '~/lib/utils';
import { DropOffAnalysis } from '~/store/types';

interface DropoffAnalysisProps {
    data: Array<DropOffAnalysis>;
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
                                        item.percentage < 1
                                            ? 'text-green-500'
                                            : item.percentage < 30
                                              ? 'text-yellow-500'
                                              : 'text-red-500'
                                    )}
                                >
                                    {item.percentage}% Drop-off
                                </Text>
                            </View>
                            <Text className="text-muted-foreground line-clamp-none">
                                <Text>Primary reason:</Text> {item.reason}
                            </Text>
                            <Progress
                                value={item.percentage}
                                indicatorClassName={
                                    item.percentage < 1
                                        ? 'bg-green-500'
                                        : item.percentage < 30
                                          ? 'bg-yellow-500'
                                          : 'bg-destructive'
                                }
                            />
                        </View>
                    ))}
                </View>
            </CardContent>
        </Card>
    );
}
