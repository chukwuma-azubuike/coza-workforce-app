import { TrendingUp, TrendingDown, Minus } from 'lucide-react-native';
import { TrendDirection } from '~/store/types';
import { View } from 'react-native';
import { Text } from '~/components/ui/text';
import useZoneIndex from '../../hooks/use-zone-index';

interface TopPerformerCardProps {
    name: string;
    zoneId: string;
    scores: number;
    conversions: number;
    trend: TrendDirection;
    rank: number;
}

export function TopPerformerCard({ name, zoneId, scores, conversions, trend, rank }: TopPerformerCardProps) {
    const zoneIndex = useZoneIndex();
    return (
        <View className="flex-row items-center justify-between p-3 bg-gray-50 dark:bg-muted-background rounded-xl">
            <View className="flex-row items-center gap-3">
                <View className="w-8 h-8 bg-blue-500 dark:bg-blue-500/20 rounded-full flex-row items-center justify-center text-white font-medium">
                    <Text>{rank}</Text>
                </View>
                <View>
                    <Text className="font-medium">{name}</Text>
                    <Text className="text-base text-muted-foreground">
                        {zoneIndex[zoneId]} {zoneId ? 'Zone' : 'Worker'}
                    </Text>
                </View>
            </View>
            <View className="text-right">
                {scores && <Text className="font-medium">{scores ?? 0} Points</Text>}
                {typeof scores === 'undefined' && <Text className="font-medium">{conversions ?? 0}% Conversion</Text>}
                <View className="flex-row justify-end gap-1">
                    {trend === TrendDirection.UP ? (
                        <TrendingUp color="green" />
                    ) : trend === TrendDirection.DOWN ? (
                        <TrendingDown color="red" />
                    ) : (
                        <Minus color="grey" />
                    )}
                </View>
            </View>
        </View>
    );
}
