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
import EditGroupDetailsDialog from './edit-details-dialog';
import AddMembersSheet from './add-members-sheet';
import { cn } from '~/lib/utils';
import StatusTag from '~/components/atoms/status-tag';
import { THEME_CONFIG } from '~/config/appConfig';

interface RouteParams {
    groupId: string;
}

// ─── Pill tab ─────────────────────────────────────────────────────────────────

const PillTab: React.FC<{
    label: string;
    active: boolean;
    count?: number;
    onPress: () => void;
}> = ({ label, active, count, onPress }) => (
    <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        className={cn("flex-1 flex-row items-center justify-center gap-1.5 py-2 rounded-full", active ? 'bg-primary' : 'transparent')}
    >
        <Text
            className="!text-[13px] font-semibold"
            style={{ color: active ? 'white' : '#71717a' }}
        >
            {label}
        </Text>
        {count !== undefined && count > 0 && (
            <View
                className="px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: active ? 'rgba(255,255,255,0.25)' : '#f4f4f5' }}
            >
                <Text
                    className="text-sm font-bold"
                    style={{ color: active ? 'white' : '#71717a' }}
                >
                    {count}
                </Text>
            </View>
        )}
    </TouchableOpacity>
);

// ─── Stat card ────────────────────────────────────────────────────────────────

const StatCard: React.FC<{
    icon: string;
    value: number;
    label: string;
    color?: string;
    bg?: string;
}> = ({ icon, value, label, color, bg }) => (
    <View className="flex-1 rounded-2xl p-3 gap-2 bg-muted-background">
        <View className="w-8 h-8 rounded-2xl items-center justify-center">
            <Ionicons name={icon as any} size={18} color={color} />
        </View>
        <Text className="text-4xl font-bold text-muted-foreground">{value}</Text>
        <Text className="text-muted-foreground">{label}</Text>
    </View>
);

