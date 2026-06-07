import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Text } from '~/components/ui/text';
import { cn } from '~/lib/utils';

interface GroupByToggleProps {
    value: 'month' | 'service';
    onChange: (value: 'month' | 'service') => void;
}

const OPTIONS: { value: 'month' | 'service'; label: string }[] = [
    { value: 'month', label: 'Monthly' },
    { value: 'service', label: 'By Service' },
];

/** Compact segmented control for switching a trend between month- and service-level. */
const GroupByToggle: React.FC<GroupByToggleProps> = ({ value, onChange }) => (
    <View className="flex-row p-0.5 rounded-full bg-secondary self-start">
        {OPTIONS.map(o => {
            const active = o.value === value;
            return (
                <TouchableOpacity
                    key={o.value}
                    activeOpacity={0.7}
                    onPress={() => onChange(o.value)}
                    className={cn('px-3 h-8 rounded-full items-center justify-center', active && 'bg-background')}
                >
                    <Text className={cn('!text-[12px] font-semibold', active ? 'text-foreground' : 'text-muted-foreground')}>
                        {o.label}
                    </Text>
                </TouchableOpacity>
            );
        })}
    </View>
);

export default React.memo(GroupByToggle);
