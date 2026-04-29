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
            'h-8 px-3.5 rounded-full border items-center justify-center',
            active ? 'bg-primary border-primary' : 'bg-background border-border'
        )}
    >
        <Text
            className={cn(
                '!text-sm font-semibold',
                active ? 'text-primary-foreground dark:text-white' : 'text-foreground'
            )}
        >
            {children}
        </Text>
    </TouchableOpacity>
);

export default React.memo(FilterChip);
