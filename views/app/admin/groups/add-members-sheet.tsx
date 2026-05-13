import React, { useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, SafeAreaView, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import AvatarComponent from '@components/atoms/avatar';
import AdminMultiPicker from '@components/composite/admin-multi-picker';
import { AVATAR_FALLBACK_URL } from '@constants/index';
import Utils, { extractApiError } from '@utils/index';
import { useGetCampusesQuery } from '@store/services/campus';
import { useGetGroupHeadUsersQuery, useGetUsersQuery } from '@store/services/account';
import { useGetDepartmentsByCampusIdQuery, useGetDepartmentsQuery } from '@store/services/department';
import { useAssignDepartmentMutation, useAssignGroupHeadMutation } from '@store/services/group';
import type { IDepartment, IUser } from '@store/types';

type Mode = 'heads' | 'departments';

interface IProps {
    open: boolean;
    onClose: () => void;
    mode: Mode;
    groupId: string;
    excludeIds: string[];
    onAdded?: () => void;
}

const filterByText = (q: string, fields: (string | undefined)[]) => {
    if (!q.trim()) return true;
    const needle = q.trim().toLowerCase();
    return fields.some(f => (f ?? '').toLowerCase().includes(needle));
};

const AddMembersSheet: React.FC<IProps> = ({ open, onClose, mode, groupId, excludeIds, onAdded }) => {
    const [campusId, setCampusId] = useState<string | null>(null);
    const [query, setQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const { data: campuses = [] } = useGetCampusesQuery();

    // ─── Group heads data ──────────────────────────────────────────────
    const { data: campusUsers = [], isLoading: campusUsersLoading } = useGetUsersQuery(
        { campusId: campusId as string },
        { skip: mode !== 'heads' || !campusId }
    );
    const { data: allGhUsers = [], isLoading: allGhLoading } = useGetGroupHeadUsersQuery(
        {},
        { skip: mode !== 'heads' || !!campusId }
    );

    // ─── Departments data ──────────────────────────────────────────────
    const { data: campusDepartments = [], isLoading: deptByCampusLoading } = useGetDepartmentsByCampusIdQuery(
        campusId as string,
        { skip: mode !== 'departments' || !campusId }
    );
    const { data: allDepartments = [], isLoading: allDeptLoading } = useGetDepartmentsQuery(undefined, {
        skip: mode !== 'departments' || !!campusId,
    });

    const ghItems = useMemo(() => {
        const base = (campusId ? campusUsers : allGhUsers) as IUser[];
        return base
            .filter(u => !excludeIds.includes(u._id))
            .filter(u => filterByText(query, [u.firstName, u.lastName, u.departmentName, u.email]));
    }, [campusId, campusUsers, allGhUsers, excludeIds, query]);

    const deptItems = useMemo(() => {
        const base = (campusId ? campusDepartments : allDepartments) as IDepartment[];
        return base
            .filter(d => !excludeIds.includes(d._id))
            .filter(d => filterByText(query, [d.departmentName, d.description]));
    }, [campusId, campusDepartments, allDepartments, excludeIds, query]);

    const isLoading =
        mode === 'heads'
            ? campusId
                ? campusUsersLoading
                : allGhLoading
            : campusId
              ? deptByCampusLoading
              : allDeptLoading;

    const [assignHead, { isLoading: isAddingHead }] = useAssignGroupHeadMutation();
    const [assignDept, { isLoading: isAddingDept }] = useAssignDepartmentMutation();
    const isSubmitting = isAddingHead || isAddingDept;

    const reset = () => {
        setCampusId(null);
        setQuery('');
        setSelectedIds([]);
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    const handleSubmit = async () => {
        if (selectedIds.length === 0) return;
        try {
            if (mode === 'heads') {
                await Promise.all(selectedIds.map(userId => assignHead({ groupId, userId }).unwrap()));
            } else {
                await Promise.all(
                    selectedIds.map(departmentId => assignDept({ groupId, departmentId }).unwrap())
                );
            }
            onAdded?.();
            handleClose();
        } catch (err) {
            Alert.alert(
                'Error',
                extractApiError(
                    err,
                    mode === 'heads'
                        ? 'Could not assign one or more group heads.'
                        : 'Could not assign one or more departments.'
                )
            );
        }
    };

    const title = mode === 'heads' ? 'Add Group Heads' : 'Add Departments';
    const cta =
        selectedIds.length === 0
            ? `Add ${mode === 'heads' ? 'group heads' : 'departments'}`
            : `Add ${selectedIds.length} ${mode === 'heads' ? (selectedIds.length === 1 ? 'group head' : 'group heads') : selectedIds.length === 1 ? 'department' : 'departments'}`;

    return (
        <Modal
            visible={open}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={handleClose}
        >
            <SafeAreaView className="flex-1 bg-background">
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    {/* Header */}
                    <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
                        <Text className="text-lg font-bold text-foreground">{title}</Text>
                        <TouchableOpacity onPress={handleClose} hitSlop={10}>
                            <Ionicons name="close" size={22} color="#888" />
                        </TouchableOpacity>
                    </View>

                    {/* Picker */}
                    <View className="flex-1 px-4 pt-3">
                        {mode === 'heads' ? (
                            <AdminMultiPicker<IUser>
                                items={ghItems}
                                selectedIds={selectedIds}
                                onToggle={id =>
                                    setSelectedIds(s => (s.includes(id) ? s.filter(x => x !== id) : [...s, id]))
                                }
                                onRemove={id => setSelectedIds(s => s.filter(x => x !== id))}
                                onClear={() => setSelectedIds([])}
                                campuses={campuses}
                                campusId={campusId}
                                onCampusChange={setCampusId}
                                query={query}
                                onQueryChange={setQuery}
                                isLoading={isLoading}
                                searchPlaceholder="Search by name, email, or department…"
                                emptyText={
                                    query
                                        ? 'No users match your search.'
                                        : campusId
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
                        ) : (
                            <AdminMultiPicker<IDepartment>
                                items={deptItems}
                                selectedIds={selectedIds}
                                onToggle={id =>
                                    setSelectedIds(s => (s.includes(id) ? s.filter(x => x !== id) : [...s, id]))
                                }
                                onRemove={id => setSelectedIds(s => s.filter(x => x !== id))}
                                onClear={() => setSelectedIds([])}
                                campuses={campuses}
                                campusId={campusId}
                                onCampusChange={setCampusId}
                                query={query}
                                onQueryChange={setQuery}
                                isLoading={isLoading}
                                searchPlaceholder="Search departments…"
                                emptyText={
                                    query
                                        ? 'No departments match your search.'
                                        : campusId
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
                        )}
                    </View>

                    {/* Footer CTA */}
                    <View className="px-4 py-3 border-t border-border">
                        <Button
                            onPress={handleSubmit}
                            disabled={selectedIds.length === 0 || isSubmitting}
                            isLoading={isSubmitting}
                        >
                            {cta}
                        </Button>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </Modal>
    );
};

export default AddMembersSheet;
