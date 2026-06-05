import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Text } from '~/components/ui/text';
import { Card } from '~/components/ui/card';
import { THEME_CONFIG } from '@config/appConfig';

interface QuickActionTileProps {
    label: string;
    iconName: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    badge?: number;
}

const QuickActionTile: React.FC<QuickActionTileProps> = ({ label, iconName, onPress, badge }) => (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress} className="flex-1">
        <Card className="items-center gap-2 py-4 bg-muted-background">
            <View className="relative w-10 h-10 rounded-full bg-secondary items-center justify-center">
                <Ionicons name={iconName} size={19} color={THEME_CONFIG.primary} />
                {!!badge && (
                    <View className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive items-center justify-center">
                        <Text className="text-sm text-white font-bold leading-none">
                            {badge > 9 ? '9+' : `${badge}`}
                        </Text>
                    </View>
                )}
            </View>
            <Text className="text-sm font-medium text-center text-foreground">{label}</Text>
        </Card>
    </TouchableOpacity>
);

export interface CPQuickActionsProps {
    pendingCount?: number;
}

const CPQuickActions: React.FC<CPQuickActionsProps> = ({ pendingCount }) => (
    <View className="gap-3">
        <Text className="!text-base font-semibold">Quick Actions</Text>
        <View className="flex-row gap-3">
            <QuickActionTile
                label="Reports"
                iconName="document-text-outline"
                badge={pendingCount}
                onPress={() => router.push('/reports' as any)}
            />
            <QuickActionTile
                label="Permissions"
                iconName="shield-checkmark-outline"
                onPress={() => router.push('/permissions' as any)}
            />
            <QuickActionTile
                label="Tickets"
                iconName="ticket-outline"
                onPress={() => router.push({ pathname: '/tickets', params: { tab: 'campus' } } as any)}
            />
            <QuickActionTile
                label="Clock in"
                iconName="people-outline"
                onPress={() => router.push('/manual-clock-in' as any)}
            />
        </View>
    </View>
);

export default React.memo(CPQuickActions);
