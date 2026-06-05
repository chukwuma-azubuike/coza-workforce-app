import React from 'react';
import { LayoutChangeEvent, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { Text } from '~/components/ui/text';
import { THEME_CONFIG } from '@config/appConfig';
import { formatCompactNumber } from '../lib';

export interface TrendPoint {
    key: string;
    label: string;
    value: number;
}

interface TrendChartProps {
    data: TrendPoint[];
    color?: string;
    height?: number;
    /** Show only the most recent N points (keeps service-level trends legible). */
    maxPoints?: number;
    /** Render a value formatter for the latest-point callout. */
    valueFormatter?: (value: number) => string;
}

const PAD_X = 6;
const PAD_TOP = 14;
const PAD_BOTTOM = 4;

/**
 * Smooth area + line trend chart (pure SVG). Emphasises the latest point and
 * labels the first/last buckets along the axis. Width is measured at layout so
 * it fits any container; heavy series should be capped by `maxPoints`.
 */
const TrendChart: React.FC<TrendChartProps> = ({
    data,
    color = THEME_CONFIG.primary,
    height = 140,
    maxPoints = 12,
    valueFormatter = formatCompactNumber,
}) => {
    const [width, setWidth] = React.useState(0);
    const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

    const points = React.useMemo(() => (maxPoints ? data.slice(-maxPoints) : data), [data, maxPoints]);

    if (!points.length) return null;

    const values = points.map(p => p.value);
    const max = Math.max(...values);
    const min = Math.min(...values, 0);
    const range = max - min || 1;

    const plotW = Math.max(0, width - PAD_X * 2);
    const plotH = height - PAD_TOP - PAD_BOTTOM;

    const coords = points.map((p, i) => {
        const x = points.length === 1 ? plotW / 2 : (i / (points.length - 1)) * plotW;
        const y = plotH - ((p.value - min) / range) * plotH;
        return { x: PAD_X + x, y: PAD_TOP + y, ...p };
    });

    // points/coords are guaranteed non-empty here (early return above).
    const firstCoord = coords[0]!;
    const lastCoord = coords[coords.length - 1]!;
    const first = points[0]!;
    const latest = points[points.length - 1]!;

    const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(' ');
    const baseY = (PAD_TOP + plotH).toFixed(1);
    const areaPath = width
        ? `${linePath} L ${lastCoord.x.toFixed(1)} ${baseY} L ${firstCoord.x.toFixed(1)} ${baseY} Z`
        : '';

    return (
        <View className="gap-2">
            <View onLayout={onLayout} style={{ height }}>
                {width > 0 && (
                    <Svg width={width} height={height}>
                        <Defs>
                            <LinearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                                <Stop offset="0" stopColor={color} stopOpacity={0.28} />
                                <Stop offset="1" stopColor={color} stopOpacity={0.02} />
                            </LinearGradient>
                        </Defs>
                        <Path d={areaPath} fill="url(#trendFill)" />
                        <Path d={linePath} stroke={color} strokeWidth={2.5} fill="none" strokeLinejoin="round" />
                        {coords.map((c, i) => (
                            <Circle
                                key={c.key}
                                cx={c.x}
                                cy={c.y}
                                r={i === coords.length - 1 ? 4.5 : 2.5}
                                fill={i === coords.length - 1 ? color : THEME_CONFIG.white}
                                stroke={color}
                                strokeWidth={i === coords.length - 1 ? 0 : 1.5}
                            />
                        ))}
                    </Svg>
                )}
            </View>
            <View className="flex-row items-center justify-between">
                <Text className="!text-[11px] text-muted-foreground">{first.label}</Text>
                <Text className="!text-[12px] font-semibold" style={{ color }}>
                    {latest.label}: {valueFormatter(latest.value)}
                </Text>
            </View>
        </View>
    );
};

export default React.memo(TrendChart);
