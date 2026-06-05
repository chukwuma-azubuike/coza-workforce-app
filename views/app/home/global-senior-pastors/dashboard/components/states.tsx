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
