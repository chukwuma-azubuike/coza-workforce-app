import React from 'react';
import { Pie, PolarChart } from 'victory-native';
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card';
import { useFont } from '@shopify/react-native-skia';
import NexaExtraLight from '~/assets/fonts/Nexa-ExtraLight.ttf';
import Empty from '~/components/atoms/empty';
import Loading from '~/components/atoms/loading';

interface DistributionChartProps {
    isLoading?: boolean;
    data: Array<{
        name: string;
        value: number;
        color: string;
    }>;
}

export function DistributionChart({ data, isLoading }: DistributionChartProps) {
    const font = useFont(NexaExtraLight, 13);

    const colorCodedData = data.map(item => ({
        ...item,
        color:
            item.name === 'Attended'
                ? '#4CAF50'
                : item.name === 'Discipled'
                  ? '#b821f3'
                  : item.name === 'Joined'
                    ? '#b5b5b5'
                    : '#2152f3',
    }));

    return (
        <Card className="flex-1">
            {isLoading && <Loading className="z-50 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />}
            <CardHeader>
                <CardTitle>Guest Distribution by Stage</CardTitle>
            </CardHeader>
            <CardContent style={{ height: 300 }}>
                {data.length > 0 ? (
                    <PolarChart data={colorCodedData} labelKey="name" valueKey="value" colorKey="color">
                        <Pie.Chart>
                            {() => (
                                <>
                                    <Pie.Slice>
                                        <Pie.Label font={font} color="#FFF" radiusOffset={0.7} />
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
