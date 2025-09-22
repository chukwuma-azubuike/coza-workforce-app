import React from 'react';
import { CartesianChart, Line } from 'victory-native';
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card';
import { DATA } from './data';

interface TrendChartProps {
    data: Array<{
        month: string;
        newGuests: number;
        converted: number;
    }>;
}

export function TrendChart({ data }: TrendChartProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Monthly Trends</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
                <CartesianChart data={DATA} xKey="y" yKeys={['value']}>
                    {({ points }) => (
                        <Line
                            strokeWidth={1}
                            color="#3B82F6"
                            points={points.value}
                            animate={{ type: 'timing', duration: 300 }}
                        />
                    )}
                </CartesianChart>
            </CardContent>
        </Card>
    );
}
