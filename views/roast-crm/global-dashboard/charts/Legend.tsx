import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { FUNNEL_SERIES, FunnelKey, SeriesConfig } from './chart-utils';

interface LegendProps {
    /** Series to render. Defaults to the four funnel metrics. */
    series?: SeriesConfig[];
    /** Keys currently toggled off (dimmed). */
    hidden?: Set<FunnelKey>;
    /** When provided, chips become tappable to toggle series visibility. */
    onToggle?: (key: FunnelKey) => void;
}

const Legend: React.FC<LegendProps> = ({ series = FUNNEL_SERIES, hidden, onToggle }) => {
    return (
        <View className="flex-row flex-wrap items-center gap-x-4 gap-y-1.5 mb-3">
            {series.map(item => {
                const isHidden = hidden?.has(item.key);
                const Chip = (
                    <View className="flex-row items-center gap-1.5" style={{ opacity: isHidden ? 0.4 : 1 }}>
                        <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <Text
                            className="text-sm text-foreground"
                            style={isHidden ? { textDecorationLine: 'line-through' } : undefined}
                        >
                            {item.label}
                        </Text>
                    </View>
                );

                if (!onToggle) return <React.Fragment key={item.key}>{Chip}</React.Fragment>;

                return (
                    <Pressable key={item.key} hitSlop={6} onPress={() => onToggle(item.key)}>
                        {Chip}
                    </Pressable>
                );
            })}
        </View>
    );
};

export default Legend;
