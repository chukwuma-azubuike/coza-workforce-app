import React from 'react';
import { LayoutChangeEvent, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Line, Path, Stop, Text as SvgText } from 'react-native-svg';
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
    /** Formats both the y-axis ticks and the latest-point callout. */
    valueFormatter?: (value: number) => string;
}

const PAD_TOP = 12;
const AX_LEFT = 36; // y-axis label gutter
const AX_BOTTOM = 18; // x-axis label row
const PAD_RIGHT = 10;
const Y_TICKS = 3; // min · mid · max — enough to read level, not cluttered
const MAX_X_LABELS = 4;

const AXIS_TEXT = THEME_CONFIG.lightGray;
const GRID = 'rgba(120,120,120,0.18)';

/** Keep axis labels short so they never overlap. */
const shortLabel = (s: string) => (s.length > 10 ? `${s.slice(0, 9)}…` : s);

/**
 * Smooth area + line trend chart (pure SVG). A light 3-tick y-axis and a handful
 * of evenly-spaced x labels give the GSP real numbers to read without clutter;
 * the latest point is emphasised with its value. Heavy series cap via `maxPoints`.
 */
const TrendChart: React.FC<TrendChartProps> = ({
    data,
    color = THEME_CONFIG.primary,
    height = 156,
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

    const plotW = Math.max(0, width - AX_LEFT - PAD_RIGHT);
    const plotH = height - PAD_TOP - AX_BOTTOM;

    const xAt = (i: number) => (points.length === 1 ? AX_LEFT + plotW / 2 : AX_LEFT + (i / (points.length - 1)) * plotW);
    const yAt = (v: number) => PAD_TOP + (plotH - ((v - min) / range) * plotH);

    const coords = points.map((p, i) => ({ x: xAt(i), y: yAt(p.value), ...p }));
    const firstCoord = coords[0]!;
    const lastCoord = coords[coords.length - 1]!;
    const latest = points[points.length - 1]!;

    const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(' ');
    const baseY = (PAD_TOP + plotH).toFixed(1);
    const areaPath = width
        ? `${linePath} L ${lastCoord.x.toFixed(1)} ${baseY} L ${firstCoord.x.toFixed(1)} ${baseY} Z`
        : '';

    // Y ticks: evenly spaced levels between min and max.
    const yTicks = Array.from({ length: Y_TICKS }, (_, i) => min + (range * i) / (Y_TICKS - 1));

    // X labels: evenly spaced across the range (always including first & last),
    // capped at MAX_X_LABELS and de-duplicated so short series don't double up.
    const labelCount = Math.min(MAX_X_LABELS, points.length);
    const xLabelIdx =
        labelCount <= 1
            ? [0]
            : Array.from({ length: labelCount }, (_, k) => Math.round((k * (points.length - 1)) / (labelCount - 1))).filter(
                  (v, i, arr) => arr.indexOf(v) === i
              );

    return (
        <View onLayout={onLayout} style={{ height }}>
            {width > 0 && (
                <Svg width={width} height={height}>
                    <Defs>
                        <LinearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                            <Stop offset="0" stopColor={color} stopOpacity={0.28} />
                            <Stop offset="1" stopColor={color} stopOpacity={0.02} />
                        </LinearGradient>
                    </Defs>

                    {/* Gridlines + y-axis tick labels */}
                    {yTicks.map((v, i) => {
                        const y = yAt(v);
                        return (
                            <React.Fragment key={`y-${i}`}>
                                <Line x1={AX_LEFT} y1={y} x2={AX_LEFT + plotW} y2={y} stroke={GRID} strokeWidth={1} />
                                <SvgText x={AX_LEFT - 6} y={y + 3} fontSize={9} fill={AXIS_TEXT} textAnchor="end">
                                    {valueFormatter(v)}
                                </SvgText>
                            </React.Fragment>
                        );
                    })}

                    {/* Area + line */}
                    <Path d={areaPath} fill="url(#trendFill)" />
                    <Path d={linePath} stroke={color} strokeWidth={2.5} fill="none" strokeLinejoin="round" />

                    {/* Points */}
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

                    {/* Latest value callout */}
                    <SvgText
                        x={Math.min(lastCoord.x, AX_LEFT + plotW)}
                        y={Math.max(PAD_TOP + 8, lastCoord.y - 8)}
                        fontSize={11}
                        fontWeight="bold"
                        fill={color}
                        textAnchor="end"
                    >
                        {valueFormatter(latest.value)}
                    </SvgText>

                    {/* X-axis labels */}
                    {xLabelIdx.map(i => {
                        const c = coords[i]!;
                        const anchor = i === 0 ? 'start' : i === points.length - 1 ? 'end' : 'middle';
                        return (
                            <SvgText
                                key={`x-${i}`}
                                x={c.x}
                                y={height - 5}
                                fontSize={9}
                                fill={AXIS_TEXT}
                                textAnchor={anchor}
                            >
                                {shortLabel(c.label)}
                            </SvgText>
                        );
                    })}
                </Svg>
            )}
        </View>
    );
};

export default React.memo(TrendChart);
