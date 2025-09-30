import { Award, Medal, TrendingUp, Trophy } from 'lucide-react-native';
import { View } from 'react-native';

export const getRankIcon = (position: number) => {
    switch (position) {
        case 1:
            return <Trophy className="w-6 h-6 text-yellow-500" />;
        case 2:
            return <Medal className="w-6 h-6 text-gray-400" />;
        case 3:
            return <Award className="w-6 h-6 text-orange-500" />;
        default:
            return (
                <View className="w-6 h-6 flex-row items-center justify-center bg-gray-200 rounded-full text-sm font-medium">
                    {position}
                </View>
            );
    }
};

export const getTrendIcon = (trend: string) => {
    switch (trend) {
        case 'up':
            return <TrendingUp className="w-4 h-4 text-green-500" />;
        case 'down':
            return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
        default:
            return <View className="w-4 h-4 bg-gray-400 rounded-full" />;
    }
};
