import React from 'react';
import { View } from 'react-native';
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card';
import { Progress } from '~/components/ui/progress';
import { Skeleton } from '~/components/ui/skeleton';
import { Text } from '~/components/ui/text';
import { cn } from '~/lib/utils';
import { DropOffAnalysis } from '~/store/types';

interface DropoffAnalysisProps {
    isLoading?: boolean;
    data: Array<DropOffAnalysis>;
}

export function DropoffAnalysis({ data, isLoading }: DropoffAnalysisProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Drop-off Analysis</CardTitle>
            </CardHeader>
            <CardContent>
                <View className="gap-4">
                    {isLoading
                        ? [...Array(3)].map((_, i) => (
                              <View key={i} className="p-4 gap-4 flex-1 border border-border rounded-xl">
                                  <View className="gap-6 flex-row flex-wrap">
                                      {[...Array(2)].map((_, i) => (
                                          <Skeleton key={i} className="min-w-[30%] h-4 flex-1" />
                                      ))}
                                  </View>
                                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
                                      <Skeleton className="w-full h-4" />
                                      <Skeleton className="w-28 h-4" />
                                  </View>
                                  <Skeleton className="w-full h-2" />
                              </View>
                          ))
                        : data.map((item, index) => (
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
