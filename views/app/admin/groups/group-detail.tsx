import React, { memo, useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Text } from '~/components/ui/text';
import { Card } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Skeleton } from '~/components/ui/skeleton';
import { Separator } from '~/components/ui/separator';
import AvatarComponent from '@components/atoms/avatar';
import {
    useGetGroupByIdQuery,
    useRemoveGroupHeadMutation,
    useRemoveDepartmentMutation,
    useDeactivateGroupMutation,
} from '@store/services/group';
import { AVATAR_FALLBACK_URL } from '@constants/index';
import StatusTag from '~/components/atoms/status-tag';

interface RouteParams {
    groupId: string;
}

const SectionLabel: React.FC<{ children: string }> = ({ children }) => (
    <Text className="!text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{children}</Text>
);

const AdminGroupDetail: React.FC = () => {
    const { groupId } = useLocalSearchParams<RouteParams>();
    const [activeTab, setActiveTab] = useState<'overview' | 'heads' | 'departments'>('overview');

    const { data: group, isLoading, refetch } = useGetGroupByIdQuery(groupId as string, { skip: !groupId });
    const [removeHead, { isLoading: isRemovingHead }] = useRemoveGroupHeadMutation();
    const [removeDept, { isLoading: isRemovingDept }] = useRemoveDepartmentMutation();
    const [deactivate] = useDeactivateGroupMutation();

    const handleDeactivate = () => {
        Alert.alert('Deactivate Group', `Are you sure you want to deactivate "${group?.name}"?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Deactivate',
                style: 'destructive',
                onPress: async () => {
                    await deactivate(groupId as string);
                    refetch();
                },
            },
        ]);
    };

    const handleRemoveHead = (userId: string, name: string) => {
        Alert.alert('Remove Group Head', `Remove ${name} as Group Head?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Remove',
                style: 'destructive',
                onPress: async () => {
                    await removeHead({ groupId: groupId as string, userId });
                    refetch();
                },
            },
        ]);
    };

    const handleRemoveDept = (departmentId: string, name: string) => {
        Alert.alert('Remove Department', `Remove "${name}" from this Group?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Remove',
                style: 'destructive',
                onPress: async () => {
                    await removeDept({ groupId: groupId as string, departmentId });
                    refetch();
                },
            },
        ]);
    };

    const tabs = [
        { key: 'overview' as const, label: 'Overview' },
        { key: 'heads' as const, label: 'Group Heads' },
        { key: 'departments' as const, label: 'Departments' },
    ];

    return (
        <ScrollView className="flex-1 bg-background">
            <View className="px-4 pt-3 pb-10 gap-4">
                {isLoading ? (
                    <>
                        <Skeleton className="h-12 w-full rounded-2xl" />
                        <Skeleton className="h-40 w-full rounded-2xl" />
                    </>
                ) : !group ? (
                    <View className="py-16 items-center">
                        <Text className="!text-sm text-muted-foreground">Group not found.</Text>
                    </View>
                ) : (
                    <>
                        {/* Header */}
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

                        {/* Sub-tabs */}
                        <View className="flex-row gap-2">
                            {tabs.map(t => (
                                <Button
                                    key={t.key}
                                    variant={activeTab === t.key ? 'default' : 'outline'}
                                    size="sm"
                                    className="flex-1"
                                    onPress={() => setActiveTab(t.key)}
                                >
                                    {t.label}
                                </Button>
                            ))}
                        </View>

                        {/* Overview */}
                        {activeTab === 'overview' && (
                            <Card className="p-4 gap-3">
                                <SectionLabel>Stats</SectionLabel>
                                <View className="flex-row gap-4">
                                    <View className="flex-1 items-center gap-0.5">
                                        <Text className="!text-2xl font-bold text-foreground">
                                            {group.departments?.length ?? 0}
                                        </Text>
                                        <Text className="!text-[11px] text-muted-foreground">Departments</Text>
                                    </View>
                                    <View className="flex-1 items-center gap-0.5">
                                        <Text className="!text-2xl font-bold text-foreground">
                                            {group.groupHeads?.length ?? 0}
                                        </Text>
                                        <Text className="!text-[11px] text-muted-foreground">Group Heads</Text>
                                    </View>
                                </View>
                                <Separator />
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onPress={handleDeactivate}
                                    disabled={!group.isActive}
                                >
                                    {group.isActive ? 'Deactivate Group' : 'Group is Inactive'}
                                </Button>
                            </Card>
                        )}

                        {/* Group Heads */}
                        {activeTab === 'heads' && (
                            <Card className="p-0">
                                <View className="px-4 pt-3.5 pb-2">
                                    <SectionLabel>Group Heads ({group.groupHeads?.length ?? 0})</SectionLabel>
                                </View>
                                {(group.groupHeads ?? []).length === 0 ? (
                                    <View className="px-4 pb-4 pt-2">
                                        <Text className="!text-sm text-muted-foreground">No Group Heads assigned.</Text>
                                    </View>
                                ) : (
                                    (group.groupHeads ?? []).map((gh, i) => (
                                        <View key={gh._id}>
                                            {i > 0 && <Separator />}
                                            <View className="flex-row items-center gap-3 px-4 py-3">
                                                <AvatarComponent
                                                    alt={gh.firstName}
                                                    className="w-9 h-9"
                                                    firstName={gh.firstName}
                                                    lastName={gh.lastName}
                                                    imageUrl={gh.pictureUrl ?? AVATAR_FALLBACK_URL}
                                                />
                                                <Text className="flex-1 !text-[13px] font-medium text-foreground">
                                                    {gh.firstName} {gh.lastName}
                                                </Text>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    isLoading={isRemovingHead}
                                                    onPress={() => handleRemoveHead(gh._id, `${gh.firstName} ${gh.lastName}`)}
                                                >
                                                    Remove
                                                </Button>
                                            </View>
                                        </View>
                                    ))
                                )}
                            </Card>
                        )}

                        {/* Departments */}
                        {activeTab === 'departments' && (
                            <Card className="p-0">
                                <View className="px-4 pt-3.5 pb-2">
                                    <SectionLabel>Departments ({group.departments?.length ?? 0})</SectionLabel>
                                </View>
                                {(group.departments ?? []).length === 0 ? (
                                    <View className="px-4 pb-4 pt-2">
                                        <Text className="!text-sm text-muted-foreground">No departments assigned.</Text>
                                    </View>
                                ) : (
                                    (group.departments ?? []).map((dept, i) => (
                                        <View key={dept._id}>
                                            {i > 0 && <Separator />}
                                            <View className="flex-row items-center gap-3 px-4 py-3">
                                                <View className="w-8 h-8 rounded-lg bg-secondary items-center justify-center">
                                                    <Ionicons name="people-outline" size={14} color="#8b5cf6" />
                                                </View>
                                                <Text className="flex-1 !text-[13px] font-medium text-foreground">
                                                    {dept.departmentName}
                                                </Text>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    isLoading={isRemovingDept}
                                                    onPress={() => handleRemoveDept(dept._id, dept.departmentName)}
                                                >
                                                    Remove
                                                </Button>
                                            </View>
                                        </View>
                                    ))
                                )}
                            </Card>
                        )}
                    </>
                )}
            </View>
        </ScrollView>
    );
};

export default memo(AdminGroupDetail);
