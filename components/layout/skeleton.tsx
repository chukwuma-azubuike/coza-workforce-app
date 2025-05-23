import React from 'react';
import { View } from 'react-native';
import { Skeleton } from '../ui/skeleton';

export const HomeSkeleton: React.FC = React.memo(() => {
    return (
        <View className="items-center w-full">
            <View className="gap-10 overflow-hidden rounded-md max-w-sm border-border">
                <Skeleton className="w-40" />
                <Skeleton className="px-4 h-10" />
                <Skeleton className="px-4 my-4" />
                <Skeleton className="h-40" />
                <Skeleton className="px-4 h-10" />
                <Skeleton className="px-4 my-4" />
            </View>
        </View>
    );
});

export const FlatListSkeleton: React.FC<{
    count?: number;
}> = React.memo(({ count = 6 }) => {
    return (
        <View className="items-center w-full flex-1">
            {Array.from(Array(count).keys()).map((elm, idx) => (
                <Skeleton className="overflow-hidden my-3 h-8 w-11/12" key={`elm-${idx}`} />
            ))}
        </View>
    );
});

export const ProfileSkeleton: React.FC<{
    count?: number;
}> = React.memo(({ count = 6 }) => {
    return (
        <View className="items-center w-full">
            <Skeleton className="my-3 h-24 w-24 mb-3 rounded-full" />
            {Array.from(Array(count).keys()).map((elm, idx) => (
                <Skeleton key={`elm-${idx}`} className="h-8 my-3 w-11/12 overflow-hidden" />
            ))}
        </View>
    );
});

export const ProfileSkeletonMini: React.FC<{
    count?: number;
}> = React.memo(({ count = 4 }) => {
    return (
        <View className="flex-row gap-4 items-center">
            <Skeleton className="h-32 w-32 rounded-full" />
            <View className="flex-1">
                {Array.from(Array(count).keys()).map((elm, idx) => (
                    <Skeleton className="h-4 mb-2 overflow-hidden" key={`elm-${idx}`} />
                ))}
            </View>
        </View>
    );
});

export const FlexListSkeleton: React.FC<{
    count?: number;
}> = React.memo(({ count = 1 }) => {
    return (
        <View>
            {Array.from(Array(count).keys()).map((elm, idx) => (
                <View key={idx} className="flex-row items-center justify-center my-1">
                    <Skeleton className="h-2 flex-1 overflow-hidden" />
                    <Skeleton className="h-2 ml-12 flex-1 overflow-hidden" />
                </View>
            ))}
        </View>
    );
});
