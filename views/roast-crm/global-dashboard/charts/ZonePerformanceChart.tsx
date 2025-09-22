import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import { CartesianChart, BarGroup } from 'victory-native';
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card';
import { cn } from '~/lib/utils';
import { DATA } from './data';

interface ZoneData {
    zone: string;
    invited: number;
    attended: number;
    discipled: number;
    joined: number;
    [key: string]: string | number; // Index signature for dynamic access
}

interface ZonePerformanceChartProps {
    data: ZoneData[];
}

interface DatumType {
    datum: ZoneData;
}

export function ZonePerformanceChart({ data }: ZonePerformanceChartProps) {
    const { width } = useWindowDimensions();
    const chartWidth = width - 48; // Accounting for padding
    const chartHeight = 400;

    // Transform data for Victory's format
    const categories = ['invited', 'attended', 'discipled', 'joined'];
    const colors = ['#3B82F6', '#10B981', '#8B5CF6', '#6B7280'];

    // Get maximum value for Y axis
    const maxValue = Math.max(...data.flatMap(d => [d.invited, d.attended, d.discipled, d.joined]));

    return (
        <Card>
            <CardHeader>
                <CardTitle>Zone Performance Comparison</CardTitle>
            </CardHeader>
            <CardContent className={cn('p-0')}>
                <View style={{ height: chartHeight }}>
                    <CartesianChart data={DATA} xKey="label" yKeys={['x', 'y', 'z', 'value']}>
                        {({ points, chartBounds }) => (
                            <BarGroup chartBounds={chartBounds} betweenGroupPadding={0.3} withinGroupPadding={0.1}>
                                <BarGroup.Bar points={points.x} color={colors[0]} />
                                <BarGroup.Bar points={points.y} color={colors[1]} />
                                <BarGroup.Bar points={points.y} color={colors[2]} />
                                <BarGroup.Bar points={points.value} color={colors[3]} />
                            </BarGroup>
                        )}
                    </CartesianChart>
                </View>
            </CardContent>
        </Card>
    );
}
