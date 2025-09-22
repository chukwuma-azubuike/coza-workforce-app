import React from 'react';
import { Pie, PolarChart } from 'victory-native';
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card';
import { DATA } from './data';
import { ScreenWidth } from '@rneui/base';

interface DistributionChartProps {
    data: Array<{
        name: string;
        value: number;
        color: string;
    }>;
}

export function DistributionChart({ data }: DistributionChartProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Guest Distribution by Stage</CardTitle>
            </CardHeader>
            <CardContent style={{ height: 300 }}>
                {/* <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </RechartsPieChart>
                </ResponsiveContainer> */}

                <PolarChart
                    data={DATA} // 👈 specify your data
                    labelKey={'label'} // 👈 specify data key for labels
                    valueKey={'value'} // 👈 specify data key for values
                    colorKey={'color'} // 👈 specify data key for color
                >
                    <Pie.Chart size={ScreenWidth - 200} />
                </PolarChart>
            </CardContent>
        </Card>
    );
}
