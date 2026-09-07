import React, { useMemo, useState } from 'react';
import { View, Pressable } from 'react-native';
import Svg, { G, Path, Rect, Text as SvgText } from 'react-native-svg';
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card';
import { Text } from '~/components/ui/text';
import { useColorScheme } from '~/lib/useColorScheme';
import Empty from '~/components/atoms/empty';
import Loading from '~/components/atoms/loading';
import { donutSlicePath, polarToCartesian, stageColor } from './chart-utils';

interface DistributionChartProps {
    isLoading?: boolean;
    data: Array<{
        name: string;
        value: number;
        color: string;
    }>;
}

const SIZE = 220;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R_OUTER = 100;
const R_INNER = 62;
const EXPLODE = 7;

export function DistributionChart({ data, isLoading }: DistributionChartProps) {
    const { isDarkColorScheme } = useColorScheme();
    const [selected, setSelected] = useState<number | null>(null);

    const cardBg = isDarkColorScheme ? '#18181B' : '#FFFFFF';
    const centerText = isDarkColorScheme ? '#FAFAFA' : '#18181B';
    const subText = isDarkColorScheme ? '#A1A1AA' : '#71717A';

    const slices = useMemo(() => {
        const items = (data ?? []).filter(d => (Number(d.value) || 0) > 0);
        const total = items.reduce((sum, d) => sum + (Number(d.value) || 0), 0) || 1;

        let cursor = 0;
        return items.map((item, i) => {
            const value = Number(item.value) || 0;
            const angle = (value / total) * 360;
            const startAngle = cursor;
            const endAngle = cursor + angle;
            cursor = endAngle;
            return {
                ...item,
                value,
                index: i,
                startAngle,
                endAngle,
                percent: Math.round((value / total) * 100),
                color: stageColor(item.name, item.color, i),
            };
        });
    }, [data]);

    const total = useMemo(() => slices.reduce((sum, s) => sum + s.value, 0), [slices]);

    const active = selected != null ? slices[selected] : undefined;

    return (
        <Card className="flex-1">
            {isLoading && (
                <Loading className="z-50 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            )}
            <CardHeader className="pb-2">
                <CardTitle>Guest Distribution by Stage</CardTitle>
                <Text className="text-sm text-muted-foreground">Tap a stage to focus it</Text>
            </CardHeader>

            <CardContent className="pt-2">
                {slices.length > 0 ? (
                    <View className="gap-4">
                        {/* Donut */}
                        <View className="items-center">
                            <Svg width={SIZE} height={SIZE}>
                                {/* Background: tapping outside the sectors (center hole / corners) resets focus */}
                                <Rect
                                    x={0}
                                    y={0}
                                    width={SIZE}
                                    height={SIZE}
                                    fill="transparent"
                                    onPress={() => setSelected(null)}
                                />
                                {slices.map(s => {
                                    const isActive = selected === s.index;
                                    const dimmed = selected != null && !isActive;
                                    const mid = (s.startAngle + s.endAngle) / 2;
                                    const dir = polarToCartesian(0, 0, 1, mid);
                                    const dx = isActive ? dir.x * EXPLODE : 0;
                                    const dy = isActive ? dir.y * EXPLODE : 0;

                                    return (
                                        <G key={`${s.name}-${s.index}`} transform={`translate(${dx} ${dy})`}>
                                            <Path
                                                d={donutSlicePath(
                                                    CX,
                                                    CY,
                                                    isActive ? R_OUTER + 3 : R_OUTER,
                                                    R_INNER,
                                                    s.startAngle,
                                                    s.endAngle
                                                )}
                                                fill={s.color}
                                                opacity={dimmed ? 0.35 : 1}
                                                stroke={cardBg}
                                                strokeWidth={2}
                                                strokeLinejoin="round"
                                                onPress={() => setSelected(prev => (prev === s.index ? null : s.index))}
                                            />
                                        </G>
                                    );
                                })}

                                {/* Center label */}
                                <SvgText
                                    x={CX}
                                    y={active ? CY - 10 : CY - 4}
                                    fontSize={active ? 16 : 14}
                                    fill={subText}
                                    textAnchor="middle"
                                >
                                    {active ? active.name : 'Total Guests'}
                                </SvgText>
                                <SvgText
                                    x={CX}
                                    y={active ? CY + 14 : CY + 18}
                                    fontSize={26}
                                    fontWeight="700"
                                    fill={centerText}
                                    textAnchor="middle"
                                >
                                    {(active ? active.value : total).toLocaleString()}
                                </SvgText>
                                {active && (
                                    <SvgText x={CX} y={CY + 32} fontSize={14} fill={active.color} textAnchor="middle">
                                        {`${active.percent}% of total`}
                                    </SvgText>
                                )}
                            </Svg>
                        </View>

                        {/* Legend */}
                        <View className="flex-row flex-wrap gap-y-2">
                            {slices.map(s => {
                                const isActive = selected === s.index;
                                return (
                                    <Pressable
                                        key={`legend-${s.name}-${s.index}`}
                                        className="w-1/2 pr-2"
                                        onPress={() => setSelected(prev => (prev === s.index ? null : s.index))}
                                    >
                                        <View
                                            className={
                                                'flex-row items-center gap-2 rounded-xl px-2 py-1.5 ' +
                                                (isActive ? 'bg-muted/60' : '')
                                            }
                                        >
                                            <View
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: s.color }}
                                            />
                                            <View className="flex-1">
                                                <Text
                                                    className="text-base text-foreground"
                                                    numberOfLines={1}
                                                    style={isActive ? { fontWeight: '700' } : undefined}
                                                >
                                                    {s.name}
                                                </Text>
                                                <Text className="text-sm text-muted-foreground">
                                                    {s.value.toLocaleString()} · {s.percent}%
                                                </Text>
                                            </View>
                                        </View>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </View>
                ) : (
                    <View style={{ height: 260 }} className="items-center justify-center">
                        <Empty width={200} />
                    </View>
                )}
            </CardContent>
        </Card>
    );
}
