import { Award, Medal, Minus, TrendingUp, Trophy } from 'lucide-react-native';
import { View } from 'react-native';
import { Text } from '~/components/ui/text';

export const getRankIcon = (position: number) => {
    switch (position) {
        case 1:
            return <Trophy className="w-6 h-6 text-yellow-500" color="orange" />;
        case 2:
            return <Medal className="w-6 h-6 text-gray-400" color="silver" />;
        case 3:
            return <Award className="w-6 h-6 text-orange-500" color="khaki" />;
        default:
            return (
                <View className="w-6 h-6 flex-row items-center justify-center bg-background rounded-full text-sm font-medium">
                    <Text>{position}</Text>
                </View>
            );
    }
};

export const getTrendIcon = (trend: string) => {
    switch (trend) {
        case 'up':
            return <TrendingUp className="w-4 h-4 text-green-500" color="green" />;
        case 'down':
            return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" color="red" />;
        default:
            return <Minus className="w-4 h-4 bg-gray-400 rounded-full" />;
    }
};
