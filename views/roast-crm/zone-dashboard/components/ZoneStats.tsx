import { View } from 'react-native';
import { Card, CardContent } from '~/components/ui/card';
import { Text } from '~/components/ui/text';

interface StatCardProps {
    value: number;
    label: string;
    color: string;
    valueUnit?: string;
}

export function StatCard({ value, label, color, valueUnit = '' }: StatCardProps) {
    return (
        <Card className="items-center !min-w-[20%] flex-1">
            <CardContent className="py-4 px-2">
                <Text className={`text-3xl font-bold text-center ${color}`}>
                    {value.toFixed(0) ?? 0}
                    {valueUnit}
                </Text>
                <Text className="text-foreground line-clamp- text-center">{label}</Text>
            </CardContent>
        </Card>
    );
}

interface ZoneStatsProps {
    totalGuests: number;
    conversionRate: number;
    activeThisWeek: number;
    totalWorkers: number;
}

export function ZoneStats({ totalGuests, conversionRate, activeThisWeek, totalWorkers }: ZoneStatsProps) {
    return (
        <View className="flex-row flex-wrap gap-4">
            <StatCard value={totalGuests} label="Total Guests" color="text-blue-600" />
            <StatCard value={conversionRate} label="Conversion Rate" color="text-green-600" valueUnit="%" />
            <StatCard value={activeThisWeek} label="Active This Week" color="text-purple-600" />
            <StatCard value={totalWorkers} label="Active Workers" color="text-orange-600" />
        </View>
    );
}
