import { Search } from 'lucide-react-native';
import { Input } from '~/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Guest } from '~/store/types';
import { View } from 'react-native';
import PickerSelect from '~/components/ui/picker-select';

interface SearchAndFilterProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    stageFilter: Guest['assimilationStage'] | 'all';
    onStageFilterChange: (value: Guest['assimilationStage'] | 'all') => void;
    viewMode: 'kanban' | 'list';
}

export function SearchAndFilter({
    searchTerm,
    onSearchChange,
    stageFilter,
    onStageFilterChange,
    viewMode,
}: SearchAndFilterProps) {
    const stageOptions = [
        { value: 'all', label: 'All Stages' },
        { value: 'invited', label: 'Invited' },
        { value: 'attended', label: 'Attended' },
        { value: 'discipled', label: 'Discipled' },
        { value: 'joined', label: 'Joined Workforce' },
    ];

    const selectedOption = stageOptions.find(opt => opt.value === stageFilter) || stageOptions[0];

    return (
        <View className="flex items-center gap-4">
            <View className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                    placeholder="Search guests by name, phone, or address..."
                    value={searchTerm}
                    onChangeText={onSearchChange}
                    className="pl-10"
                />
            </View>
            {viewMode === 'list' && (
                <PickerSelect
                    valueKey="value"
                    items={stageOptions}
                    labelKey="label"
                    // value={selectedOption}
                    className="!w-44 !h-10"
                    placeholder="Select stage"
                    onValueChange={option => {
                        if (option?.value) {
                            onStageFilterChange(option.value as Guest['assimilationStage'] | 'all');
                        }
                    }}
                />
            )}
        </View>
    );
}
