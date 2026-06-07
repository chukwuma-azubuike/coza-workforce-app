import React from 'react';
import dayjs from 'dayjs';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { Text } from '~/components/ui/text';
import PickerSelect from '~/components/ui/picker-select';
import { ICampus, IService } from '@store/types';
import { cn } from '~/lib/utils';
import { WINDOW_PRESETS } from '../lib';
import { IUseGspFilters } from '../use-gsp-filters';

const ALL_SERVICES = 'all';

interface FilterBarProps {
    filters: IUseGspFilters;
    campuses?: ICampus[];
    campusesLoading?: boolean;
    /** Services within the active window, latest first. */
    services?: IService[];
    servicesLoading?: boolean;
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
const FilterBar: React.FC<FilterBarProps> = ({ filters, campuses, campusesLoading, services, servicesLoading }) => {
    const campusItems = React.useMemo(
        () => [{ _id: 'global', campusName: 'All Campuses' } as ICampus, ...(campuses ?? [])],
        [campuses]
    );

    const serviceItems = React.useMemo(
        () => [{ _id: ALL_SERVICES, name: 'All Services' } as IService, ...(services ?? [])],
        [services]
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

            <View className="px-4 gap-2 flex-row">
                <View className="flex-1">
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
                <View className="flex-1">
                    <PickerSelect<IService>
                        valueKey="_id"
                        value={filters.serviceId ?? ALL_SERVICES}
                        placeholder="All Services"
                        items={serviceItems}
                        isLoading={servicesLoading}
                        customLabel={s =>
                            s._id === ALL_SERVICES
                                ? 'All Services'
                                : `${s.name} · ${dayjs(s.serviceTime ?? s.clockInStartTime).format('DD MMM YYYY')}`
                        }
                        onValueChange={(value: string) => filters.setService(value === ALL_SERVICES ? undefined : value)}
                        className="!h-12"
                    />
                </View>
            </View>
        </View>
    );
};

export default React.memo(FilterBar);
