import React, { memo } from 'react';
import { Search, List } from 'lucide-react-native';
import { Input } from '~/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '~/components/ui/toggle-group';
import { AssimilationStage } from '~/store/types';
import { View } from 'react-native';
import { Icon } from '@rneui/themed';
import { THEME_CONFIG } from '~/config/appConfig';

interface SearchAndFilterProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    viewMode: 'kanban' | 'list';
    onViewModeChange: (value: 'kanban' | 'list') => void;
    stageFilter?: AssimilationStage | 'all';
    onStageFilterChange?: (value: AssimilationStage | 'all') => void;
}

export const SearchAndFilter = memo(function SearchAndFilter({
    searchTerm,
    onSearchChange,
    viewMode,
    onViewModeChange,
    stageFilter,
    onStageFilterChange,
}: SearchAndFilterProps) {
    return (
        <View className="flex items-center space-x-4">
            <View className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                    placeholder="Search guests by name, phone, or address..."
                    value={searchTerm}
                    onChangeText={e => onSearchChange(e)}
                    className="pl-10"
                />
            </View>
            {viewMode === 'list' && onStageFilterChange && (
                <Select value={stageFilter as any} onValueChange={onStageFilterChange as any}>
                    <SelectTrigger className="w-min">
                        <SelectValue placeholder="Filter by stage" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem label="" value="all">
                            All Stages
                        </SelectItem>
                        <SelectItem label="" value="invited">
                            Invited
                        </SelectItem>
                        <SelectItem label="" value="attended">
                            Attended
                        </SelectItem>
                        <SelectItem label="" value="discipled">
                            Discipled
                        </SelectItem>
                        <SelectItem label="" value="joined">
                            Joined Workforce
                        </SelectItem>
                    </SelectContent>
                </Select>
            )}

            <ToggleGroup
                value={viewMode}
                onValueChange={value => value && onViewModeChange(value as 'kanban' | 'list')}
                variant="outline"
                type="single"
                className="w-max"
            >
                <ToggleGroupItem isFirst value="crm" aria-label="Kanban view">
                    <Icon size={22} name="th-large" type="font-awesome" color={THEME_CONFIG.gray} />
                </ToggleGroupItem>
                <ToggleGroupItem isLast value="kanban" aria-label="List view">
                    <List className="w-4 h-4 text-foreground" color="gray" />
                </ToggleGroupItem>
            </ToggleGroup>
        </View>
    );
});
