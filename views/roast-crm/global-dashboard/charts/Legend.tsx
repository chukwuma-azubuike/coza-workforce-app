import React from 'react';
import { View, Text } from 'react-native';

const Legend: React.FC = () => {
    return (
        <View className="flex-row items-center gap-2 mb-3">
            <View className="flex-row items-center gap-2">
                <View className="w-3 h-3 rounded-full bg-[#6B7280]" />
                <Text className="text-sm text-foreground">Invited</Text>
            </View>
            <View className="flex-row items-center gap-2">
                <View className="w-3 h-3 rounded-full bg-[#3B82F6]" />
                <Text className="text-sm text-foreground">Attended</Text>
            </View>

            <View className="flex-row items-center gap-2">
                <View className="w-3 h-3 rounded-full bg-[#8B5CF6]" />
                <Text className="text-sm text-foreground">Being discipled</Text>
            </View>

            <View className="flex-row items-center gap-2">
                <View className="w-3 h-3 rounded-full bg-[#10B981]" />
                <Text className="text-sm text-foreground">Joined</Text>
            </View>
        </View>
    );
};

export default Legend;
