import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { Text } from '~/components/ui/text';
import PickerSelect from '~/components/ui/picker-select';
import { ICampus } from '@store/types';
import { cn } from '~/lib/utils';
import { WINDOW_PRESETS } from '../lib';
import { IUseGspFilters } from '../use-gsp-filters';

interface FilterBarProps {
    filters: IUseGspFilters;
    campuses?: ICampus[];
    campusesLoading?: boolean;
}

const Chip: React.FC<{ label: string; active: boolean; onPress: () => void }> = ({ label, active, onPress }) => (
    <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        className={cn(
            'px-3.5 h-9 rounded-full items-center justify-center border',
            active ? 'bg-primary border-primary' : 'bg-background border-border'
        )}
    >
        <Text className={cn('text-sm font-semibold', active ? '!text-white' : 'text-muted-foreground')}>{label}</Text>
    </TouchableOpacity>
);

/**
 * One shared filter bar driving every section: reporting window (preset chips) +
 * campus selector. Selections persist across sessions (via the filter slice), and
 * changing any of them refetches all visible data because sections key off these
 * params.
 */
const FilterBar: React.FC<FilterBarProps> = ({ filters, campuses, campusesLoading }) => {
    const campusItems = React.useMemo(
        () => [{ _id: 'global', campusName: 'All Campuses' } as ICampus, ...(campuses ?? [])],
        [campuses]
    );

    return (
        <View className="gap-3">
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerClassName="gap-2 px-4"
            >
                {WINDOW_PRESETS.map(p => (
                    <Chip
                        key={p.value}
                        label={p.label}
                        active={filters.windowPreset === p.value}
                        onPress={() => filters.setWindowPreset(p.value)}
                    />
                ))}
            </ScrollView>

            <View className="px-4">
                <PickerSelect<ICampus>
                    valueKey="_id"
                    labelKey="campusName"
                    value={filters.campusId}
                    placeholder="All Campuses"
                    items={campusItems}
                    isLoading={campusesLoading}
                    onValueChange={(value: string) => filters.setCampus(value)}
                    className="!h-12"
                />
            </View>
        </View>
    );
};

export default React.memo(FilterBar);
