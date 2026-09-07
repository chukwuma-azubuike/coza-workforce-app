import React, { useMemo, useState } from 'react';
import { View, ScrollView, LayoutChangeEvent } from 'react-native';
import Svg, { G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card';
import { Text } from '~/components/ui/text';
import { cn } from '~/lib/utils';
import { useColorScheme } from '~/lib/useColorScheme';
import Legend from './Legend';
import Loading from '~/components/atoms/loading';
import {
    FUNNEL_SERIES,
    FunnelKey,
    buildYTicks,
    chartTheme,
    formatCompactNumber,
    roundedTopRectPath,
    truncateLabel,
} from './chart-utils';

interface ZoneData {
    zone: string;
    zoneId?: string;
    invited: number;
    attended: number;
    discipled: number;
    joined: number;
    conversion?: number;
    [key: string]: string | number | undefined;
}

interface ZonePerformanceChartProps {
    data: ZoneData[];
    isLoading?: boolean;
}

const TOP_PAD = 14;
const PLOT_H = 230;
const X_LABEL_H = 52;
const Y_AXIS_W = 42;
const SVG_H = TOP_PAD + PLOT_H + X_LABEL_H;

const BAR_W = 12;
const INNER_GAP = 5;
const GROUP_W = 96; // stable per-zone slot so toggling series doesn't reflow the axis
const SIDE_INSET = 10;

export function ZonePerformanceChart({ data, isLoading }: ZonePerformanceChartProps) {
    const { isDarkColorScheme } = useColorScheme();
    const theme = chartTheme(isDarkColorScheme);

    const [hidden, setHidden] = useState<Set<FunnelKey>>(new Set());
    const [selected, setSelected] = useState<number | null>(null);
    const [plotAreaWidth, setPlotAreaWidth] = useState(0);

    const zones = useMemo(() => data ?? [], [data]);
    const visibleSeries = useMemo(() => FUNNEL_SERIES.filter(s => !hidden.has(s.key)), [hidden]);

    const toggleSeries = (key: FunnelKey) =>
        setHidden(prev => {
            const next = new Set(prev);
            // keep at least one series visible
            if (next.has(key)) next.delete(key);
            else if (prev.size < FUNNEL_SERIES.length - 1) next.add(key);
            return next;
        });

    const yTicks = useMemo(() => {
        const rawMax = Math.max(0, ...zones.flatMap(z => visibleSeries.map(s => Number(z[s.key]) || 0)));
        return buildYTicks(rawMax, 4);
    }, [zones, visibleSeries]);
    const yMax = yTicks[yTicks.length - 1] || 1;

    const topByConversion = useMemo(() => {
        if (!zones.length) return 0;
        let best = 0;
        zones.forEach((z, i) => {
            const score = z.conversion ?? z.joined ?? 0;
            const bestScore = zones[best].conversion ?? zones[best].joined ?? 0;
            if (score > bestScore) best = i;
        });
        return best;
    }, [zones]);

    const activeIndex = selected != null && selected < zones.length ? selected : topByConversion;
    const activeZone = zones[activeIndex];

    const contentWidth = Math.max(plotAreaWidth, zones.length * GROUP_W + SIDE_INSET * 2);
    const yAt = (v: number) => TOP_PAD + PLOT_H - (v / yMax) * PLOT_H;

    const onPlotLayout = (e: LayoutChangeEvent) => setPlotAreaWidth(e.nativeEvent.layout.width);

    return (
        <Card>
            {isLoading && (
                <Loading className="z-50 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            )}
            <CardHeader className="pb-2">
                <CardTitle>Zone Performance Comparison</CardTitle>
                <Text className="text-sm text-muted-foreground">Tap a zone to see its full funnel breakdown</Text>
            </CardHeader>

            <View className="px-6">
                <Legend hidden={hidden} onToggle={toggleSeries} />
            </View>

            <CardContent className={cn('p-0 pb-4')}>
                {zones.length === 0 ? (
                    <View style={{ height: 160 }} className="items-center justify-center px-6">
                        <Text className="text-muted-foreground">No zone data for this period.</Text>
                    </View>
                ) : (
                    <>
                        <View className="flex-row">
                            {/* Fixed y-axis */}
                            <Svg width={Y_AXIS_W} height={SVG_H}>
                                {yTicks.map((v, i) => (
                                    <SvgText
                                        key={`yl-${i}`}
                                        x={Y_AXIS_W - 6}
                                        y={yAt(v) + 3}
                                        fontSize={9}
                                        fill={theme.axisText}
                                        textAnchor="end"
                                    >
                                        {formatCompactNumber(v)}
                                    </SvgText>
                                ))}
                            </Svg>

                            {/* Scrollable plot */}
                            <View className="flex-1" onLayout={onPlotLayout}>
                                <ScrollView horizontal scrollEventThrottle={16} showsHorizontalScrollIndicator={false}>
                                    <Svg width={contentWidth} height={SVG_H}>
                                        {/* Gridlines */}
                                        {yTicks.map((v, i) => (
                                            <Line
                                                key={`grid-${i}`}
                                                x1={0}
                                                x2={contentWidth}
                                                y1={yAt(v)}
                                                y2={yAt(v)}
                                                stroke={v === 0 ? theme.baseline : theme.grid}
                                                strokeWidth={1}
                                            />
                                        ))}

                                        {zones.map((zone, i) => {
                                            const slotX = SIDE_INSET + i * GROUP_W;
                                            const centerX = slotX + GROUP_W / 2;
                                            const innerW =
                                                visibleSeries.length * BAR_W + (visibleSeries.length - 1) * INNER_GAP;
                                            const startX = centerX - innerW / 2;
                                            const isActive = i === activeIndex;

                                            return (
                                                <G key={zone.zoneId ?? `${zone.zone}-${i}`}>
                                                    {/* Selection band */}
                                                    {isActive && (
                                                        <Rect
                                                            x={slotX + 3}
                                                            y={TOP_PAD - 4}
                                                            width={GROUP_W - 6}
                                                            height={PLOT_H + 8}
                                                            rx={12}
                                                            fill={isDarkColorScheme ? '#A855F7' : '#6B079C'}
                                                            opacity={0.08}
                                                        />
                                                    )}

                                                    {/* Bars */}
                                                    {visibleSeries.map((s, j) => {
                                                        const value = Number(zone[s.key]) || 0;
                                                        const h = (value / yMax) * PLOT_H;
                                                        const x = startX + j * (BAR_W + INNER_GAP);
                                                        const y = TOP_PAD + PLOT_H - h;
                                                        return (
                                                            <Path
                                                                key={s.key}
                                                                d={roundedTopRectPath(x, y, BAR_W, h, 4)}
                                                                fill={s.color}
                                                                opacity={isActive ? 1 : 0.85}
                                                            />
                                                        );
                                                    })}

                                                    {/* Zone label */}
                                                    <SvgText
                                                        x={centerX}
                                                        y={TOP_PAD + PLOT_H + 18}
                                                        fontSize={10}
                                                        fontWeight={isActive ? '700' : '400'}
                                                        fill={
                                                            isActive
                                                                ? isDarkColorScheme
                                                                    ? '#E9D5FF'
                                                                    : '#6B079C'
                                                                : theme.axisText
                                                        }
                                                        textAnchor="middle"
                                                    >
                                                        {truncateLabel(zone.zone, 11)}
                                                    </SvgText>
                                                    {/* {zone.conversion != null && (
                                                        <SvgText
                                                            x={centerX}
                                                            y={TOP_PAD + PLOT_H + 32}
                                                            fontSize={9}
                                                            fill={theme.axisText}
                                                            textAnchor="middle"
                                                        >
                                                            {`${Math.round(zone.conversion)}% conv.`}
                                                        </SvgText>
                                                    )} */}

                                                    {/* Tap target */}
                                                    <Rect
                                                        x={slotX}
                                                        y={TOP_PAD}
                                                        width={GROUP_W}
                                                        height={PLOT_H + X_LABEL_H}
                                                        fill="transparent"
                                                        onPress={() => setSelected(i)}
                                                    />
                                                </G>
                                            );
                                        })}
                                    </Svg>
                                </ScrollView>
                            </View>
                        </View>

                        {/* Detail panel for the active zone */}
                        {activeZone && (
                            <View className="mx-6 mt-3 rounded-2xl border border-border bg-muted/40 p-3 gap-2">
                                <View className="flex-row items-center justify-between">
                                    <Text className="text-base font-bold text-foreground flex-1" numberOfLines={1}>
                                        {activeZone.zone}
                                    </Text>
                                    {/* {activeZone.conversion != null && (
                                        <View className="rounded-full bg-primary/10 px-2.5 py-1">
                                            <Text className="text-xs font-bold text-primary">
                                                {Math.round(activeZone.conversion)}% conversion
                                            </Text>
                                        </View>
                                    )} */}
                                </View>
                                <View className="flex-row flex-wrap gap-x-5 gap-y-1.5">
                                    {FUNNEL_SERIES.map(s => (
                                        <View key={s.key} className="flex-row items-center gap-1.5">
                                            <View
                                                className="w-2.5 h-2.5 rounded-full"
                                                style={{ backgroundColor: s.color }}
                                            />
                                            <Text className="text-sm text-foreground">
                                                <Text className="font-bold">
                                                    {(Number(activeZone[s.key]) || 0).toLocaleString()}
                                                </Text>{' '}
                                                <Text className="text-muted-foreground">{s.label}</Text>
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}
