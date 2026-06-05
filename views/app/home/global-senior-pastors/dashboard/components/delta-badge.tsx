import React from 'react';
import { View } from 'react-native';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react-native';
import { Text } from '~/components/ui/text';
import { cn } from '~/lib/utils';
import { deltaTone, formatDelta } from '../lib';

interface DeltaBadgeProps {
    /** Signed fraction, e.g. 0.062 = +6.2%. */
    delta?: number;
    /** For metrics where a decrease is good (e.g. absentees). */
    invert?: boolean;
    /** Caption appended after the delta, e.g. "vs last month". */
    caption?: string;
}

const toneStyles = {
    good: { text: 'text-green-700 dark:text-green-400', color: '#15803d' },
    bad: { text: 'text-red-700 dark:text-red-400', color: '#b91c1c' },
    neutral: { text: 'text-muted-foreground', color: '#71717A' },
} as const;

/** Signed up/down indicator for period-over-period change on KPI cards. */
const DeltaBadge: React.FC<DeltaBadgeProps> = ({ delta, invert, caption }) => {
    const label = formatDelta(delta);
    if (label === undefined) return null;

    const tone = deltaTone(delta, invert);
    const { text, color } = toneStyles[tone];
    const Icon = tone === 'neutral' ? Minus : delta! > 0 ? ArrowUpRight : ArrowDownRight;

    return (
        <View className="flex-row items-center gap-1">
            <Icon size={13} color={color} />
            <Text className={cn('!text-[12px] font-bold leading-none', text)}>{label}</Text>
            {!!caption && <Text className="!text-[11px] text-muted-foreground leading-none">{caption}</Text>}
        </View>
    );
};

export default React.memo(DeltaBadge);
