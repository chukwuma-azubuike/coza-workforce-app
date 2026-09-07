import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { CountUp } from 'use-count-up';
import { Text } from '~/components/ui/text';
import { Card } from '~/components/ui/card';
import { Skeleton } from '~/components/ui/skeleton';
import { THEME_CONFIG } from '@config/appConfig';
import DeltaBadge from './delta-badge';

export interface KpiCardProps {
    label: string;
    value?: number;
    /** Render as `value/total` (e.g. campuses reporting). */
    total?: number;
    /** When true, animates the count-up; numbers are shown as compact (k/M) when large. */
    compact?: boolean;
    /** Pre-formatted display string — overrides numeric rendering (e.g. "81%"). */
    displayValue?: string;
    /** A small caption under the value (e.g. "3,940 present"). */
    footnote?: string;
    /** Signed fraction for period-over-period delta. */
    delta?: number;
    /** Invert delta sentiment for metrics where a drop is good. */
    invertDelta?: boolean;
    /** Accent dot colour (e.g. campus colour / metric colour). */
    accentColor?: string;
    isLoading?: boolean;
    onPress?: () => void;
}

const compactFmt = (v: number) => {
    if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
    if (Math.abs(v) >= 10_000) return `${(v / 1_000).toFixed(1).replace(/\.0$/, '')}k`;
    return Math.round(v).toLocaleString();
};

/** Tappable KPI tile with optional count-up, delta indicator and accent. */
const KpiCard: React.FC<KpiCardProps> = ({
    label,
    value,
    total,
    compact,
    displayValue,
    footnote,
    delta,
    invertDelta,
    accentColor,
    isLoading,
    onPress,
}) => {
    if (isLoading) return <Skeleton className="flex-1 h-32 rounded-2xl" />;

    const showCount = displayValue === undefined;

    return (
        <Card className="flex-1 p-1">
            <TouchableOpacity activeOpacity={onPress ? 0.6 : 1} onPress={onPress} className="p-3.5 gap-2">
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-1.5 flex-1">
                        {!!accentColor && (
                            <View className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }} />
                        )}
                        <Text
                            numberOfLines={1}
                            className="text-[12px] font-bold uppercase text-muted-foreground flex-1"
                        >
                            {label}
                        </Text>
                    </View>
                    {!!onPress && <ChevronRight size={15} color={THEME_CONFIG.lightGray} />}
                </View>

                <View className="flex-row items-baseline gap-1">
                    <Text className="!text-[27px] font-bold text-foreground leading-none">
                        {showCount ? (
                            <CountUp
                                isCounting
                                duration={1.4}
                                end={value ?? 0}
                                formatter={compact ? compactFmt : v => Math.round(v).toLocaleString()}
                            />
                        ) : (
                            displayValue
                        )}
                    </Text>
                    {total !== undefined && (
                        <Text className="text-muted-foreground font-medium">/{compact ? compactFmt(total) : total}</Text>
                    )}
                </View>

                {delta !== undefined ? (
                    <DeltaBadge delta={delta} invert={invertDelta} caption="vs prev." />
                ) : footnote ? (
                    <Text numberOfLines={1} className="!text-[12px] text-muted-foreground">
                        {footnote}
                    </Text>
                ) : null}
            </TouchableOpacity>
        </Card>
    );
};

export default React.memo(KpiCard);
