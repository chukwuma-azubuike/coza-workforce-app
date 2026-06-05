import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Inbox, RefreshCw, TriangleAlert } from 'lucide-react-native';
import { Text } from '~/components/ui/text';
import { Card } from '~/components/ui/card';
import { Skeleton } from '~/components/ui/skeleton';
import { THEME_CONFIG } from '@config/appConfig';
import { cn } from '~/lib/utils';

/** Padded card surface used by every dashboard section body. */
export const SectionCard: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => (
    <Card className={cn('p-4', className)}>{children}</Card>
);

export const SectionSkeleton: React.FC<{ rows?: number }> = ({ rows = 4 }) => (
    <View className="gap-3">
        {Array.from({ length: rows }).map((_, i) => (
            <Skeleton key={i} className="h-6 rounded-lg" />
        ))}
    </View>
);

const LeagueRowSkeleton: React.FC = () => (
    <View className="gap-1.5">
        <View className="flex-row items-center justify-between gap-2">
            <View className="flex-row items-center gap-2 flex-1">
                <Skeleton className="w-4 h-4 rounded-sm" />
                <Skeleton className="w-2.5 h-2.5 rounded-full" />
                <Skeleton className="h-4 flex-1 rounded-md" />
            </View>
            <Skeleton className="h-4 w-10 rounded-md" />
        </View>
        <Skeleton className="h-2 ml-6 rounded-full" />
    </View>
);

const DonutSkeleton: React.FC<{ legendRows?: number }> = ({ legendRows = 3 }) => (
    <View className="flex-row items-center gap-4">
        <Skeleton className="w-[168px] h-[168px] rounded-full" />
        <View className="flex-1 gap-2">
            {Array.from({ length: legendRows }).map((_, i) => (
                <Skeleton key={i} className="h-5 rounded-md" />
            ))}
        </View>
    </View>
);

export const AttendanceSkeleton: React.FC = () => (
    <View className="gap-4">
        <View className="flex-row items-baseline gap-2">
            <Skeleton className="h-9 w-36 rounded-lg" />
            <Skeleton className="h-5 w-28 rounded-md" />
        </View>
        <DonutSkeleton legendRows={3} />
        <Skeleton className="h-px rounded-full" />
        <View className="gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
                <LeagueRowSkeleton key={i} />
            ))}
        </View>
        <Skeleton className="h-px rounded-full" />
        <View className="flex-row items-center justify-between">
            <Skeleton className="h-5 w-12 rounded-md" />
            <Skeleton className="h-8 w-28 rounded-full" />
        </View>
        <Skeleton className="h-32 rounded-xl" />
    </View>
);

export const WorkforceSkeleton: React.FC = () => (
    <View className="gap-4">
        <View className="gap-3">
            <View className="flex-row items-baseline gap-2">
                <Skeleton className="h-8 w-16 rounded-lg" />
                <Skeleton className="h-4 w-28 rounded-md" />
            </View>
            <Skeleton className="h-3 rounded-full" />
            <View className="flex-row gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-4 flex-1 rounded-md" />
                ))}
            </View>
        </View>
        <Skeleton className="h-px rounded-full" />
        <Skeleton className="h-5 w-28 rounded-md" />
        <DonutSkeleton legendRows={4} />
        <Skeleton className="h-px rounded-full" />
        <Skeleton className="h-5 w-48 rounded-md" />
        <View className="gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
                <LeagueRowSkeleton key={i} />
            ))}
        </View>
    </View>
);

export const GuestsSkeleton: React.FC = () => (
    <View className="gap-4">
        <View className="flex-row gap-4">
            <Skeleton className="flex-1 h-32 rounded-2xl" />
            <Skeleton className="flex-1 h-32 rounded-2xl" />
        </View>
        <Skeleton className="h-px rounded-full" />
        <Skeleton className="h-5 w-32 rounded-md" />
        <View className="gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
                <LeagueRowSkeleton key={i} />
            ))}
        </View>
        <Skeleton className="h-px rounded-full" />
        <Skeleton className="h-5 w-36 rounded-md" />
        <Skeleton className="h-32 rounded-xl" />
    </View>
);

export const ServicesSkeleton: React.FC = () => (
    <View className="gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
            <LeagueRowSkeleton key={i} />
        ))}
    </View>
);

export const CompletenessSkeleton: React.FC = () => (
    <View className="gap-4">
        <Skeleton className="h-12 rounded-xl" />
        <View className="gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
                <View key={i} className="gap-1.5">
                    <View className="flex-row items-center justify-between">
                        <Skeleton className="h-5 w-40 rounded-md" />
                        <Skeleton className="h-5 w-8 rounded-md" />
                    </View>
                    <Skeleton className="h-2.5 rounded-full" />
                </View>
            ))}
        </View>
        <Skeleton className="h-px rounded-full" />
        <Skeleton className="h-5 w-36 rounded-md" />
        <View className="gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
                <LeagueRowSkeleton key={i} />
            ))}
        </View>
    </View>
);

/**
 * Empty-window state. The API returns 200 + zero/empty for windows with no
 * approved reports — guide the user to the completeness view rather than implying
 * the numbers are simply low.
 */
export const SectionEmpty: React.FC<{ message?: string; onCheckCompleteness?: () => void }> = ({
    message = 'No approved reports for this period.',
    onCheckCompleteness,
}) => (
    <View className="items-center justify-center py-8 gap-3">
        <View className="w-12 h-12 rounded-2xl bg-secondary items-center justify-center">
            <Inbox size={22} color={THEME_CONFIG.lightGray} />
        </View>
        <Text className="text-sm text-muted-foreground text-center line-clamp-none px-6">{message}</Text>
        {!!onCheckCompleteness && (
            <TouchableOpacity activeOpacity={0.7} onPress={onCheckCompleteness} className="px-4 py-2 rounded-full bg-secondary">
                <Text className="text-sm font-semibold text-primary">View completeness</Text>
            </TouchableOpacity>
        )}
    </View>
);

export const SectionError: React.FC<{ message?: string; onRetry?: () => void }> = ({ message, onRetry }) => (
    <View className="items-center justify-center py-8 gap-3">
        <View className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/30 items-center justify-center">
            <TriangleAlert size={22} color={THEME_CONFIG.error} />
        </View>
        <Text className="text-sm text-muted-foreground text-center line-clamp-none px-6">
            {message || 'Something went wrong loading this section.'}
        </Text>
        {!!onRetry && (
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={onRetry}
                className="flex-row items-center gap-1.5 px-4 py-2 rounded-full bg-secondary"
            >
                <RefreshCw size={14} color={THEME_CONFIG.primary} />
                <Text className="text-sm font-semibold text-primary">Retry</Text>
            </TouchableOpacity>
        )}
    </View>
);
