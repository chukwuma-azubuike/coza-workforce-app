import React, { memo, useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Text } from '~/components/ui/text';
import { Card } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { Separator } from '~/components/ui/separator';
import AvatarComponent from '@components/atoms/avatar';
import AdminMultiPicker from '@components/composite/admin-multi-picker';
import { AVATAR_FALLBACK_URL } from '@constants/index';
import Utils, { extractApiError } from '@utils/index';
import { useCreateGroupMutation, ICreateGroupResponse } from '@store/services/group';
import { useGetCampusesQuery } from '@store/services/campus';
import { useGetGroupHeadUsersQuery, useGetUsersQuery } from '@store/services/account';
import { useGetDepartmentsByCampusIdQuery, useGetDepartmentsQuery } from '@store/services/department';
import type { IDepartment, IUser } from '@store/types';

// ─── Step indicator ───────────────────────────────────────────────────────────

const STEPS = [
    { key: 'info', label: 'Details', icon: 'create-outline' },
    { key: 'heads', label: 'Heads', icon: 'person-add-outline' },
    { key: 'depts', label: 'Departments', icon: 'grid-outline' },
];

const StepIndicator: React.FC<{ current: number; counts: number[] }> = ({ current, counts }) => (
    <View className="flex-row items-center justify-center px-4 pt-2 pb-4 gap-0">
        {STEPS.map((step, i) => {
            const done = i < current;
            const active = i === current;
            const hasCount = counts[i] > 0;
            return (
                <React.Fragment key={step.key}>
                    <View className="items-center gap-1">
                        <View
                            className="w-9 h-9 rounded-full items-center justify-center"
                            style={{
                                backgroundColor: active ? '#8b5cf6' : done ? '#ede9fe' : '#f4f4f5',
                            }}
                        >
                            {done && hasCount ? (
                                <View className="items-center justify-center">
                                    <Ionicons name="checkmark" size={16} color="#8b5cf6" />
                                    <View
                                        className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-primary items-center justify-center"
                                        style={{ backgroundColor: '#8b5cf6' }}
                                    >
                                        <Text className="!text-[9px] font-bold text-white">{counts[i]}</Text>
                                    </View>
                                </View>
                            ) : (
                                <Ionicons
                                    name={step.icon as any}
                                    size={15}
                                    color={active ? 'white' : done ? '#8b5cf6' : '#a1a1aa'}
                                />
                            )}
                        </View>
                        <Text
                            className="!text-[10px] font-medium"
                            style={{ color: active ? '#8b5cf6' : done ? '#6d28d9' : '#a1a1aa' }}
                        >
                            {step.label}
                        </Text>
                    </View>
                    {i < STEPS.length - 1 && (
                        <View
                            className="flex-1 h-px mx-1 mb-5"
                            style={{ backgroundColor: done ? '#c4b5fd' : '#e4e4e7' }}
                        />
                    )}
                </React.Fragment>
            );
        })}
    </View>
);

// ─── Section header ───────────────────────────────────────────────────────────

const SectionHeader: React.FC<{
    icon: string;
    title: string;
    subtitle: string;
    color: string;
    bg: string;
    count?: number;
}> = ({ icon, title, subtitle, color, bg, count }) => (
    <View className="flex-row items-center gap-3 mb-1">
        <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: bg }}>
            <Ionicons name={icon as any} size={18} color={color} />
        </View>
        <View className="flex-1">
            <View className="flex-row items-center gap-2">
                <Text className="font-bold text-foreground">{title}</Text>
                {count !== undefined && count > 0 && (
                    <View
                        className="px-1.5 py-0.5 rounded-full"
                        style={{ backgroundColor: bg }}
                    >
                        <Text className="!text-[10px] font-bold" style={{ color }}>
                            {count}
                        </Text>
                    </View>
                )}
            </View>
            <Text className="!text-xs text-muted-foreground">{subtitle}</Text>
        </View>
    </View>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const filterByName = (q: string, fields: (string | undefined)[]) => {
    if (!q.trim()) return true;
    const needle = q.trim().toLowerCase();
    return fields.some(f => (f ?? '').toLowerCase().includes(needle));
};

const buildSkippedSummary = (res: ICreateGroupResponse) => {
    const ghOk = res.groupHeadsAssigned?.length ?? 0;
    const ghSkip = res.groupHeadsSkipped ?? [];
    const dOk = res.departmentsAssigned?.length ?? 0;
    const dSkip = res.departmentsSkipped ?? [];
    const lines: string[] = [];
    lines.push(`Group heads: ${ghOk} assigned, ${ghSkip.length} skipped`);
    lines.push(`Departments: ${dOk} assigned, ${dSkip.length} skipped`);
    if (ghSkip.length) {
        lines.push('');
        lines.push('Skipped group heads:');
        ghSkip.forEach(s => lines.push(`• ${s.userId} — ${s.reason}`));
    }
    if (dSkip.length) {
        lines.push('');
        lines.push('Skipped departments:');
        dSkip.forEach(s => lines.push(`• ${s.departmentId} — ${s.reason}`));
    }
    return lines.join('\n');
};

