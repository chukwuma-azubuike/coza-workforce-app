import React, { memo, useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { router } from 'expo-router';

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

const SectionLabel: React.FC<{ children: string }> = ({ children }) => (
    <Text className="!text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{children}</Text>
);

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

const AdminCreateGroup: React.FC = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    // Group Heads picker state
    const [ghCampusId, setGhCampusId] = useState<string | null>(null);
    const [ghQuery, setGhQuery] = useState('');
    const [ghSelected, setGhSelected] = useState<string[]>([]);

    // Departments picker state
    const [deptCampusId, setDeptCampusId] = useState<string | null>(null);
    const [deptQuery, setDeptQuery] = useState('');
    const [deptSelected, setDeptSelected] = useState<string[]>([]);

    const { data: campuses = [] } = useGetCampusesQuery();

    // Group heads — when a campus is selected, fetch users in that campus from the server.
    // Otherwise fall back to the global GH-role users list.
    const { data: campusUsers = [], isLoading: campusUsersLoading } = useGetUsersQuery(
        { campusId: ghCampusId as string },
        { skip: !ghCampusId }
    );
    const { data: allGhUsers = [], isLoading: allGhLoading } = useGetGroupHeadUsersQuery({}, {
        skip: !!ghCampusId,
    });
    const ghUsers = (ghCampusId ? campusUsers : allGhUsers) as IUser[];
    const ghLoading = ghCampusId ? campusUsersLoading : allGhLoading;

    // Departments — when a campus is selected, fetch its departments from the server.
    const { data: campusDepartments = [], isLoading: deptByCampusLoading } = useGetDepartmentsByCampusIdQuery(
        deptCampusId as string,
        { skip: !deptCampusId }
    );
    const { data: allDepartments = [], isLoading: allDeptLoading } = useGetDepartmentsQuery(undefined, {
        skip: !!deptCampusId,
    });
    const departments = (deptCampusId ? campusDepartments : allDepartments) as IDepartment[];
    const deptLoading = deptCampusId ? deptByCampusLoading : allDeptLoading;

    // Search input filters whatever the server returned.
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
                    <Card className="p-4 gap-3">
                        <SectionLabel>Basic info</SectionLabel>
                        <View className="gap-1.5">
                            <Text className="!text-[12px] text-muted-foreground font-medium">Group name *</Text>
                            <Input
                                placeholder="e.g. Worship Cluster"
                                value={name}
                                onChangeText={setName}
                                autoCapitalize="words"
                            />
                        </View>
                        <View className="gap-1.5">
                            <Text className="!text-[12px] text-muted-foreground font-medium">Description</Text>
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

                    <Card className="p-4 gap-3">
                        <SectionLabel>Group heads</SectionLabel>
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

                    <Card className="p-4 gap-3">
                        <SectionLabel>Departments</SectionLabel>
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
