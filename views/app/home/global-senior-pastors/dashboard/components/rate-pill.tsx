import React from 'react';
import { View } from 'react-native';
import { Text } from '~/components/ui/text';
import { formatPercent } from '../lib';

interface RatePillProps {
    rate?: number;
    size?: 'sm' | 'md';
}

const toneConfig = {
    good: { bg: 'bg-green-100 dark:bg-green-900/40', text: 'text-green-700 dark:text-green-400' },
    warn: { bg: 'bg-amber-100 dark:bg-amber-900/40', text: 'text-amber-700 dark:text-amber-400' },
    bad: { bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-700 dark:text-red-400' },
};

const rateTone = (rate?: number): 'good' | 'warn' | 'bad' => {
    if (rate == null) return 'warn';
    if (rate >= 0.8) return 'good';
    if (rate >= 0.6) return 'warn';
    return 'bad';
};

/** Colour-coded percentage pill: green ≥80%, amber 60–80%, red <60%. */
const RatePill: React.FC<RatePillProps> = ({ rate, size = 'md' }) => {
    const tone = rateTone(rate);
    const { bg, text } = toneConfig[tone];
    const textSize = size === 'sm' ? '!text-[11px]' : '!text-[12px]';

    return (
        <View className={`px-2 py-0.5 rounded-full ${bg} self-start`}>
            <Text className={`${textSize} font-bold ${text}`}>{formatPercent(rate, 1)}</Text>
        </View>
    );
};

export { rateTone };
export default React.memo(RatePill);
