import React, { memo, useState } from 'react';
import { Alert, ScrollView, TouchableOpacity, View } from 'react-native';
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
import { extractApiError } from '@utils/index';
import StatusTag from '~/components/atoms/status-tag';
import EditGroupDetailsDialog from './edit-details-dialog';
import AddMembersSheet from './add-members-sheet';

interface RouteParams {
    groupId: string;
}

const SectionLabel: React.FC<{ children: string }> = ({ children }) => (
    <Text className="!text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{children}</Text>
);

const AdminGroupDetail: React.FC = () => {
    const { groupId } = useLocalSearchParams<RouteParams>();
    const [activeTab, setActiveTab] = useState<'overview' | 'heads' | 'departments'>('overview');
    const [editOpen, setEditOpen] = useState(false);
    const [addSheetMode, setAddSheetMode] = useState<'heads' | 'departments' | null>(null);

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
                    try {
                        await deactivate(groupId as string).unwrap();
                        refetch();
                    } catch (err) {
                        Alert.alert('Error', extractApiError(err, 'Could not deactivate group. Please try again.'));
                    }
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
                    try {
                        await removeHead({ groupId: groupId as string, userId }).unwrap();
                        refetch();
                    } catch (err) {
                        Alert.alert('Error', extractApiError(err, `Could not remove ${name} as Group Head.`));
                    }
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
                    try {
                        await removeDept({ groupId: groupId as string, departmentId }).unwrap();
                        refetch();
                    } catch (err) {
                        Alert.alert('Error', extractApiError(err, `Could not remove "${name}" from this group.`));
                    }
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
        <>
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
                                <View className="flex-row items-center justify-between gap-2">
                                    <Text className="text-xl font-bold text-foreground flex-1" numberOfLines={2}>
                                        {group.name}
                                    </Text>
                                    <StatusTag>{group.isActive ? 'ACTIVE' : 'INACTIVE'}</StatusTag>
                                    <TouchableOpacity
                                        onPress={() => setEditOpen(true)}
                                        hitSlop={8}
                                        className="w-8 h-8 rounded-full bg-secondary items-center justify-center"
                                    >
                                        <Ionicons name="pencil" size={14} color="#8b5cf6" />
                                    </TouchableOpacity>
                                </View>
                                <Text className="text-muted-foreground">
                                    {group.departmentCount ?? group.departments?.length ?? 0} departments ·{' '}
                                    {group.ghCount ?? group.groupHeads?.length ?? 0} GH(s)
                                </Text>
                                {group.description ? (
                                    <Text className="text-sm text-muted-foreground italic" numberOfLines={2}>
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
                                    <View className="px-4 pt-3.5 pb-2 flex-row items-center justify-between">
                                        <SectionLabel>Group Heads ({group.groupHeads?.length ?? 0})</SectionLabel>
                                        <TouchableOpacity
                                            onPress={() => setAddSheetMode('heads')}
                                            hitSlop={8}
                                            className="flex-row items-center gap-1 px-2.5 py-1 rounded-full bg-primary/15 border border-primary/30"
                                        >
                                            <Ionicons name="add" size={14} color="#8b5cf6" />
                                            <Text className="!text-[11px] text-primary font-semibold">Add</Text>
                                        </TouchableOpacity>
                                    </View>
                                    {(group.groupHeads ?? []).length === 0 ? (
                                        <View className="px-4 pb-4 pt-2 items-center gap-2">
                                            <Text className="!text-sm text-muted-foreground">
                                                No Group Heads assigned.
                                            </Text>
                                            <Button size="sm" variant="outline" onPress={() => setAddSheetMode('heads')}>
                                                Add Group Heads
                                            </Button>
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
                                                        onPress={() =>
                                                            handleRemoveHead(gh._id, `${gh.firstName} ${gh.lastName}`)
                                                        }
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
                                    <View className="px-4 pt-3.5 pb-2 flex-row items-center justify-between">
                                        <SectionLabel>Departments ({group.departments?.length ?? 0})</SectionLabel>
                                        <TouchableOpacity
                                            onPress={() => setAddSheetMode('departments')}
                                            hitSlop={8}
                                            className="flex-row items-center gap-1 px-2.5 py-1 rounded-full bg-primary/15 border border-primary/30"
                                        >
                                            <Ionicons name="add" size={14} color="#8b5cf6" />
                                            <Text className="!text-[11px] text-primary font-semibold">Add</Text>
                                        </TouchableOpacity>
                                    </View>
                                    {(group.departments ?? []).length === 0 ? (
                                        <View className="px-4 pb-4 pt-2 items-center gap-2">
                                            <Text className="!text-sm text-muted-foreground">No departments assigned.</Text>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onPress={() => setAddSheetMode('departments')}
                                            >
                                                Add Departments
                                            </Button>
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

            {/* Edit details dialog */}
            {group ? (
                <EditGroupDetailsDialog
                    open={editOpen}
                    onOpenChange={setEditOpen}
                    groupId={groupId as string}
                    initialName={group.name}
                    initialDescription={group.description}
                    onSaved={refetch}
                />
            ) : null}

            {/* Add members sheet */}
            {group && addSheetMode ? (
                <AddMembersSheet
                    open={!!addSheetMode}
                    onClose={() => setAddSheetMode(null)}
                    mode={addSheetMode}
                    groupId={groupId as string}
                    excludeIds={
                        addSheetMode === 'heads'
                            ? (group.groupHeads ?? []).map(g => g._id)
                            : (group.departments ?? []).map(d => d._id)
                    }
                    onAdded={refetch}
                />
            ) : null}
        </>
    );
};

export default memo(AdminGroupDetail);
