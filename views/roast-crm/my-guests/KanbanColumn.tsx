import React, { ReactNode } from 'react';
import { View } from 'react-native';
import { Guest } from '~/store/types';
import { Text } from '~/components/ui/text';
import { Badge } from '~/components/ui/badge';
import { Skeleton } from '~/components/ui/skeleton';
import Utils from '~/utils';

interface KanbanColumnProps {
    title: string;
    guestCount?: number;
    children: ReactNode;
    isLoading?: boolean;
    containerHeight?: number;
    stage: Guest['assimilationStage'];
}

export function KanbanColumn({ title, stage, guestCount, children, containerHeight, isLoading }: KanbanColumnProps) {
    const getStageColor = () => {
        switch (stage) {
            case 'invited':
                return 'border-blue-200 dark:border-blue-200/10 bg-blue-50 dark:bg-blue-500/10';
            case 'attended':
                return 'border-green-200 dark:border-green-200/10 bg-green-50 dark:bg-green-500/10';
            case 'discipled':
                return 'border-purple-200 dark:border-purple-200/10 bg-purple-50 dark:bg-purple-500/10';
            case 'joined':
                return 'border-gray-200 dark:border-gray-200/10 bg-gray-50 dark:bg-gray-500/10';
        }
    };
    const getBadgeColor = () => {
        switch (stage) {
            case 'invited':
                return 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-800';
            case 'attended':
                return 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-800';
            case 'discipled':
                return 'bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-800';
            case 'joined':
                return 'bg-gray-100 dark:bg-gray-900/40 text-gray-800 dark:text-gray-800';
        }
    };

    return (
        <View
            className={` ${
                getStageColor() ?? 'border-gray-200 dark:border-gray-200/10 bg-gray-50 dark:bg-gray-500/10'
            } border-2 border-dashed rounded-2xl transition-colors pb-3`}
        >
            <View className="flex-row items-center gap-2 p-3">
                <Text className="font-semibold">{Utils.capitalizeFirstChar(title)}</Text>
                <Badge variant="secondary" className={getBadgeColor()}>
                    <Text>{guestCount}</Text>
                </Badge>
            </View>

            <View className="gap-4 p-1.5" style={{ height: (containerHeight ?? 0) + 430 }}>
                {isLoading ? (
                    <View className="gap-2">
                        {[...Array(3)].map((_, index) => (
                            <View key={index} className="gap-2 p-5 border border-border rounded-2xl">
                                <View className="flex-row gap-4">
                                    <Skeleton className="h-12 w-12 rounded-full" />
                                    <View className="flex-1 gap-2">
                                        <Skeleton className="h-4 w-2/3" />
                                        <Skeleton className="h-4 w-1/2" />
                                    </View>
                                </View>
                                <View className="gap-2">
                                    <Skeleton className="h-10 w-full" />
                                    <Skeleton className="h-2 w-1/2" />
                                </View>
                            </View>
                        ))}
                    </View>
                ) : (
                    children
                )}
            </View>
        </View>
    );
}
