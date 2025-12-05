import React from 'react';
import { Pie, PolarChart } from 'victory-native';
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card';
import { useFont } from '@shopify/react-native-skia';
import NexaExtraLight from '~/assets/fonts/Nexa-ExtraLight.ttf';
import Empty from '~/components/atoms/empty';

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
        <Card className="flex-1">
            <CardHeader>
                <CardTitle>Guest Distribution by Stage</CardTitle>
            </CardHeader>
            <CardContent style={{ height: 300 }}>
                {data.length > 0 ? (
                    <PolarChart data={data} labelKey="name" valueKey="value" colorKey="color">
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
                ) : (
                    <Empty width={200} />
                )}
            </CardContent>
        </Card>
    );
}
