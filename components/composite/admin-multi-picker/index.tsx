import React, { useEffect, useMemo, useRef } from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';

import { Text } from '~/components/ui/text';
import { Input } from '~/components/ui/input';
import PickerSelect from '~/components/ui/picker-select';
import { Skeleton } from '~/components/ui/skeleton';

export interface IPickerCampusOption {
    _id: string;
    campusName: string;
}

export interface IAdminMultiPickerProps<T extends { _id: string }> {
    items: T[];
    selectedIds: string[];
    onToggle: (id: string) => void;
    onRemove: (id: string) => void;
    onClear?: () => void;
    renderItem: (item: T, isSelected: boolean) => React.ReactNode;
    renderChip: (item: T) => React.ReactNode;

    campuses: IPickerCampusOption[];
    campusId: string | null;
    onCampusChange: (campusId: string | null) => void;

    query: string;
    onQueryChange: (q: string) => void;

    isLoading?: boolean;
    emptyText?: string;
    searchPlaceholder?: string;
    estimatedItemSize?: number;
}

function AdminMultiPicker<T extends { _id: string }>({
    items,
    selectedIds,
    onToggle,
    onRemove,
    onClear,
    renderItem,
    renderChip,
    campuses,
    campusId,
    onCampusChange,
    query,
    onQueryChange,
    isLoading,
    emptyText = 'No matches.',
    searchPlaceholder = 'Search…',
    estimatedItemSize = 60,
}: IAdminMultiPickerProps<T>) {
    // Cache items we've seen by id, so chips still render after campus switch.
    const cacheRef = useRef<Map<string, T>>(new Map());
    useEffect(() => {
        items.forEach(item => cacheRef.current.set(item._id, item));
    }, [items]);

    const selectedItems = useMemo(
        () => selectedIds.map(id => cacheRef.current.get(id)).filter((x): x is T => !!x),
        [selectedIds, items] // eslint-disable-line react-hooks/exhaustive-deps
    );

    const campusItems = useMemo(
        () => [{ _id: '__all__', campusName: 'All campuses' }, ...campuses],
        [campuses]
    );

    const showEmpty = !isLoading && items.length === 0;

    return (
        <View className="gap-3">
            {selectedItems.length > 0 && (
                <View className="gap-2">
                    <View className="flex-row items-center justify-between">
                        <Text className="!text-[11px] text-muted-foreground">
                            {selectedItems.length} selected
                        </Text>
                        {onClear ? (
                            <TouchableOpacity onPress={onClear} hitSlop={8}>
                                <Text className="!text-[11px] text-primary font-semibold">Clear all</Text>
                            </TouchableOpacity>
                        ) : null}
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                        {selectedItems.map(item => (
                            <TouchableOpacity
                                key={item._id}
                                activeOpacity={0.7}
                                onPress={() => onRemove(item._id)}
                                className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/15 border border-primary/30"
                            >
                                {renderChip(item)}
                                <Ionicons name="close" size={14} color="#888" />
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}

            <PickerSelect
                items={campusItems}
                value={campusId ?? '__all__'}
                labelKey="campusName"
                valueKey="_id"
                onValueChange={(val: string) => onCampusChange(val === '__all__' ? null : val)}
                placeholder={{ label: 'All campuses', value: '__all__' }}
            />

            <View className="gap-1.5">
                <Input value={query} onChangeText={onQueryChange} placeholder={searchPlaceholder} />
                {!isLoading && items.length > 0 ? (
                    <Text className="!text-[11px] text-muted-foreground self-end">
                        {items.length} {items.length === 1 ? 'result' : 'results'}
                    </Text>
                ) : null}
            </View>

            <View style={{ minHeight: 200 }}>
                {isLoading ? (
                    <View className="gap-2">
                        {[1, 2, 3].map(i => (
                            <Skeleton key={i} className="h-14 w-full rounded-xl" />
                        ))}
                    </View>
                ) : showEmpty ? (
                    <View className="py-10 items-center gap-1">
                        <Ionicons name="search-outline" size={24} color="#9ca3af" />
                        <Text className="!text-sm text-muted-foreground">{emptyText}</Text>
                    </View>
                ) : (
                    <FlashList
                        data={items}
                        keyExtractor={(item: T) => item._id}
                        estimatedItemSize={estimatedItemSize}
                        ItemSeparatorComponent={() => <View className="h-px bg-border my-1" />}
                        renderItem={({ item }) => {
                            const isSelected = selectedIds.includes(item._id);
                            return (
                                <TouchableOpacity activeOpacity={0.6} onPress={() => onToggle(item._id)}>
                                    <View className="flex-row items-center gap-3 py-2">
                                        <View className="flex-1">{renderItem(item, isSelected)}</View>
                                        <Ionicons
                                            name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                                            size={22}
                                            color={isSelected ? '#22c55e' : '#9ca3af'}
                                        />
                                    </View>
                                </TouchableOpacity>
                            );
                        }}
                    />
                )}
            </View>
        </View>
    );
}

export default AdminMultiPicker;