// ─── Main screen ──────────────────────────────────────────────────────────────

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

    return (
        <>
            <ScrollView className="flex-1 bg-background">
                <View className="px-4 pt-3 pb-10 gap-4">
                    {isLoading ? (
                        <>
                            <Card className="p-4 gap-3">
                                <View className="flex-row items-start justify-between gap-2">
                                    <Skeleton className="h-6 w-3/5 rounded" />
                                    <Skeleton className="h-6 w-16 rounded-full" />
                                </View>
                                <Skeleton className="h-4 w-2/3 rounded" />
                                <Skeleton className="h-3 w-1/2 rounded" />
                            </Card>
                            <View className="flex-row gap-2">
                                <Skeleton className="flex-1 h-10 rounded-2xl" />
                                <Skeleton className="flex-1 h-10 rounded-2xl" />
                                <Skeleton className="flex-1 h-10 rounded-2xl" />
                            </View>
                            <Skeleton className="h-48 w-full rounded-2xl" />
                        </>
                    ) : !group ? (
                        <View className="py-20 items-center gap-4">
                            <View className="w-14 h-14 rounded-2xl bg-secondary items-center justify-center">
                                <Ionicons name="alert-circle-outline" size={28} color="#a1a1aa" />
                            </View>
                            <Text className="!text-sm text-muted-foreground">Group not found.</Text>
                        </View>
                    ) : (
                        <>
                            {/* ─── Hero header ───────────────────────────────── */}
                            <Card className="p-0 overflow-hidden">
                                {/* Status accent top bar */}
                                <View
                                    className="h-1 w-full rounded-t-3xl"
                                    style={{ backgroundColor: group.isActive ? '#22c55e' : '#a1a1aa' }}
                                />
                                <View className="p-4 gap-3">
                                    <View className="flex-row items-start justify-between gap-2">
                                        <Text className="!text-xl font-bold text-foreground flex-1" numberOfLines={2}>
                                            {group.name}
                                        </Text>
                                        <TouchableOpacity
                                            onPress={() => setEditOpen(true)}
                                            hitSlop={8}
                                            className="w-10 h-10 rounded-full bg-secondary/50 items-center justify-center"
                                        >
                                            <Ionicons name="pencil" size={18} color="#8b5cf6" />
                                        </TouchableOpacity>
                                    </View>
                                    {group.description ? (
                                        <Text className="!text-sm text-muted-foreground italic" numberOfLines={2}>
                                            {group.description}
                                        </Text>
                                    ) : null}

                                    {/* Inline stat chips */}
                                    <View className="flex-row gap-2 flex-wrap">
                                        <View className="flex-row items-center gap-1 px-2.5 py-1 rounded-full bg-primary/20">
                                            <Ionicons name="grid-outline" size={12} color="#8b5cf6" />
                                            <Text className="text-sm font-semibold text-violet-700">
                                                {group.departmentCount ?? group.departments?.length ?? 0} departments
                                            </Text>
                                        </View>
                                        <View className="flex-row items-center gap-1 px-2.5 py-1 rounded-full bg-blue-700/20">
                                            <Ionicons name="person-outline" size={12} color="#3b82f6" />
                                            <Text className="text-sm font-semibold text-blue-700">
                                                {group.ghCount ?? group.groupHeads?.length ?? 0} heads
                                            </Text>
                                        </View>
                                        <View className="flex-row flex-1 justify-end">
                                            <StatusTag>{group.isActive ? 'ACTIVE' : 'INACTIVE'}</StatusTag>
                                        </View>
                                    </View>
                                </View>
                            </Card>

                            {/* ─── Pill tabs ─────────────────────────────────── */}
                            <View className="flex-row gap-1 p-1 rounded-full bg-secondary/60">
                                <PillTab
                                    label="Overview"
                                    active={activeTab === 'overview'}
                                    onPress={() => setActiveTab('overview')}
                                />
                                <PillTab
                                    label="Heads"
                                    active={activeTab === 'heads'}
                                    count={group.groupHeads?.length}
                                    onPress={() => setActiveTab('heads')}
                                />
                                <PillTab
                                    label="Departments"
                                    active={activeTab === 'departments'}
                                    count={group.departments?.length}
                                    onPress={() => setActiveTab('departments')}
                                />
                            </View>

                            {/* ─── Overview tab ──────────────────────────────── */}
                            {activeTab === 'overview' && (
                                <View className="gap-4">
                                    {/* Stat cards */}
                                    <View className="flex-row gap-3">
                                        <StatCard
                                            icon="grid-outline"
                                            value={group.departments?.length ?? 0}
                                            label="Departments"
                                            color="#8b5cf6"
                                            bg="#ede9fe"
                                        />
                                        <StatCard
                                            icon="person-outline"
                                            value={group.groupHeads?.length ?? 0}
                                            label="Group Heads"
                                            color="#3b82f6"
                                            bg="#dbeafe"
                                        />
                                    </View>

                                    {/* Deactivate */}
                                    {group.isActive && (
                                        <Card className="p-4 gap-3 border-destructive/20">
                                            <View className="flex-row items-start gap-3">
                                                <View className="w-12 h-12 rounded-xl bg-red-700/20 items-center justify-center mt-0.5">
                                                    <Ionicons name="warning-outline" size={28} color="#ef4444" />
                                                </View>
                                                <View className="flex-1 gap-1">
                                                    <Text className="font-semibold text-foreground text-sm">Danger zone</Text>
                                                    <Text className="text-sm text-muted-foreground line-clamp-none">
                                                        Deactivating this group will remove access for all group heads. This action cannot be undone from the app.
                                                    </Text>
                                                </View>
                                            </View>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onPress={handleDeactivate}
                                            >
                                                Deactivate group
                                            </Button>
                                        </Card>
                                    )}
                                    {!group.isActive && (
                                        <View className="flex-row items-center gap-2 px-4 py-3 rounded-2xl bg-secondary/60">
                                            <Ionicons name="ban-outline" size={14} color="#a1a1aa" />
                                            <Text className="!text-sm text-muted-foreground">This group is inactive</Text>
                                        </View>
                                    )}
                                </View>
                            )}

                            {/* ─── Group Heads tab ───────────────────────────── */}
                            {activeTab === 'heads' && (
                                <Card className="p-0 overflow-hidden">
                                    <View className="px-4 pt-3.5 pb-2 flex-row items-center justify-between">
                                        <Text className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                                            Group Heads ({group.groupHeads?.length ?? 0})
                                        </Text>
                                        <TouchableOpacity
                                            onPress={() => setAddSheetMode('heads')}
                                            hitSlop={8}
                                            className="flex-row items-center gap-1 px-2.5 py-1 rounded-full bg-primary/15 border border-primary/30"
                                        >
                                            <Ionicons name="add" size={13} color="#8b5cf6" />
                                            <Text className="text-sm text-primary font-semibold">Add</Text>
                                        </TouchableOpacity>
                                    </View>

                                    {(group.groupHeads ?? []).length === 0 ? (
                                        <View className="px-4 pb-6 pt-4 items-center gap-3">
                                            <View className="w-12 h-12 rounded-2xl bg-secondary items-center justify-center">
                                                <Ionicons name="people-outline" size={22} color="#a1a1aa" />
                                            </View>
                                            <Text className="!text-sm text-muted-foreground text-center">
                                                No Group Heads assigned yet.
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
                                                        className="w-10 h-10"
                                                        firstName={gh.firstName}
                                                        lastName={gh.lastName}
                                                        imageUrl={gh.pictureUrl ?? AVATAR_FALLBACK_URL}
                                                    />
                                                    <View className="flex-1 gap-0.5">
                                                        <Text className="!text-[13px] font-semibold text-foreground">
                                                            {gh.firstName} {gh.lastName}
                                                        </Text>
                                                        <View className="flex-row items-center gap-1">
                                                            <View className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                                                            <Text className="text-sm text-muted-foreground">Group Head</Text>
                                                        </View>
                                                    </View>
                                                    <TouchableOpacity
                                                        onPress={() => handleRemoveHead(gh._id, `${gh.firstName} ${gh.lastName}`)}
                                                        hitSlop={8}
                                                        className="px-2.5 py-1 rounded-full border border-border"
                                                    >
                                                        <Text className="text-sm text-muted-foreground">Remove</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        ))
                                    )}
                                </Card>
                            )}

                            {/* ─── Departments tab ───────────────────────────── */}
                            {activeTab === 'departments' && (
                                <Card className="p-0 overflow-hidden">
                                    <View className="px-4 pt-3.5 pb-2 flex-row items-center justify-between">
                                        <Text className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                                            Departments ({group.departments?.length ?? 0})
                                        </Text>
                                        <TouchableOpacity
                                            onPress={() => setAddSheetMode('departments')}
                                            hitSlop={8}
                                            className="flex-row items-center gap-1 px-2.5 py-1 rounded-full bg-primary/15 border border-primary/30"
                                        >
                                            <Ionicons name="add" size={13} color={THEME_CONFIG.primaryLight} />
                                            <Text className="text-sm text-primary font-semibold">Add</Text>
                                        </TouchableOpacity>
                                    </View>

                                    {(group.departments ?? []).length === 0 ? (
                                        <View className="px-4 pb-6 pt-4 items-center gap-3">
                                            <View className="w-12 h-12 rounded-2xl bg-secondary items-center justify-center">
                                                <Ionicons name="grid-outline" size={22} color="#a1a1aa" />
                                            </View>
                                            <Text className="!text-sm text-muted-foreground text-center">
                                                No departments assigned yet.
                                            </Text>
                                            <Button size="sm" variant="outline" onPress={() => setAddSheetMode('departments')}>
                                                Add Departments
                                            </Button>
                                        </View>
                                    ) : (
                                        (group.departments ?? []).map((dept, i) => (
                                            <View key={dept._id}>
                                                {i > 0 && <Separator />}
                                                <View className="flex-row items-center gap-3 px-4 py-3">
                                                    <View className="w-9 h-9 rounded-xl bg-violet-700/20 items-center justify-center">
                                                        <Ionicons name="people-outline" size={14} color="#8b5cf6" />
                                                    </View>
                                                    <Text className="flex-1 text-base font-medium text-foreground">
                                                        {dept.departmentName}
                                                    </Text>
                                                    <TouchableOpacity
                                                        onPress={() => handleRemoveDept(dept._id, dept.departmentName)}
                                                        hitSlop={8}
                                                        className="px-2.5 py-1 rounded-full border border-border"
                                                    >
                                                        <Text className="text-sm text-muted-foreground">Remove</Text>
                                                    </TouchableOpacity>
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
