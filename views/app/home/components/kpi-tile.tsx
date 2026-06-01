import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { CountUp } from 'use-count-up';
import { Text } from '~/components/ui/text';
import { Card } from '~/components/ui/card';
import { Skeleton } from '~/components/ui/skeleton';
import { cn } from '~/lib/utils';

export type AccentTone = 'good' | 'warn' | 'bad' | 'primary';

export const accentStyles: Record<AccentTone, { container: string; text: string; dot: string }> = {
    good: {
        container: 'bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800',
        text: 'text-green-700 dark:text-green-400',
        dot: 'bg-green-700 dark:bg-green-400',
    },
    warn: {
        container: 'bg-amber-100 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800',
        text: 'text-amber-700 dark:text-amber-400',
        dot: 'bg-amber-700 dark:bg-amber-400',
    },
    bad: {
        container: 'bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800',
        text: 'text-red-700 dark:text-red-400',
        dot: 'bg-red-700 dark:bg-red-400',
    },
    primary: {
        container: 'bg-secondary border border-border',
        text: 'text-primary',
        dot: 'bg-primary',
    },
};

const AccentPill: React.FC<{ label: string; tone: AccentTone }> = ({ label, tone }) => {
    const { container, text, dot } = accentStyles[tone];
    return (
        <View className={cn('self-start flex-row items-center gap-1.5 rounded-full h-6 px-2.5', container)}>
            <View className={cn('w-1.5 h-1.5 rounded-full opacity-70', dot)} />
            <Text className={cn('!text-[11px] font-semibold leading-none', text)}>{label}</Text>
        </View>
    );
};

export interface KpiTileProps {
    value?: number;
    total?: number;
    label: string;
    accent?: string;
    accentTone?: AccentTone;
    isLoading?: boolean;
    onPress?: () => void;
}

const KpiTile: React.FC<KpiTileProps> = ({
    value, total, label, accent, accentTone = 'primary', isLoading, onPress,
}) => {
    if (isLoading) return <Skeleton className="flex-1 h-28 rounded-2xl" />;
    return (
        <Card className="flex-1 p-1">
            <TouchableOpacity activeOpacity={0.6} onPress={onPress} className="p-3.5 gap-2">
                <Text className="text-sm font-bold uppercase tracking-widest text-muted-foreground">{label}</Text>
                <View className="flex-row items-baseline gap-1.5">
                    <Text className="!text-[26px] font-bold text-foreground leading-none">
                        <CountUp isCounting duration={2} end={value ?? 0} />
                    </Text>
                    {total !== undefined && <Text className="text-muted-foreground font-medium">/{total}</Text>}
                </View>
                {accent && <AccentPill label={accent} tone={accentTone} />}
            </TouchableOpacity>
        </Card>
    );
};

export default React.memo(KpiTile);
