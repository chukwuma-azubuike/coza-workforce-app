import React, { memo, useState } from 'react';
import { FlatList, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import ViewWrapper from '@components/layout/viewWrapper';
import { Text } from '~/components/ui/text';
import { Card } from '~/components/ui/card';
import { Skeleton } from '~/components/ui/skeleton';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { useGetGroupsQuery } from '@store/services/group';
import type { IGroupListItem } from '@store/types';
import StatusTag from '~/components/atoms/status-tag';

const StatBadge: React.FC<{ icon: string; value: number; label: string; color: string }> = ({
    icon,
    value,
    label,
    color,
}) => (
    <View className="flex-row items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary/80">
        <Ionicons name={icon as any} size={11} color={color} />
        <Text className="text-sm font-semibold" style={{ color }}>
            {value}
        </Text>
        <Text className="text-sm text-muted-foreground">{label}</Text>
    </View>
);

const GroupListItem: React.FC<IGroupListItem> = group => {
    const handlePress = () => {
        router.push({ pathname: '/admin/groups/group-detail' as any, params: { groupId: group._id } });
    };

    const isActive = group.isActive;

    return (
        <TouchableOpacity activeOpacity={0.6} onPress={handlePress}>
            <Card className="p-0 overflow-hidden">
                <View className="flex-row">
                    {/* Left accent bar */}
                    <View
                        className="w-1 rounded-l-3xl"
                        style={{ backgroundColor: isActive ? '#22c55e' : '#a1a1aa' }}
                    />
                    <View className="flex-1 p-4 gap-2.5">
                        {/* Name + status row */}
                        <View className="flex-row items-start justify-between gap-2">
                            <Text className="text-xl font-bold text-foreground flex-1 leading-snug" numberOfLines={2}>
                                {group.name}
                            </Text>
                            <StatusTag>{isActive ? 'ACTIVE' : 'INACTIVE'}</StatusTag>
                        </View>

                        {/* Description */}
                        {group.description ? (
                            <Text className="text-sm text-muted-foreground" numberOfLines={1}>
                                {group.description}
                            </Text>
                        ) : null}

                        {/* Stat badges */}
                        <View className="flex-row gap-2 flex-wrap">
                            <StatBadge icon="grid-outline" value={group.departmentCount} label="departments" color="#8b5cf6" />
                            <StatBadge icon="person-outline" value={group.ghCount} label="heads" color="#3b82f6" />
                        </View>
                    </View>

                    {/* Chevron */}
                    <View className="items-center justify-center pr-3">
                        <Ionicons name="chevron-forward" size={16} color="#a1a1aa" />
                    </View>
                </View>
            </Card>
        </TouchableOpacity>
    );
};

const EmptyState: React.FC<{ hasSearch: boolean }> = ({ hasSearch }) => (
    <View className="py-20 items-center gap-4 px-8">
        <View className="w-16 h-16 rounded-2xl bg-secondary items-center justify-center">
            <Ionicons name={hasSearch ? 'search-outline' : 'people-circle-outline'} size={32} color="#a1a1aa" />
        </View>
        <View className="items-center gap-1">
            <Text className="font-semibold text-foreground">
                {hasSearch ? 'No results found' : 'No groups yet'}
            </Text>
            <Text className="!text-sm text-muted-foreground text-center">
                {hasSearch
                    ? 'Try a different search term.'
                    : 'Create your first group to start organising departments and group heads.'}
            </Text>
        </View>
        {!hasSearch && (
            <Button
                size="sm"
                variant="outline"
                onPress={() => router.push({ pathname: '/admin/groups/create-group' as any })}
                startIcon={<Ionicons name="add" size={14} color="#8b5cf6" />}
            >
                Create group
            </Button>
        )}
    </View>
);

const AdminGroupList: React.FC = () => {
    const [search, setSearch] = useState('');

    const { data: groups = [], isLoading, refetch } = useGetGroupsQuery({ q: search || undefined });

    const handleCreate = () => {
        router.push({ pathname: '/admin/groups/create-group' as any });
    };

    return (
        <ViewWrapper className="flex-1" noPadding>
            {/* Search + New */}
            <View className="px-4 pt-4 pb-3 gap-3">
                <View className="flex-row gap-3 items-center">
                    <View className="flex-1 relative">
                        <View className="absolute left-3 top-0 bottom-0 justify-center z-10">
                            <Ionicons name="search-outline" size={16} color="#a1a1aa" />
                        </View>
                        <Input
                            value={search}
                            onChangeText={setSearch}
                            placeholder="Search groups…"
                            className='pl-10 !h-12'
                        />
                    </View>
                    <Button
                        size="sm"
                        className='px-4'
                        onPress={handleCreate}
                        startIcon={<Ionicons name="add" size={20} color="white" />}
                    >
                        New
                    </Button>
                </View>

                {/* Count label */}
                {!isLoading && groups.length > 0 && (
                    <Text className="text-muted-foreground px-0.5">
                        {groups.length} group{groups.length !== 1 ? 's' : ''}
                    </Text>
                )}
            </View>

            {isLoading ? (
                <View className="px-4 gap-3">
                    {[1, 2, 3, 4].map(i => (
                        <Card key={i} className="p-0 overflow-hidden">
                            <View className="flex-row">
                                <Skeleton className="w-1 rounded-none" />
                                <View className="flex-1 p-4 gap-2.5">
                                    <View className="flex-row items-start justify-between gap-2">
                                        <Skeleton className="h-4 w-3/5 rounded" />
                                        <Skeleton className="h-5 w-14 rounded-full" />
                                    </View>
                                    <Skeleton className="h-3 w-2/3 rounded" />
                                    <View className="flex-row gap-2">
                                        <Skeleton className="h-6 w-24 rounded-full" />
                                        <Skeleton className="h-6 w-20 rounded-full" />
                                    </View>
                                </View>
                            </View>
                        </Card>
                    ))}
                </View>
            ) : (
                <FlatList
                    data={groups}
                    keyExtractor={g => g._id}
                    renderItem={({ item }) => <GroupListItem {...item} />}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 4, paddingBottom: 32, gap: 10 }}
                    onRefresh={refetch}
                    refreshing={false}
                    ListEmptyComponent={<EmptyState hasSearch={!!search} />}
                />
            )}
        </ViewWrapper>
    );
};

export default memo(AdminGroupList);
