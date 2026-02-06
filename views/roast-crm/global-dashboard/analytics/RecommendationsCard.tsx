import React from 'react';
import { View } from 'react-native';
import { Alert } from '~/components/ui/alert';
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card';
import { Skeleton } from '~/components/ui/skeleton';
import { Text } from '~/components/ui/text';

interface RecommendationProps {
    title: string;
    description: string;
    type: 'info' | 'success' | 'warning';
}

export function Recommendation({ title, description, type }: RecommendationProps) {
    const colors = {
        info: 'bg-blue-50 dark:bg-blue-600/20 border-blue-600 dark:border-blue-300 text-blue-900',
        success: 'bg-green-50 dark:bg-green-600/20 border-green-400 text-green-900',
        warning: 'bg-purple-50 dark:bg-purple-600/20 border-purple-400 text-purple-900',
    };

    return (
        <Alert className={`py-3 border-0 border-l-4 ${colors[type]}`}>
            <Text
                className={`font-bold text-muted-foreground dark:text-foreground line-clamp-none ${
                    type === 'info'
                        ? 'text-blue-900 dark:text-blue-400'
                        : type === 'success'
                          ? 'text-green-900 dark:text-green-400'
                          : 'text-purple-900 dark:text-purple-400'
                } `}
            >
                {title}
            </Text>
            <Text
                className={`line-clamp-none ${
                    type === 'info'
                        ? 'text-blue-800 dark:text-blue-300'
                        : type === 'success'
                          ? 'text-green-800 dark:text-green-300'
                          : 'text-purple-800 dark:text-purple-300'
                }`}
            >
                {description}
            </Text>
        </Alert>
    );
}

interface RecommendationsCardProps {
    isLoading?: boolean;
    recommendations: Array<{
        title: string;
        description: string;
        type: 'info' | 'success' | 'warning';
    }>;
}

export function RecommendationsCard({ recommendations, isLoading }: RecommendationsCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
                <View className="gap-6">
                    {isLoading
                        ? [...Array(3)].map((_, i) => (
                              <View key={i} className="p-4 gap-4 flex-1 border border-border rounded-xl">
                                  <Skeleton key={i} className="w-[50%] h-4 flex-1" />
                                  <View style={{ gap: 16 }}>
                                      <Skeleton className="w-full h-4" />
                                      <Skeleton className="w-full h-4" />
                                      <Skeleton className="w-full h-4" />
                                      <Skeleton className="w-28 h-4" />
                                  </View>
                              </View>
                          ))
                        : recommendations.map((rec, index) => <Recommendation key={index} {...rec} />)}
                </View>
            </CardContent>
        </Card>
    );
}
