import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Text } from '~/components/ui/text';
import { THEME_CONFIG } from '@config/appConfig';
import { Card } from '~/components/ui/card';

interface QuickActionTileProps {
    label: string;
    iconName: string;
    onPress: () => void;
    badge?: number;
}

const QuickActionTile: React.FC<QuickActionTileProps> = ({ label, iconName, onPress, badge }) => (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress} className="flex-1">
        <Card className="items-center gap-2 py-4 bg-muted-background">
            <View className="relative w-10 h-10 rounded-full bg-secondary items-center justify-center">
                <Ionicons name={iconName as any} size={19} color={THEME_CONFIG.primary} />
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

const QUICK_ACTIONS = [
    { label: 'Reports', iconName: 'document-text-outline', href: '/reports/service-report' },
    { label: 'Permissions', iconName: 'shield-checkmark-outline', href: '/permissions' },
    { label: 'Workforce', iconName: 'people-outline', href: '/workforce' },
    { label: 'Approvals', iconName: 'clipboard-outline', href: '/gh-approvals' },
] as const;

interface GHQuickActionsProps {
    pendingCount?: number;
}

const GHQuickActions: React.FC<GHQuickActionsProps> = ({ pendingCount }) => (
    <View className="gap-3">
        <Text className="!text-base font-semibold">Quick Actions</Text>
        <View className="flex-row gap-3">
            {QUICK_ACTIONS.map(({ label, iconName, href }) => (
                <QuickActionTile
                    key={href}
                    label={label}
                    iconName={iconName}
                    onPress={() => router.push(href as any)}
                    badge={href === '/gh-approvals' ? pendingCount : undefined}
                />
            ))}
        </View>
    </View>
);

export default React.memo(GHQuickActions);
