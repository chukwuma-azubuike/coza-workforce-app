import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card';
import { TopPerformerCard } from './TopPerformerCard';
import { TopPerformer } from '~/store/types';
import { View } from 'react-native';
import { Text } from '~/components/ui/text';

interface TopPerformersProps {
    performers?: Array<TopPerformer> | null;
}

function PerformerList({ title, performers }: TopPerformersProps & { title: string }) {
    // The analytics endpoint has been seen returning a non-array here for some
    // zone/campus combinations, which a `?? []` at the call site doesn't catch.
    const rows = Array.isArray(performers) ? performers : [];

    return (
        <Card className="flex-1">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                {rows.length ? (
                    <View className="gap-3">
                        {rows.map((performer, index) => (
                            <TopPerformerCard key={performer?.name ?? index} {...(performer as any)} rank={index + 1} />
                        ))}
                    </View>
                ) : (
                    <Text className="text-muted-foreground py-4">No data for this selection yet.</Text>
                )}
            </CardContent>
        </Card>
    );
}

export function TopPerformingZones({ performers }: TopPerformersProps) {
    return <PerformerList title="Top Performing Zones" performers={performers} />;
}

export function TopPerformingWorkers({ performers }: TopPerformersProps) {
    return <PerformerList title="Top Performing Workers" performers={performers} />;
}
