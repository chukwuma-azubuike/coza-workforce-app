import React from 'react';
import { View } from 'react-native';
import { Text } from './text';
import { Button } from './button';
import { cn } from '~/lib/utils';

interface EmptyStateProps {
    title?: string;
    description?: string;
    icon?: React.ReactNode;
    action?: {
        label: string;
        onPress: () => void;
    };
    style?: React.ComponentProps<typeof View>['style'];
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, icon, action, style }) => {
    return (
        <View style={[{ alignItems: 'center', justifyContent: 'center', padding: 16 }, style]}>
            {icon && <View style={{ marginBottom: 12 }}>{icon}</View>}
            {title && <Text className="font-bold text-lg text-center mb-2">{title}</Text>}
            {description && <Text className="text-sm text-muted-foreground text-center mb-4">{description}</Text>}
            {action && (
                <Button variant="outline" onPress={action.onPress}>
                    {action.label}
                </Button>
            )}
        </View>
    );
};
