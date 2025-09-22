import React from 'react';
import { Card, CardContent } from '~/components/ui/card';
import { LucideIcon } from 'lucide-react-native';
import { Text } from '~/components/ui/text';
import { View } from 'react-native';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon?: LucideIcon;
    trend?: {
        value: number;
        label: string;
        direction: 'up' | 'down' | 'neutral';
    };
    iconColor?: string;
    className?: string;
}

export function StatsCard({
    title,
    value,
    icon: Icon,
    trend,
    iconColor = 'text-blue-500',
    className = '',
}: StatsCardProps) {
    return (
        <Card className={className}>
            <CardContent className="p-4">
                <View className="flex-row items-center justify-between">
                    <View className="gap-1 flex-1">
                        <Text className="text-foreground">{title}</Text>
                        <Text className="text-2xl font-bold">
                            {typeof value === 'number' ? value.toLocaleString() : value}
                        </Text>
                        {trend && (
                            <Text
                                className={`${
                                    trend.direction === 'up'
                                        ? 'text-green-600'
                                        : trend.direction === 'down'
                                        ? 'text-red-600'
                                        : 'text-gray-600'
                                }`}
                            >
                                {trend.value}
                                {trend.label}
                            </Text>
                        )}
                    </View>
                    {Icon && <Icon className={`w-8 h-8 flex-auto ${iconColor}`} />}
                </View>
            </CardContent>
        </Card>
    );
}
