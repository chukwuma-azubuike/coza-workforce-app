import React from 'react';

import { Card, CardContent } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { Progress } from '~/components/ui/progress';

import { View } from 'react-native';
import { Text } from '~/components/ui/text';
import { ZoneLeaderboardEntry } from '~/store/types';
import { getRankIcon, getTrendIcon } from '../utils/icons';

export const ZoneListView: React.FC<ZoneLeaderboardEntry> = ({
    zoneId,
    zoneName,
    campusId,
    coordinators,
    workersCount,
    workers,
    totalGuests,
    conversion,
    calls,
    visits,
    points = Math.round(Math.random() * 1000),
    position = Math.round(Math.random() * 10),
    conversionRates,
    trend,
}) => {
    return (
        <Card key={zoneId} className="w-full">
            <CardContent className="p-4 gap-2">
                <View className="flex-row items-start sm:items-center gap-4 w-full">
                    <View className="flex-row items-center justify-between gap-4 w-full">
                        <View className="flex-row items-center gap-4">
                            <Text>{getRankIcon(position ?? 1)}</Text>
                            <View>
                                <Text className="text-2xl font-semibold">{zoneName} Zone</Text>
                            </View>
                        </View>
                        <View>
                            <View className="flex-row items-center gap-2">
                                <Text className="font-bold">{points}</Text>
                                <Text>{getTrendIcon(trend)}</Text>
                            </View>
                            <Text className="text-base text-muted-foreground">points</Text>
                        </View>
                    </View>

                    <View className="text-right hidden sm:block">
                        <View className="flex-row items-center gap-2 mb-1">
                            <Text className="font-bold">{points}</Text>
                            <Text>{getTrendIcon(trend)}</Text>
                        </View>
                        <Text className="text-base text-muted-foreground">points</Text>
                    </View>
                </View>

                <View className="flex-row gap-4 text-center">
                    <View className="flex-auto items-center">
                        <Text className="font-bold text-blue-600">{conversion}</Text>
                        <Text className="text-base text-muted-foreground">Conversions</Text>
                    </View>
                    <View className="flex-auto items-center">
                        <Text className="font-bold text-green-600">{totalGuests}</Text>
                        <Text className="text-base text-muted-foreground">Guests</Text>
                    </View>
                    <View className="flex-auto items-center">
                        <Text className="font-bold text-purple-600">{calls}</Text>
                        <Text className="text-base text-muted-foreground">Calls</Text>
                    </View>
                    <View className="flex-auto items-center">
                        <Text className="font-bold text-orange-600">{visits}</Text>
                        <Text className="text-base text-muted-foreground">Visits</Text>
                    </View>
                </View>

                {/* {achievement.length > 0 && (
                    <View className="mt-3 flex-row flex-wrap gap-1">
                        {achievement.map((badge, badgeIndex) => (
                            <Badge key={badgeIndex} variant="secondary" className="text-base">
                                <Text>{badge.title}</Text>
                            </Badge>
                        ))}
                    </View>
                )} */}

                {/* <View className="mt-3">
                    <View className="flex-row justify-between text-base text-muted-foreground mb-1">
                        <Text>Consistency</Text>
                        <Text>{consistency}%</Text>
                    </View>
                    <Progress value={consistency} className="h-2" />
                </View> */}
            </CardContent>
        </Card>
    );
};
