import React, { memo } from 'react';
import { Search, List } from 'lucide-react-native';
import { Input } from '~/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '~/components/ui/toggle-group';
import { View } from 'react-native';
import { Icon } from '@rneui/themed';
import { THEME_CONFIG } from '~/config/appConfig';
import PickerSelect from '~/components/ui/picker-select';
import * as Haptics from 'expo-haptics';
import Loading from '~/components/atoms/loading';

interface SearchAndFilterProps {
    searchTerm: string;
    loading: boolean;
    viewMode: 'kanban' | 'list';
    setViewMode: (arg: string) => void;
    setSearchTerm: (arg: string) => void;
    stageFilter: string | 'all';
    setStageFilter: (value: string | 'all') => void;
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
    loading,
    setSearchTerm,
    setViewMode,
    viewMode,
    stageFilter,
    setStageFilter,
}) => {
    const handleChange = (val: string) => {
        if (val) {
            Haptics.selectionAsync();
            setViewMode(val);
        }
    };

    return (
        <View className="flex-row items-center gap-4">
            <View className="flex-1 relative">
                <View className="absolute left-2 top-2.5 z-10">
                    {loading ? (
                        <Loading className="h-5" />
                    ) : (
                        <Search className="w-3 h-3 text-foreground" size={20} color="gray" />
                    )}
                </View>
                <Input
                    placeholder="Search by name, phone, or address..."
                    // value={searchTerm}
                    onChangeText={setSearchTerm}
                    className="pl-10 !h-10"
                />
            </View>
            {viewMode == 'list' && (
                <PickerSelect
                    valueKey="value"
                    labelKey="label"
                    value={stageFilter}
                    className="!w-28 !h-10"
                    items={[
                        { label: 'All', value: 'all' },
                        { label: 'Invited', value: 'invited' },
                        { label: 'Attended', value: 'attended' },
                        { label: 'Discipled', value: 'discipled' },
                        { label: 'Joined', value: 'joined' },
                    ]}
                    placeholder="Select stage"
                    onValueChange={setStageFilter}
                />
            )}

            <ToggleGroup
                type="single"
                value={viewMode}
                className="w-max"
                variant="outline"
                onValueChange={handleChange as any}
            >
                <ToggleGroupItem isFirst value="kanban" aria-label="Kanban view">
                    <Icon size={22} name="th-large" type="font-awesome" color={THEME_CONFIG.gray} />
                </ToggleGroupItem>
                <ToggleGroupItem isLast value="list" aria-label="List view">
                    <List className="w-4 h-4 text-foreground" color="gray" />
                </ToggleGroupItem>
            </ToggleGroup>
        </View>
    );
};

export default memo(SearchAndFilter);

SearchAndFilter.displayName = 'SearchAndFilter';
