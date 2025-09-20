import React, { memo, ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { Guest } from '~/store/types';
import { Text } from '~/components/ui/text';
import { Badge } from '~/components/ui/badge';
import { Skeleton } from '~/components/ui/skeleton';
import Utils from '~/utils';
import { ScreenHeight } from '@rneui/base';
import { getBadgeColor, getStageColumnColor } from '../utils/colors';

interface KanbanColumnProps {
    title: string;
    guestCount?: number;
    children: ReactNode;
    isLoading?: boolean;
    stage: Guest['assimilationStage'];
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ title, stage, guestCount, children, isLoading }) => {
    return (
        <View
            className={` ${
                getStageColumnColor(stage) ?? 'border-gray-200 dark:border-gray-200/10 bg-gray-50 dark:bg-gray-500/10'
            } border-2 border-dashed rounded-2xl transition-colors pb-0`}
        >
            <View className="flex-row items-center gap-2 px-3 pt-2">
                <Text className="font-semibold">{Utils.capitalizeFirstChar(title)}</Text>
                <Badge variant="secondary" className={getBadgeColor(stage)}>
                    <Text>{guestCount}</Text>
                </Badge>
            </View>

            <View className="gap-4 p-1.5" style={{ height: (ScreenHeight ?? 0) - 480 }}>
                {isLoading ? (
                    <View className="gap-2">
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
                ) : (
                    children
                )}
            </View>
        </View>
    );
};

export default memo(KanbanColumn);

KanbanColumn.displayName = 'KanbanColumn';
