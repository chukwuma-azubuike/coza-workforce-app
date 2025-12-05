import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card';
import { TopPerformerCard } from './TopPerformerCard';
import { TopPerformer } from '~/store/types';
import { View } from 'react-native';

interface TopPerformersProps {
    performers: Array<TopPerformer>;
}

export function TopPerformingZones({ performers }: TopPerformersProps) {
    return (
        <Card className="flex-1">
            <CardHeader>
                <CardTitle>Top Performing Zones</CardTitle>
            </CardHeader>
            <CardContent>
                <View className="gap-3">
                    {performers.map((performer, index) => (
                        <TopPerformerCard key={performer.name} {...(performer as any)} rank={index + 1} />
                    ))}
                </View>
            </CardContent>
        </Card>
    );
}

export function TopPerformingWorkers({ performers }: TopPerformersProps) {
    return (
        <Card className="flex-1">
            <CardHeader>
                <CardTitle>Top Performing Workers</CardTitle>
            </CardHeader>
            <CardContent>
                <View className="gap-3">
                    {performers.map((performer, index) => (
                        <TopPerformerCard key={performer.name} {...(performer as any)} rank={index + 1} />
                    ))}
                </View>
            </CardContent>
        </Card>
    );
}
