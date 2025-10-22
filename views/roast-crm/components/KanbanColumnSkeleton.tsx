import React from 'react';
import { View } from 'react-native';
import { Skeleton } from '~/components/ui/skeleton';
import { getStageColumnColor } from '../utils/colors';

const KanbanColumnSkeleton: React.FC = () => {
    return (
        <View
            className={` ${
                getStageColumnColor('' as any) ??
                'border-gray-200 dark:border-gray-200/10 bg-gray-50 dark:bg-gray-500/10'
            } border-2 border-dashed rounded-2xl transition-colors pb-0 flex-1 min-w-[78%] gap-2`}
        >
            <View className="px-3 pt-2 gap-2">
                <View className="flex-row items-center gap-2">
                    <Skeleton className="h-4 w-9" />
                    <Skeleton className="h-3 w-4" />
                </View>
                <Skeleton className="h-2 w-[75%]" />
            </View>

            <View className="gap-4 pb-1.5 px-1.5 flex-1">
                <View className="gap-3">
                    {[...Array(2)].map((_, index) => (
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
            </View>
        </View>
    );
};

export default KanbanColumnSkeleton;

KanbanColumnSkeleton.displayName = 'KanbanColumnSkeleton';
