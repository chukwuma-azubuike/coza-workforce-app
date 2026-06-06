import React from 'react';
import { View } from 'react-native';
import { Text } from '~/components/ui/text';

export interface Segment {
    label: string;
    value: number;
    color: string;
}

interface SegmentedBarProps {
    segments: Segment[];
    /** Optional headline number shown above the bar. */
    headline?: string;
    headlineCaption?: string;
    /** Small muted note rendered below the legend (e.g. "N on approved permission"). */
    footnote?: string;
}

/** A single proportional stacked bar with a labelled legend (present/late/absent etc.). */
const SegmentedBar: React.FC<SegmentedBarProps> = ({ segments, headline, headlineCaption, footnote }) => {
    const total = segments.reduce((sum, s) => sum + (s.value || 0), 0) || 1;

    return (
        <View className="gap-3">
            {(headline || headlineCaption) && (
                <View className="flex-row items-baseline gap-2">
                    {!!headline && <Text className="text-2xl font-bold text-foreground leading-none">{headline}</Text>}
                    {!!headlineCaption && <Text className="text-sm text-muted-foreground">{headlineCaption}</Text>}
                </View>
            )}
            <View className="flex-row h-3 rounded-full overflow-hidden bg-secondary">
                {segments.map((s, i) => (
                    <View
                        key={s.label}
                        style={{ flex: Math.max(0.0001, s.value), backgroundColor: s.color }}
                        className={i > 0 ? 'border-l border-background' : ''}
                    />
                ))}
            </View>
            <View className="flex-row flex-wrap gap-x-4 gap-y-1.5">
                {segments.map(s => (
                    <View key={s.label} className="flex-row items-center gap-1.5">
                        <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                        <Text className="text-sm text-foreground">
                            <Text className="font-bold">{Math.round(s.value).toLocaleString()}</Text>{' '}
                            <Text className="text-muted-foreground">
                                {s.label} · {Math.round((s.value / total) * 100)}%
                            </Text>
                        </Text>
                    </View>
                ))}
            </View>
            {!!footnote && <Text className="!text-[12px] text-muted-foreground">{footnote}</Text>}
        </View>
    );
};

export default React.memo(SegmentedBar);
