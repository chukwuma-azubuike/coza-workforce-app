import React from 'react';
import { View } from 'react-native';
import { CartesianChart, BarGroup } from 'victory-native';
import { useFont } from '@shopify/react-native-skia';
import NexaExtraLight from '~/assets/fonts/Nexa-ExtraLight.ttf';
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card';
import { cn } from '~/lib/utils';
import { DATA } from './data';
import { useColorScheme } from '~/lib/useColorScheme';

interface ZoneData {
    zone: string;
    invited: number;
    attended: number;
    discipled: number;
    joined: number;
    [key: string]: string | number;
}

interface ZonePerformanceChartProps {
    data: ZoneData[];
}

export function ZonePerformanceChart({ data }: ZonePerformanceChartProps) {
    const chartHeight = 400;
    const colors = ['#3B82F6', '#10B981', '#8B5CF6', '#6B7280'];
    const { isDarkColorScheme } = useColorScheme();

    // Load the font for the axis labels
    const font = useFont(NexaExtraLight, 12);

    // Wait for font to load before rendering chart
    if (!font) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Zone Performance Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                    <View style={{ height: chartHeight, justifyContent: 'center', alignItems: 'center' }}>
                        {/* You can add a loading indicator here if desired */}
                    </View>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Zone Performance Comparison</CardTitle>
            </CardHeader>
            <CardContent className={cn('p-0')}>
                <View style={{ height: chartHeight }}>
                    <CartesianChart
                        xKey="label"
                        data={DATA ?? data}
                        domain={{ y: [0, 50] }}
                        yKeys={['x', 'y', 'z', 'value']}
                        padding={{ left: 10, right: 10, bottom: 10, top: 10 }}
                        domainPadding={{ left: 50, right: 50, top: 30 }}
                        axisOptions={{
                            font: font,
                            tickCount: 5,
                            lineWidth: 0.15,
                            lineColor: isDarkColorScheme ? '#FFF' : '#000',
                            labelColor: isDarkColorScheme ? '#FFF' : '#000',
                        }}
                    >
                        {({ points, chartBounds }) => (
                            <BarGroup chartBounds={chartBounds} betweenGroupPadding={0.4} withinGroupPadding={0.1}>
                                <BarGroup.Bar points={points.x} color={colors[0]} />
                                <BarGroup.Bar points={points.y} color={colors[1]} />
                                <BarGroup.Bar points={points.z} color={colors[2]} />
                                <BarGroup.Bar points={points.value} color={colors[3]} />
                            </BarGroup>
                        )}
                    </CartesianChart>
                </View>
            </CardContent>
        </Card>
    );
}
