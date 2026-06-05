import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { Text } from '~/components/ui/text';
import { THEME_CONFIG } from '@config/appConfig';

export interface DonutSlice {
    id: string;
    label: string;
    value: number;
    color: string;
}

interface ShareDonutProps {
    slices: DonutSlice[];
    /** Big number rendered in the hole. */
    centerValue?: string;
    centerLabel?: string;
    size?: number;
    strokeWidth?: number;
    /** Max legend rows to show inline. */
    maxLegend?: number;
}

/**
 * Lightweight SVG donut for share-of-total composition. Pairs each arc with a
 * legend (label + %), so colour is never the only signal. Pure react-native-svg —
 * no chart-engine layout cost.
 */
const ShareDonut: React.FC<ShareDonutProps> = ({
    slices,
    centerValue,
    centerLabel,
    size = 168,
    strokeWidth = 22,
    maxLegend = 6,
}) => {
    const total = slices.reduce((sum, s) => sum + (s.value || 0), 0);
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const center = size / 2;

    let offsetAccum = 0;
    const arcs = total
        ? slices
              .filter(s => s.value > 0)
              .map(s => {
                  const fraction = s.value / total;
                  const dash = fraction * circumference;
                  const arc = {
                      ...s,
                      fraction,
                      dashArray: `${dash} ${circumference - dash}`,
                      dashOffset: -offsetAccum,
                  };
                  offsetAccum += dash;
                  return arc;
              })
        : [];

    const legend = slices.slice(0, maxLegend);
    const hiddenLegend = slices.length - legend.length;

    return (
        <View className="flex-row items-center gap-4">
            <View style={{ width: size, height: size }}>
                <Svg width={size} height={size}>
                    <G rotation={-90} origin={`${center}, ${center}`}>
                        <Circle
                            cx={center}
                            cy={center}
                            r={radius}
                            stroke={THEME_CONFIG.transparentGray}
                            strokeWidth={strokeWidth}
                            fill="transparent"
                        />
                        {arcs.map(a => (
                            <Circle
                                key={a.id}
                                cx={center}
                                cy={center}
                                r={radius}
                                stroke={a.color}
                                strokeWidth={strokeWidth}
                                strokeDasharray={a.dashArray}
                                strokeDashoffset={a.dashOffset}
                                strokeLinecap="butt"
                                fill="transparent"
                            />
                        ))}
                    </G>
                </Svg>
                {(centerValue || centerLabel) && (
                    <View className="absolute inset-0 items-center justify-center">
                        {!!centerValue && (
                            <Text className="text-xl font-bold text-foreground leading-none">{centerValue}</Text>
                        )}
                        {!!centerLabel && (
                            <Text className="!text-[11px] text-muted-foreground uppercase tracking-wider mt-1">
                                {centerLabel}
                            </Text>
                        )}
                    </View>
                )}
            </View>

            <View className="flex-1 gap-2">
                {legend.map(s => (
                    <View key={s.id} className="flex-row items-center gap-2">
                        <View className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: s.color }} />
                        <Text numberOfLines={1} className="text-sm text-foreground flex-1">
                            {s.label}
                        </Text>
                        <Text className="!text-[12px] font-semibold text-muted-foreground">
                            {total ? `${Math.round((s.value / total) * 100)}%` : '—'}
                        </Text>
                    </View>
                ))}
                {hiddenLegend > 0 && <Text className="!text-[11px] text-muted-foreground">+{hiddenLegend} more</Text>}
            </View>
        </View>
    );
};

export default React.memo(ShareDonut);
