import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Text } from '~/components/ui/text';
import { cn } from '~/lib/utils';

interface FilterChipProps {
    active: boolean;
    onPress: () => void;
    children: string;
}

const FilterChip: React.FC<FilterChipProps> = ({ active, onPress, children }) => (
    <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        className={cn(
            'px-4 py-1 rounded-full border items-center justify-center',
            active ? 'bg-primary/20 border-primary' : 'bg-background border-border'
        )}
    >
        <Text
            className={cn(
                'font-semibold',
                active ? 'text-primary-foreground dark:text-white' : 'text-foreground'
            )}
        >
            {children}
        </Text>
    </TouchableOpacity>
);

export default React.memo(FilterChip);
