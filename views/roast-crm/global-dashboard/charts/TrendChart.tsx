import React, { useMemo, useRef, useState } from 'react';
import { View, PanResponder, GestureResponderEvent, LayoutChangeEvent } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Line, Path, Stop, Text as SvgText } from 'react-native-svg';
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card';
import { Text } from '~/components/ui/text';
import { THEME_CONFIG } from '@config/appConfig';
import { useColorScheme } from '~/lib/useColorScheme';
import dayjs from 'dayjs';
import Legend from './Legend';
import Loading from '~/components/atoms/loading';
import {
    FUNNEL_SERIES,
    FunnelKey,
    XY,
    buildYTicks,
    catmullRomPath,
    chartTheme,
    formatCompactNumber,
    parseMonth,
    thinnedIndices,
} from './chart-utils';

interface TrendChartProps {
    date: string;
    isLoading?: boolean;
    data: Array<{
        month: string;
        newGuests: number;
        invited: number;
        attended: number;
        discipled: number;
        joined: number;
    }>;
}

const HEIGHT = 280;
const TOP_PAD = 16;
const X_LABEL_H = 22;
const Y_AXIS_W = 38;
const RIGHT_PAD = 14;
const PLOT_H = HEIGHT - TOP_PAD - X_LABEL_H;
const TOOLTIP_W = 156;

