import { Text } from "~/components/ui/text";
import React from 'react';
import { THEME_CONFIG } from '@config/appConfig';
import { TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const CampusTicketSummary: React.FC<{ tickets?: number }> = React.memo(({ tickets }) => {
    const handleNavigation = () => {
        router.push({ pathname: '/tickets', params: { tab: 'campus' } });
    };

    return (
        <TouchableOpacity activeOpacity={0.6} onPress={handleNavigation}>
            <View className="items-baseline flex-row justify-center py-2">
                <View className="items-center flex-row">
                    <Ionicons name="ticket" color={THEME_CONFIG.rose} type="material-community" size={18} />
                    <Text className="text-muted-foreground ml-2">Tickets issued:</Text>
                </View>
                <View className="items-center flex-row">
                    <Text className="font-semibold text-rose-400 text-5xl ml-1">{`${tickets || 0}`}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
});

export { CampusTicketSummary };