// ─── Main screen ──────────────────────────────────────────────────────────────

const AdminCreateGroup: React.FC = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const [ghCampusId, setGhCampusId] = useState<string | null>(null);
    const [ghQuery, setGhQuery] = useState('');
    const [ghSelected, setGhSelected] = useState<string[]>([]);

    const [deptCampusId, setDeptCampusId] = useState<string | null>(null);
    const [deptQuery, setDeptQuery] = useState('');
    const [deptSelected, setDeptSelected] = useState<string[]>([]);

    const { data: campuses = [] } = useGetCampusesQuery();

    const { data: campusUsers = [], isLoading: campusUsersLoading } = useGetUsersQuery(
        { campusId: ghCampusId as string },
        { skip: !ghCampusId }
    );
    const { data: allGhUsers = [], isLoading: allGhLoading } = useGetGroupHeadUsersQuery({}, {
        skip: !!ghCampusId,
    });
    const ghUsers = (ghCampusId ? campusUsers : allGhUsers) as IUser[];
    const ghLoading = ghCampusId ? campusUsersLoading : allGhLoading;

    const { data: campusDepartments = [], isLoading: deptByCampusLoading } = useGetDepartmentsByCampusIdQuery(
        deptCampusId as string,
        { skip: !deptCampusId }
    );
    const { data: allDepartments = [], isLoading: allDeptLoading } = useGetDepartmentsQuery(undefined, {
        skip: !!deptCampusId,
    });
    const departments = (deptCampusId ? campusDepartments : allDepartments) as IDepartment[];
    const deptLoading = deptCampusId ? deptByCampusLoading : allDeptLoading;

    const filteredGhUsers = useMemo(
        () => ghUsers.filter(u => filterByName(ghQuery, [u.firstName, u.lastName, u.departmentName, u.email])),
        [ghUsers, ghQuery]
    );

    const filteredDepartments = useMemo(
        () => departments.filter(d => filterByName(deptQuery, [d.departmentName, d.description])),
        [departments, deptQuery]
    );

    const [createGroup, { isLoading: isCreating }] = useCreateGroupMutation();
    const canSubmit = name.trim().length >= 2 && !isCreating;

    // Determine current active step for the indicator
    const activeStep = name.trim().length >= 2 ? (ghSelected.length > 0 ? 2 : 1) : 0;

    const handleCreate = async () => {
        if (!canSubmit) return;
        const payload = {
            name: name.trim(),
            ...(description.trim() ? { description: description.trim() } : {}),
            ...(ghSelected.length ? { groupHeads: ghSelected } : {}),
            ...(deptSelected.length ? { departments: deptSelected } : {}),
        };
        try {
            const res = await createGroup(payload).unwrap();
            const hasSkipped = (res.groupHeadsSkipped?.length ?? 0) > 0 || (res.departmentsSkipped?.length ?? 0) > 0;
            const title = hasSkipped ? 'Group created — some items skipped' : 'Group created';
            Alert.alert(title, buildSkippedSummary(res), [{ text: 'OK', onPress: () => router.back() }]);
        } catch (err) {
            Alert.alert('Error', extractApiError(err, 'Could not create group. Please try again.'));
        }
    };

    const toggle = (list: string[], setList: (v: string[]) => void) => (id: string) => {
        setList(list.includes(id) ? list.filter(x => x !== id) : [...list, id]);
    };
    const remove = (list: string[], setList: (v: string[]) => void) => (id: string) => {
        setList(list.filter(x => x !== id));
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView className="flex-1 bg-background" keyboardShouldPersistTaps="handled">
                <View className="px-4 pt-4 pb-10 gap-4">

                    {/* Step indicator */}
                    <StepIndicator
                        current={activeStep}
                        counts={[0, ghSelected.length, deptSelected.length]}
                    />

                    {/* ─── Basic info ──────────────────────────────── */}
                    <Card className="p-4 gap-4">
                        <SectionHeader
                            icon="create-outline"
                            title="Group details"
                            subtitle="Give your group a name and optional description"
                            color="#8b5cf6"
                            bg="#ede9fe"
                        />
                        <Separator />
                        <View className="gap-1.5">
                            <Text className="!text-[12px] text-muted-foreground font-semibold">Group name *</Text>
                            <Input
                                placeholder="e.g. Worship Cluster"
                                value={name}
                                onChangeText={setName}
                                autoCapitalize="words"
                            />
                            {name.trim().length > 0 && name.trim().length < 2 && (
                                <Text className="!text-[11px] text-destructive">Name must be at least 2 characters</Text>
                            )}
                        </View>
                        <View className="gap-1.5">
                            <Text className="!text-[12px] text-muted-foreground font-semibold">Description</Text>
                            <Input
                                placeholder="Brief description (optional)"
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                numberOfLines={3}
                                style={{ minHeight: 72, textAlignVertical: 'top', paddingTop: 10 }}
                            />
                        </View>
                    </Card>

                    {/* ─── Group Heads ─────────────────────────────── */}
                    <Card className="p-4 gap-4">
                        <SectionHeader
                            icon="person-add-outline"
                            title="Group heads"
                            subtitle="Assign members who will oversee this group"
                            color="#3b82f6"
                            bg="#dbeafe"
                            count={ghSelected.length}
                        />
                        <Separator />
                        <AdminMultiPicker<IUser>
                            items={filteredGhUsers}
                            selectedIds={ghSelected}
                            onToggle={toggle(ghSelected, setGhSelected)}
                            onRemove={remove(ghSelected, setGhSelected)}
                            onClear={() => setGhSelected([])}
                            campuses={campuses}
                            campusId={ghCampusId}
                            onCampusChange={setGhCampusId}
                            query={ghQuery}
                            onQueryChange={setGhQuery}
                            isLoading={ghLoading}
                            searchPlaceholder="Search by name, email, or department…"
                            emptyText={
                                ghQuery
                                    ? 'No users match your search.'
                                    : ghCampusId
                                      ? 'No users found in this campus.'
                                      : 'No group heads found.'
                            }
                            renderItem={user => (
                                <View className="flex-row items-center gap-3">
                                    <AvatarComponent
                                        alt="profile-pic"
                                        imageUrl={user.pictureUrl || AVATAR_FALLBACK_URL}
                                    />
                                    <View className="flex-1">
                                        <Text className="font-bold">
                                            {`${Utils.capitalizeFirstChar(user.firstName)} ${Utils.capitalizeFirstChar(user.lastName)}`}
                                        </Text>
                                        <Text className="!text-xs text-muted-foreground">
                                            {user.departmentName ?? user.campus?.campusName ?? '—'}
                                        </Text>
                                    </View>
                                </View>
                            )}
                            renderChip={user => (
                                <Text className="!text-xs">
                                    {`${Utils.capitalizeFirstChar(user.firstName)} ${Utils.capitalizeFirstChar(user.lastName)}`}
                                </Text>
                            )}
                        />
                    </Card>

                    {/* ─── Departments ─────────────────────────────── */}
                    <Card className="p-4 gap-4">
                        <SectionHeader
                            icon="grid-outline"
                            title="Departments"
                            subtitle="Add departments that belong to this group"
                            color="#10b981"
                            bg="#d1fae5"
                            count={deptSelected.length}
                        />
                        <Separator />
                        <AdminMultiPicker<IDepartment>
                            items={filteredDepartments}
                            selectedIds={deptSelected}
                            onToggle={toggle(deptSelected, setDeptSelected)}
                            onRemove={remove(deptSelected, setDeptSelected)}
                            onClear={() => setDeptSelected([])}
                            campuses={campuses}
                            campusId={deptCampusId}
                            onCampusChange={setDeptCampusId}
                            query={deptQuery}
                            onQueryChange={setDeptQuery}
                            isLoading={deptLoading}
                            searchPlaceholder="Search departments…"
                            emptyText={
                                deptQuery
                                    ? 'No departments match your search.'
                                    : deptCampusId
                                      ? 'No departments in this campus.'
                                      : 'No departments found.'
                            }
                            renderItem={dept => (
                                <View className="flex-1">
                                    <Text className="font-bold">{dept.departmentName}</Text>
                                    {dept.description ? (
                                        <Text className="!text-xs text-muted-foreground" numberOfLines={1}>
                                            {dept.description}
                                        </Text>
                                    ) : null}
                                </View>
                            )}
                            renderChip={dept => <Text className="!text-xs">{dept.departmentName}</Text>}
                        />
                    </Card>

                    {/* ─── Summary preview ─────────────────────────── */}
                    {(ghSelected.length > 0 || deptSelected.length > 0) && (
                        <Card className="p-4 gap-3 bg-secondary/40">
                            <Text className="!text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                                Summary
                            </Text>
                            <View className="flex-row gap-3">
                                {ghSelected.length > 0 && (
                                    <View className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-100">
                                        <Ionicons name="person" size={12} color="#3b82f6" />
                                        <Text className="!text-xs font-semibold text-blue-700">
                                            {ghSelected.length} head{ghSelected.length !== 1 ? 's' : ''}
                                        </Text>
                                    </View>
                                )}
                                {deptSelected.length > 0 && (
                                    <View className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100">
                                        <Ionicons name="grid" size={12} color="#10b981" />
                                        <Text className="!text-xs font-semibold text-emerald-700">
                                            {deptSelected.length} dept{deptSelected.length !== 1 ? 's' : ''}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </Card>
                    )}

                    <Separator />

                    <Button
                        variant="default"
                        onPress={handleCreate}
                        disabled={!canSubmit}
                        isLoading={isCreating}
                    >
                        Create Group
                    </Button>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default memo(AdminCreateGroup);