export function TrendChart({ data, date, isLoading }: TrendChartProps) {
    const { isDarkColorScheme } = useColorScheme();
    const theme = chartTheme(isDarkColorScheme);

    const [width, setWidth] = useState(0);
    const [hidden, setHidden] = useState<Set<FunnelKey>>(new Set());
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const months = useMemo(() => (data ?? []).map(d => parseMonth(d.month)), [data]);
    const visibleSeries = useMemo(() => FUNNEL_SERIES.filter(s => !hidden.has(s.key)), [hidden]);

    const toggleSeries = (key: FunnelKey) =>
        setHidden(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else if (prev.size < FUNNEL_SERIES.length - 1) next.add(key);
            return next;
        });

    const n = data?.length ?? 0;
    const plotW = Math.max(0, width - Y_AXIS_W - RIGHT_PAD);
    const baseY = TOP_PAD + PLOT_H;

    const yTicks = useMemo(() => {
        const rawMax = Math.max(
            0,
            ...(data ?? []).flatMap(d => visibleSeries.map(s => Number((d as any)[s.key]) || 0))
        );
        return buildYTicks(rawMax, 4);
    }, [data, visibleSeries]);
    const yMax = yTicks[yTicks.length - 1] || 1;

    const xAt = (i: number) => (n > 1 ? Y_AXIS_W + (i / (n - 1)) * plotW : Y_AXIS_W + plotW / 2);
    const yAt = (v: number) => TOP_PAD + PLOT_H - (v / yMax) * PLOT_H;

    // Per-series screen coordinates.
    const seriesCoords = useMemo(() => {
        return visibleSeries.map(s => ({
            ...s,
            coords: (data ?? []).map((d, i): XY => ({ x: xAt(i), y: yAt(Number((d as any)[s.key]) || 0) })),
        }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, visibleSeries, width, yMax]);

    // Branded backdrop under the topmost (largest) visible series.
    const envelope = useMemo(() => {
        if (!seriesCoords.length) return null;
        const totalOf = (key: FunnelKey) => (data ?? []).reduce((sum, d) => sum + (Number((d as any)[key]) || 0), 0);
        return [...seriesCoords].sort((a, b) => totalOf(b.key) - totalOf(a.key))[0];
    }, [seriesCoords, data]);

    // X-axis labels — evenly spaced, thinned to fit width, year shown at the ends when the range spans years.
    const maxXLabels = Math.max(2, Math.min(6, Math.floor(plotW / 56)));
    const xLabelIdx = useMemo(() => thinnedIndices(n, maxXLabels), [n, maxXLabels]);
    const multiYear = useMemo(() => new Set(months.map(m => m.year())).size > 1, [months]);

    const geomRef = useRef({ plotW: 0, n: 0 });
    geomRef.current = { plotW, n };

    const panResponder = useRef(
        PanResponder.create({
            // Let vertical page scroll pass through; only claim horizontal drags for scrubbing.
            onStartShouldSetPanResponder: () => false,
            onMoveShouldSetPanResponder: (_e, g) => Math.abs(g.dx) > Math.abs(g.dy) && Math.abs(g.dx) > 6,
            onPanResponderTerminationRequest: () => false,
            onPanResponderGrant: e => updateActive(e),
            onPanResponderMove: e => updateActive(e),
            onPanResponderRelease: () => setActiveIndex(null),
            onPanResponderTerminate: () => setActiveIndex(null),
        })
    ).current;

    const updateActive = (e: GestureResponderEvent) => {
        const { plotW: w, n: count } = geomRef.current;
        if (count <= 0 || w <= 0) return;
        const ratio = (e.nativeEvent.locationX - Y_AXIS_W) / w;
        const idx = Math.max(0, Math.min(count - 1, Math.round(ratio * (count - 1))));
        setActiveIndex(idx);
    };

    const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

    const activeRow = activeIndex != null ? data[activeIndex] : undefined;
    const tooltipLeft =
        activeIndex != null ? Math.max(4, Math.min(width - TOOLTIP_W - 4, xAt(activeIndex) - TOOLTIP_W / 2)) : 0;

    return (
        <Card>
            {isLoading && (
                <Loading className="absolute top-1/2 left-1/2 z-50 transform -translate-x-1/2 -translate-y-1/2" />
            )}
            <CardHeader className="pb-2">
                <CardTitle>Monthly Trends</CardTitle>
                <Text className="text-sm text-muted-foreground">{date}</Text>
            </CardHeader>

            <CardContent className="pt-0">
                <Legend hidden={hidden} onToggle={toggleSeries} />

                {n === 0 ? (
                    <View style={{ height: 160 }} className="items-center justify-center">
                        <Text className="text-muted-foreground">No trend data for this period.</Text>
                    </View>
                ) : (
                    <View onLayout={onLayout} style={{ height: HEIGHT }} {...panResponder.panHandlers}>
                        {width > 0 && (
                            <Svg width={width} height={HEIGHT}>
                                <Defs>
                                    <LinearGradient id="trendBackdrop" x1="0" y1="0" x2="0" y2="1">
                                        <Stop offset="0" stopColor={THEME_CONFIG.primary} stopOpacity={0.16} />
                                        <Stop offset="1" stopColor={THEME_CONFIG.primary} stopOpacity={0.01} />
                                    </LinearGradient>
                                </Defs>

                                {/* Gridlines + y labels */}
                                {yTicks.map((v, i) => (
                                    <React.Fragment key={`y-${i}`}>
                                        <Line
                                            x1={Y_AXIS_W}
                                            x2={Y_AXIS_W + plotW}
                                            y1={yAt(v)}
                                            y2={yAt(v)}
                                            stroke={v === 0 ? theme.baseline : theme.grid}
                                            strokeWidth={1}
                                        />
                                        <SvgText
                                            x={Y_AXIS_W - 6}
                                            y={yAt(v) + 3}
                                            fontSize={12}
                                            fill={theme.axisText}
                                            textAnchor="end"
                                        >
                                            {formatCompactNumber(v)}
                                        </SvgText>
                                    </React.Fragment>
                                ))}

                                {/* Backdrop area under the largest series */}
                                {envelope && n > 1 && (
                                    <Path
                                        d={`${catmullRomPath(envelope.coords)} L ${xAt(n - 1).toFixed(2)} ${baseY} L ${xAt(
                                            0
                                        ).toFixed(2)} ${baseY} Z`}
                                        fill="url(#trendBackdrop)"
                                    />
                                )}

                                {/* X-axis labels */}
                                {xLabelIdx.map(i => {
                                    const anchor = i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle';
                                    const m = months[i];
                                    const isEnd = i === xLabelIdx[0] || i === xLabelIdx[xLabelIdx.length - 1];
                                    const label = m ? (multiYear && isEnd ? m.format("MMM 'YY") : m.format('MMM')) : '';
                                    return (
                                        <SvgText
                                            key={`x-${i}`}
                                            x={xAt(i)}
                                            y={HEIGHT - 6}
                                            fontSize={12}
                                            fill={theme.axisText}
                                            textAnchor={anchor}
                                        >
                                            {label}
                                        </SvgText>
                                    );
                                })}

                                {/* Series lines */}
                                {seriesCoords.map(s => (
                                    <Path
                                        key={`line-${s.key}`}
                                        d={catmullRomPath(s.coords)}
                                        stroke={s.color}
                                        strokeWidth={2.5}
                                        fill="none"
                                        strokeLinejoin="round"
                                        strokeLinecap="round"
                                    />
                                ))}

                                {/* End-point dots + value callouts (hidden while scrubbing) */}
                                {activeIndex == null &&
                                    seriesCoords.map(s => {
                                        const last = s.coords[s.coords.length - 1];
                                        if (!last) return null;
                                        return (
                                            <React.Fragment key={`end-${s.key}`}>
                                                <Circle cx={last.x} cy={last.y} r={5} fill={theme.dotRing} />
                                                <Circle cx={last.x} cy={last.y} r={3} fill={s.color} />
                                                <SvgText
                                                    x={Math.min(last.x, Y_AXIS_W + plotW)}
                                                    y={Math.max(TOP_PAD + 8, last.y - 9)}
                                                    fontSize={12}
                                                    fontWeight="700"
                                                    fill={s.color}
                                                    textAnchor="end"
                                                >
                                                    {formatCompactNumber(Number((data[n - 1] as any)?.[s.key]) || 0)}
                                                </SvgText>
                                            </React.Fragment>
                                        );
                                    })}

                                {/* Scrub crosshair + active dots */}
                                {activeIndex != null && (
                                    <>
                                        <Line
                                            x1={xAt(activeIndex)}
                                            x2={xAt(activeIndex)}
                                            y1={TOP_PAD}
                                            y2={baseY}
                                            stroke={theme.crosshair}
                                            strokeWidth={1}
                                            strokeDasharray="4 4"
                                        />
                                        {seriesCoords.map(s => {
                                            const c = s.coords[activeIndex];
                                            if (!c) return null;
                                            return (
                                                <React.Fragment key={`active-${s.key}`}>
                                                    <Circle cx={c.x} cy={c.y} r={6} fill={theme.dotRing} />
                                                    <Circle cx={c.x} cy={c.y} r={4} fill={s.color} />
                                                </React.Fragment>
                                            );
                                        })}
                                    </>
                                )}
                            </Svg>
                        )}

                        {/* Scrub tooltip */}
                        {activeRow && (
                            <View
                                pointerEvents="none"
                                style={{ position: 'absolute', top: 0, left: tooltipLeft, width: TOOLTIP_W }}
                                className="rounded-xl border border-border bg-card p-2.5 shadow-lg"
                            >
                                <Text className="text-xs font-bold text-foreground mb-1">
                                    {months[activeIndex!]?.format('MMM YYYY')}
                                </Text>
                                {visibleSeries.map(s => (
                                    <View key={s.key} className="flex-row items-center justify-between gap-2 py-0.5">
                                        <View className="flex-row items-center gap-1.5 flex-1">
                                            <View
                                                className="w-2 h-2 rounded-full"
                                                style={{ backgroundColor: s.color }}
                                            />
                                            <Text className="text-xs text-muted-foreground">{s.label}</Text>
                                        </View>
                                        <Text className="text-xs font-bold text-foreground">
                                            {(Number((activeRow as any)[s.key]) || 0).toLocaleString()}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                )}
            </CardContent>
        </Card>
    );
}
