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

const GroupListItem: React.FC<IGroupListItem> = group => {
    const handlePress = () => {
        router.push({ pathname: '/admin/groups/group-detail' as any, params: { groupId: group._id } });
    };

    return (
        <TouchableOpacity activeOpacity={0.6} onPress={handlePress}>
            <Card className="p-4 gap-2">
                <View className="flex-row items-center justify-between">
                    <Text className="text-xl font-bold text-foreground flex-1">{group.name}</Text>
                    <StatusTag>{group.isActive ? 'ACTIVE' : 'INACTIVE'}</StatusTag>
                </View>
                <Text className="text-muted-foreground">
                    {group.departmentCount} departments · {group.ghCount} GH(s)
                </Text>
                {group.description ? (
                    <Text className="text-sm text-muted-foreground italic" numberOfLines={1}>
                        {group.description}
                    </Text>
                ) : null}
            </Card>
        </TouchableOpacity>
    );
};

const AdminGroupList: React.FC = () => {
    const [search, setSearch] = useState('');

    const { data: groups = [], isLoading, refetch } = useGetGroupsQuery({ q: search || undefined });

    const handleCreate = () => {
        router.push({ pathname: '/admin/groups/create-group' as any });
    };

    return (
        <ViewWrapper className="flex-1" noPadding>
            <View className="px-4 pt-4 pb-2 w-full">
                <View className="flex-row gap-4">
                    <View className='flex-1'>
                        <Input
                            value={search}
                            onChangeText={setSearch}
                            placeholder="Search groups…"
                        />
                    </View>
                    <View>
                        <Button className='flex-1' size="sm" onPress={handleCreate} startIcon={<Ionicons name="add" size={18} color="white" />}>
                            New
                        </Button>
                    </View>
                </View>
            </View>

            {isLoading ? (
                <View className="px-4 gap-4 pt-2">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}
                </View>
            ) : (
                <FlatList
                    data={groups}
                    keyExtractor={g => g._id}
                    renderItem={({ item }) => <GroupListItem {...item} />}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 4, paddingBottom: 32, gap: 10 }}
                    onRefresh={refetch}
                    refreshing={false}
                    ListEmptyComponent={
                        <View className="py-16 items-center">
                            <Text className="!text-sm text-muted-foreground">No groups found.</Text>
                        </View>
                    }
                />
            )}
        </ViewWrapper>
    );
};

export default memo(AdminGroupList);
