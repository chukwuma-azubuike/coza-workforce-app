import React from 'react';
import { Pie, PolarChart } from 'victory-native';
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card';
import { DATA } from './data';
import { useFont } from '@shopify/react-native-skia';
import NexaExtraLight from '~/assets/fonts/Nexa-ExtraLight.ttf';

interface DistributionChartProps {
    data: Array<{
        name: string;
        value: number;
        color: string;
    }>;
}

export function DistributionChart({ data }: DistributionChartProps) {
    const font = useFont(NexaExtraLight, 14);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Guest Distribution by Stage</CardTitle>
            </CardHeader>
            <CardContent style={{ height: 300 }}>
                <PolarChart data={data ?? DATA} labelKey="name" valueKey="value" colorKey="color">
                    <Pie.Chart>
                        {() => (
                            <>
                                <Pie.Slice>
                                    <Pie.Label font={font} color="#FFF" />
                                </Pie.Slice>

                                <Pie.SliceAngularInset
                                    angularInset={{
                                        angularStrokeWidth: 0.7,
                                        angularStrokeColor: '#FFF',
                                    }}
                                />
                            </>
                        )}
                    </Pie.Chart>
                </PolarChart>
            </CardContent>
        </Card>
    );
}
