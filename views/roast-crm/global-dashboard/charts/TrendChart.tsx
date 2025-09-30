import React from 'react';
import { View } from 'react-native';
import { CartesianChart, Line, useChartPressState } from 'victory-native';
import { Circle, useFont } from '@shopify/react-native-skia';
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card';
import { DATA } from './data';
import NexaHeavy from '~/assets/fonts/Nexa-Heavy.ttf';

interface TrendChartProps {
    data: Array<{
        month: string;
        newGuests: number;
        converted: number;
    }>;
}

export function TrendChart({ data }: TrendChartProps) {
    const font = useFont(NexaHeavy, 12);
    const { state, isActive } = useChartPressState({ x: 0, y: { value: 0, x: 0, y: 0 } });

    if (!font) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Monthly Trends</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
                <CartesianChart
                    xKey="y"
                    data={DATA ?? data}
                    yKeys={['value', 'x', 'y']}
                    padding={{ left: 10, right: 10, bottom: 10, top: 10 }}
                    domainPadding={{ left: 20, right: 20, top: 30, bottom: 30 }}
                    chartPressState={state}
                    axisOptions={{
                        font: font,
                        tickCount: 5,
                        labelColor: '#6B7280',
                        lineColor: 'hsla(0, 0%, 0%, 0.25)',
                        formatXLabel: value => value.toString(),
                        formatYLabel: value => Math.round(value).toString(),
                        labelOffset: { x: 5, y: 8 },
                    }}
                >
                    {({ points }) => (
                        <>
                            {/* Curved Lines with spring animation */}
                            <Line
                                points={points.value}
                                color="#3B82F6"
                                strokeWidth={2}
                                curveType="catmullRom"
                                animate={{ type: 'spring', damping: 15, stiffness: 100 }}
                            />
                            <Line
                                points={points.x}
                                color="#10B981"
                                strokeWidth={2}
                                curveType="catmullRom"
                                animate={{ type: 'spring', damping: 15, stiffness: 100 }}
                            />
                            <Line
                                points={points.y}
                                color="#8B5CF6"
                                strokeWidth={2}
                                curveType="catmullRom"
                                animate={{ type: 'spring', damping: 15, stiffness: 100 }}
                            />

                            {/* Nodes with white border for better visibility */}
                            {points.value.map((point, index) => (
                                <React.Fragment key={`value-${index}`}>
                                    <Circle cx={point.x} cy={point.y as any} r={5} color="#FFFFFF" />
                                    <Circle cx={point.x} cy={point.y as any} r={3} color="#3B82F6" />
                                </React.Fragment>
                            ))}

                            {points.x.map((point, index) => (
                                <React.Fragment key={`x-${index}`}>
                                    <Circle cx={point.x} cy={point.y as any} r={5} color="#FFFFFF" />
                                    <Circle cx={point.x} cy={point.y as any} r={3} color="#10B981" />
                                </React.Fragment>
                            ))}

                            {points.y.map((point, index) => (
                                <React.Fragment key={`y-${index}`}>
                                    <Circle cx={point.x} cy={point.y as any} r={5} color="#FFFFFF" />
                                    <Circle cx={point.x} cy={point.y as any} r={3} color="#8B5CF6" />
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
