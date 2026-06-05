import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { ChevronRight, ShieldAlert, ShieldCheck } from 'lucide-react-native';
import { Text } from '~/components/ui/text';
import { Card } from '~/components/ui/card';
import { Skeleton } from '~/components/ui/skeleton';
import { THEME_CONFIG } from '@config/appConfig';
import { cn } from '~/lib/utils';
import { formatPercent, rateTone } from '../lib';

interface CompletenessBannerProps {
    campusesReporting?: number;
    campusesTotal?: number;
    reportsApproved?: number;
    reportsExpected?: number;
    rate?: number;
    isLoading?: boolean;
    onPress?: () => void;
}

const toneMap = {
    good: {
        bar: 'bg-green-600 dark:bg-green-400',
        chip: 'text-green-700 dark:text-green-400',
        track: 'bg-green-100 dark:bg-green-900/30',
        icon: THEME_CONFIG.success,
    },
    warn: {
        bar: 'bg-amber-500 dark:bg-amber-400',
        chip: 'text-amber-700 dark:text-amber-400',
        track: 'bg-amber-100 dark:bg-amber-900/30',
        icon: THEME_CONFIG.warning,
    },
    bad: {
        bar: 'bg-red-600 dark:bg-red-400',
        chip: 'text-red-700 dark:text-red-400',
        track: 'bg-red-100 dark:bg-red-900/30',
        icon: THEME_CONFIG.error,
    },
} as const;

/**
 * The dashboard's single most important trust signal: how complete the global
 * totals are. Always shown beside aggregate figures so an 81%-submitted total is
 * never misread as final. Tapping opens the completeness drill-down.
 */
const CompletenessBanner: React.FC<CompletenessBannerProps> = ({
    campusesReporting,
    campusesTotal,
    reportsApproved,
    reportsExpected,
    rate,
    isLoading,
    onPress,
}) => {
    if (isLoading) return <Skeleton className="h-24 rounded-2xl" />;

    const tone = rateTone(rate);
    const t = toneMap[tone];
    const Icon = tone === 'good' ? ShieldCheck : ShieldAlert;
    const pct = Math.min(1, Math.max(0, rate ?? 0));

    return (
        <Card className="p-0">
            <TouchableOpacity activeOpacity={onPress ? 0.7 : 1} onPress={onPress} className="p-4 gap-3">
                <View className="flex-row items-center gap-3">
                    <View className={cn('w-9 h-9 rounded-xl items-center justify-center', t.track)}>
                        <Icon size={18} color={t.icon} />
                    </View>
                    <View className="flex-1">
                        <Text className="text-sm font-semibold text-foreground">Submission completeness</Text>
                        <Text numberOfLines={1} className="!text-[12px] text-muted-foreground">
                            {campusesReporting ?? 0} of {campusesTotal ?? 0} campuses reported
                            {reportsExpected ? ` · ${reportsApproved ?? 0}/${reportsExpected} reports approved` : ''}
                        </Text>
                    </View>
                    <Text className={cn('text-lg font-bold', t.chip)}>{formatPercent(rate)}</Text>
                    {!!onPress && <ChevronRight size={16} color={THEME_CONFIG.lightGray} />}
                </View>
                <View className={cn('h-2 rounded-full overflow-hidden', t.track)}>
                    <View className={cn('h-full rounded-full', t.bar)} style={{ width: `${pct * 100}%` }} />
                </View>
                {tone !== 'good' && (
                    <Text className="!text-[12px] text-muted-foreground line-clamp-none">
                        Totals below reflect approved reports only — treat them as provisional until submission is
                        complete.
                    </Text>
                )}
            </TouchableOpacity>
        </Card>
    );
};

export default React.memo(CompletenessBanner);
