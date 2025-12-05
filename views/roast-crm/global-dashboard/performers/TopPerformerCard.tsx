import { TrendingUp, TrendingDown } from 'lucide-react-native';
import { TrendDirection } from '~/store/types';
import { View } from 'react-native';
import { Text } from '~/components/ui/text';
import useZoneIndex from '../../hooks/use-zone-index';

interface TopPerformerCardProps {
    name: string;
    zoneId: string;
    conversions: number;
    trend: TrendDirection;
    rank: number;
}

export function TopPerformerCard({ name, zoneId, conversions, trend, rank }: TopPerformerCardProps) {
    const zoneIndex = useZoneIndex();
    return (
        <View className="flex-row items-center justify-between p-3 bg-gray-50 dark:bg-muted-background rounded-xl">
            <View className="flex-row items-center gap-3">
                <View className="w-8 h-8 bg-blue-500 dark:bg-blue-500/20 rounded-full flex-row items-center justify-center text-white font-medium">
                    <Text>{rank}</Text>
                </View>
                <View>
                    <Text className="font-medium">{name}</Text>
                    <Text className="text-base text-muted-foreground">{zoneIndex[zoneId]} Zone</Text>
                </View>
            </View>
            <View className="text-right">
                <Text className="font-medium">{conversions ?? 0} conversions</Text>
                <View className="flex-row items-center gap-1">
                    {trend === TrendDirection.UP ? (
                        <TrendingUp color="green" />
                    ) : trend === TrendDirection.DOWN ? (
                        <TrendingDown color="red" />
                    ) : (
                        <View className="w-3 h-3 bg-muted-foreground rounded-full" />
                    )}
                    <Text className="text-sm text-muted-foreground">
                        {trend === TrendDirection.UP
                            ? 'Rising'
                            : trend === TrendDirection.DOWN
                            ? 'Declining'
                            : 'Stable'}
                    </Text>
                </View>
            </View>
        </View>
    );
}
