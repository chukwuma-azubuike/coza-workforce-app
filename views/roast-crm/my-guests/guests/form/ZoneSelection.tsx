import React from 'react';
import { Label } from '~/components/ui/label';
import { MapPin } from 'lucide-react-native';
import { View } from 'react-native';
import { Text } from '~/components/ui/text';
import PickerSelect from '~/components/ui/picker-select';

interface ZoneData {
    _id: string;
    name: string;
}

interface ZoneSelectionProps {
    selectedZone: string;
    onZoneChange: (value: string) => void;
    zones?: ZoneData[];
    defaultZoneName?: string;
}

export function ZoneSelection({ selectedZone, onZoneChange, zones, defaultZoneName }: ZoneSelectionProps) {
    return (
        <View className="space-y-2">
            <Label className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <Text>Zone</Text>
            </Label>
            <PickerSelect
                valueKey="_id"
                labelKey="name"
                items={zones || []}
                value={selectedZone}
                placeholder="Select zone"
                onValueChange={onZoneChange}
            />
            {defaultZoneName && (
                <Text className="text-xs text-gray-500">Auto-assigned to your zone: {defaultZoneName}</Text>
            )}
        </View>
    );
}
