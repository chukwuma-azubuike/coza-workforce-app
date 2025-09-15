import React, { useRef } from 'react';
import { View, ScrollView } from 'react-native';
import { KanbanCard } from './KanbanCard';
import { Guest } from '~/store/types';
import { Text } from '~/components/ui/text';
import { Badge } from '~/components/ui/badge';
import { Skeleton } from '~/components/ui/skeleton';
import Utils from '~/utils';

interface KanbanColumnProps {
    title: string;
    stage: Guest['assimilationStage'];
    guests?: Guest[];
    isLoading?: boolean;
    onViewGuest: (guestId: string) => void;
    onGuestMove?: (guestId: string, newStage: Guest['assimilationStage']) => void;
    // new props
    registerColumnRef?: (ref: View | null) => void;
    onDropGlobal: (guestId: string, x: number, y: number) => void;
    onDragStartGlobal?: () => void;
}

export function KanbanColumn({
    title,
    stage,
    guests,
    onViewGuest,
    isLoading,
    onGuestMove,
    registerColumnRef,
    onDropGlobal,
    onDragStartGlobal,
}: KanbanColumnProps) {
    const columnRef = useRef<View | null>(null);

    // register column ref with parent when mounted/updated
    const setRef = (ref: View | null) => {
        columnRef.current = ref;
        if (registerColumnRef) registerColumnRef(ref);
    };

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
            ref={setRef}
            onLayout={() => {
                // parent (board) will measure when it gets the ref, and we also re-measure on drag start in board
            }}
            className={`flex-1 min-w-[320px] ${getStageColor()} border-2 border-dashed rounded-2xl transition-colors pb-3`}
        >
            <View className="flex justify-between p-3">
                <View className="flex-row items-center gap-2">
                    <Text className="font-semibold">{Utils.capitalizeFirstChar(title)}</Text>
                    <Badge variant="secondary" className={getBadgeColor()}>
                        <Text>{guests?.length}</Text>
                    </Badge>
                </View>
            </View>

            <ScrollView className="flex-1 p-3">
                <View className="gap-4">
                    {isLoading ? (
                        <View className="gap-6">
                            {[...Array(3)].map((_, index) => (
                                <View key={index} className="gap-2 p-6 border border-border rounded-2xl">
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
                        guests?.map(guest => (
                            <KanbanCard
                                key={guest._id}
                                guest={guest}
                                onViewGuest={onViewGuest}
                                onGuestMove={onGuestMove}
                                onDrop={onDropGlobal ?? (() => {})}
                                onDragStart={onDragStartGlobal}
                            />
                        ))
                    )}
                </View>
            </ScrollView>
        </View>
    );
}
