import React, { useMemo } from 'react';
import { CartesianChart, Line, useChartPressState } from 'victory-native';
import { Circle, useFont } from '@shopify/react-native-skia';
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card';
import NexaHeavy from '~/assets/fonts/Nexa-Heavy.ttf';
import Legend from './Legend';
import dayjs from 'dayjs';

interface TrendChartProps {
    date: string;
    data: Array<{
        month: string;
        newGuests: number;
        invited: number;
        attended: number;
        discipled: number;
        joined: number;
    }>;
}

export function TrendChart({ data, date }: TrendChartProps) {
    const font = useFont(NexaHeavy, 12);
    const { state, isActive } = useChartPressState({ x: 0, y: { value: 0, x: 0, y: 0 } });

    const transformedData = useMemo(() => {
        return data?.map((item, index) => ({
            // x: dayjs().add(index, 'hour').unix(),
            value: item.newGuests,
            y: item.newGuests,
            invited: item.invited,
            attended: item.attended,
            discipled: item.discipled,
            joined: item.joined,
        }));
    }, [data]);

    if (!font) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Monthly Trends</CardTitle>
                <CardTitle className="text-sm text-muted-foreground">{date}</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
                <Legend />
                <CartesianChart
                    // xKey="x"
                    data={transformedData}
                    yKeys={['value', 'invited', 'attended', 'discipled', 'joined']}
                    padding={{ left: 10, right: 10, bottom: -40, top: 10 }}
                    domainPadding={{ left: 20, right: 20, top: 30, bottom: 30 }}
                    chartPressState={state}
                    axisOptions={{
                        font: font,
                        tickCount: data.length,
                        labelColor: '#6B7280',
                        lineColor: 'hsla(0, 0%, 0%, 0.25)',
                        formatXLabel: value => dayjs(value).format('MMM YYYY'), // or 'MMM'
                        formatYLabel: value => value.toString(),
                        labelOffset: { x: 5, y: 8 },
                    }}
                >
                    {({ points }) => (
                        <>
                            {/* Curved Lines with spring animation */}
                            <Line
                                points={points.attended}
                                color={'#3B82F6'}
                                strokeWidth={2}
                                curveType="catmullRom"
                                animate={{ type: 'spring', damping: 15, stiffness: 100 }}
                            />
                            <Line
                                points={points.joined}
                                color="#10B981"
                                strokeWidth={2}
                                curveType="catmullRom"
                                animate={{ type: 'spring', damping: 15, stiffness: 100 }}
                            />
                            <Line
                                points={points.discipled}
                                color="#8B5CF6"
                                strokeWidth={2}
                                curveType="catmullRom"
                                animate={{ type: 'spring', damping: 15, stiffness: 100 }}
                            />
                            <Line
                                points={points.invited}
                                color="#bcbcbc"
                                strokeWidth={2}
                                curveType="catmullRom"
                                animate={{ type: 'spring', damping: 15, stiffness: 100 }}
                            />

                            {/* Nodes with white border for better visibility */}
                            {points.attended.map((point, index) => (
                                <React.Fragment key={`value-${index}`}>
                                    <Circle cx={point.x} cy={point.y as any} r={5} color="#FFFFFF" />
                                    <Circle cx={point.x} cy={point.y as any} r={3} color="#3B82F6" />
                                </React.Fragment>
                            ))}

                            {points.joined.map((point, index) => (
                                <React.Fragment key={`x-${index}`}>
                                    <Circle cx={point.x} cy={point.y as any} r={5} color="#FFFFFF" />
                                    <Circle cx={point.x} cy={point.y as any} r={3} color="#10B981" />
                                </React.Fragment>
                            ))}

                            {points.discipled.map((point, index) => (
                                <React.Fragment key={`y-${index}`}>
                                    <Circle cx={point.x} cy={point.y as any} r={5} color="#FFFFFF" />
                                    <Circle cx={point.x} cy={point.y as any} r={3} color="#8B5CF6" />
                                </React.Fragment>
                            ))}

                            {points.invited.map((point, index) => (
                                <React.Fragment key={`y-${index}`}>
                                    <Circle cx={point.x} cy={point.y as any} r={5} color="#FFFFFF" />
                                    <Circle cx={point.x} cy={point.y as any} r={3} color="#bcbcbc" />
                                </React.Fragment>
                            ))}

                            {/* Interactive hover indicators */}
                            {isActive && (
                                <>
                                    <Circle
                                        cx={state.x.position}
                                        cy={state.y.value.position}
                                        r={10}
                                        color="#3B82F6"
                                        opacity={0.3}
                                    />
                                    <Circle
                                        cx={state.x.position}
                                        cy={state.y.x.position}
                                        r={10}
                                        color="#10B981"
                                        opacity={0.3}
                                    />
                                    <Circle
                                        cx={state.x.position}
                                        cy={state.y.y.position}
                                        r={10}
                                        color="#8B5CF6"
                                        opacity={0.3}
                                    />
                                </>
                            )}
                        </>
                    )}
                </CartesianChart>
            </CardContent>
        </Card>
    );
}
