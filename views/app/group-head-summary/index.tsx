import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, TouchableOpacity, View } from 'react-native';
import { Text } from '~/components/ui/text';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { THEME_CONFIG } from '@config/appConfig';
import { AVATAR_FALLBACK_URL } from '@constants/index';
import AvatarComponent from '@components/atoms/avatar';
import ViewWrapper from '@components/layout/viewWrapper';
import ErrorBoundary from '@components/composite/error-boundary';
import { FlatListSkeleton } from '@components/layout/skeleton';
import useGroup from '@hooks/group';
import useAppColorMode from '@hooks/theme/colorMode';
import { useGetGroupSummaryQuery } from '@store/services/group';
import { useGetGroupDepartmentsQuery } from '@store/services/grouphead';
import { IGHGroupDepartment } from '@store/types';
import Utils from '@utils/index';
import { Card } from '~/components/ui/card';
import { cn } from '~/lib/utils';

// ─── First-time GH empty state ────────────────────────────────────────────────

const FirstTimeGHEmptyState: React.FC = () => (
    <View className="flex-1 items-center justify-center px-8 gap-6">
        <View className="w-20 h-20 rounded-3xl bg-secondary items-center justify-center">
            <Ionicons name="people-outline" size={36} color="#71717a" />
        </View>
        <View className="items-center gap-2">
            <Text className="text-xl font-bold text-foreground text-center">Not assigned to a Group</Text>
            <Text className="text-base text-muted-foreground text-center leading-relaxed line-clamp-none">
                Your Group Head account hasn't been linked to a Group yet. Contact your Super Admin to get assigned.
            </Text>
        </View>
        <Card className="w-full p-4 bg-secondary/50">
            <Text className="text-sm text-muted-foreground text-center line-clamp-none">
                Once assigned, your Group's departments, reports, and workforce data will appear here.
            </Text>
        </Card>
    </View>
);

// ─── Summary stat strip ───────────────────────────────────────────────────────

interface IStatChipProps {
    label: string;
    value?: number;
    accent?: string;
    isLoading?: boolean;
}

const StatChip: React.FC<IStatChipProps> = ({ label, value, accent, isLoading }) => (
    <View className="items-center gap-0.5 flex-1">
        {isLoading ? (
            <View className="w-8 h-5 rounded bg-muted animate-pulse" />
        ) : (
            <Text className="text-2xl font-bold" style={accent ? { color: accent } : undefined}>
                {value ?? '—'}
            </Text>
        )}
        <Text className="text-sm text-muted-foreground text-center">{label}</Text>
    </View>
);

const SummaryStrip: React.FC<{ isLoading: boolean }> = ({ isLoading }) => {
    const { data: summary } = useGetGroupSummaryQuery();

    return (
        <View className="flex-row justify-between px-4 py-4 border-b border-border">
            <StatChip label="Departments" value={summary?.departmentCount} isLoading={isLoading} />
            <View className="w-px bg-border" />
            <StatChip label="Workers" value={summary?.totalWorkers} isLoading={isLoading} />
            <View className="w-px bg-border" />
            <StatChip
                label="Active"
                value={summary?.activeWorkers}
                accent={THEME_CONFIG.success}
                isLoading={isLoading}
            />
            <View className="w-px bg-border" />
            <StatChip
                label="Dormant"
                value={summary?.dormantWorkers}
                accent={THEME_CONFIG.rose}
                isLoading={isLoading}
            />
        </View>
    );
};

// ─── Campus filter chips ──────────────────────────────────────────────────────

const ALL_CAMPUSES = '__all__';

interface ICampusChipsProps {
    departments: IGHGroupDepartment[];
    selected: string;
    onSelect: (campusId: string) => void;
}

const CampusChips: React.FC<ICampusChipsProps> = ({ departments, selected, onSelect }) => {
    const campuses = useMemo(() => {
        const seen = new Set<string>();
        const result: { id: string; name: string }[] = [];
        departments.forEach(d => {
            if (d.campusId && d.campusName && !seen.has(d.campusId)) {
                seen.add(d.campusId);
                result.push({ id: d.campusId, name: d.campusName });
            }
        });
        return result;
    }, [departments]);

    if (campuses.length < 2) return null;

    return (
        <View className="px-4 pt-3 pb-1">
            <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={[{ id: ALL_CAMPUSES, name: 'All campuses' }, ...campuses]}
                keyExtractor={item => item.id}
                renderItem={({ item }) => {
                    const active = selected === item.id;
                    return (
                        <Pressable
                            onPress={() => onSelect(item.id)}
                            className={cn(
                                'mr-2 px-4 py-1.5 rounded-full border',
                                active ? 'bg-primary border-primary' : 'bg-background border-border'
                            )}
                        >
                            <Text className={cn('text-sm', active ? 'text-primary-foreground font-semibold' : 'text-foreground')}>
                                {item.name}
                            </Text>
                        </Pressable>
                    );
                }}
            />
        </View>
    );
};

// ─── Department list item ─────────────────────────────────────────────────────

const DepartmentRow: React.FC<{ item: IGHGroupDepartment }> = React.memo(({ item }) => {
    const { borderColor } = useAppColorMode();

    const handlePress = () => {
        router.push({
            pathname: '/workforce-summary/workforce-management',
            params: {
                departmentId: item._id,
                departmentName: item.departmentName,
                campusId: item.campusId,
            },
        });
    };

    const activePercent =
        item.workerCount > 0 ? Math.round((item.activeCount / item.workerCount) * 100) : 0;

    return (
        <TouchableOpacity
            activeOpacity={0.6}
            onPress={handlePress}
            className="flex-row items-center px-4 py-4 border-b-[0.2px] border-border gap-4"
            style={{ borderBottomColor: borderColor }}
        >
            {/* HOD avatar */}
            <AvatarComponent
                alt="hod"
                className="h-12 w-12"
                imageUrl={item.hodPictureUrl || AVATAR_FALLBACK_URL}
            />

            {/* Department info */}
            <View className="flex-1 gap-1">
                <Text className="font-bold text-foreground">
                    {Utils.capitalizeFirstChar(item.departmentName)}
                </Text>
                {(item.campusName) ? (
                    <Text className="text-sm text-muted-foreground">{item.campusName}</Text>
                ) : null}
                {item.hodName ? (
                    <Text className="text-sm text-muted-foreground">HOD: {item.hodName}</Text>
                ) : null}

                {/* Activity bar */}
                <View className="mt-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                    <View
                        className="h-full rounded-full bg-green-500"
                        style={{ width: `${activePercent}%` }}
                    />
                </View>
            </View>

            {/* Worker counts */}
            <View className="items-end gap-1">
                <View className="flex-row items-center gap-1">
                    <Ionicons name="people" size={13} color={THEME_CONFIG.primaryLight} />
                    <Text className="text-sm font-semibold">{item.workerCount}</Text>
                </View>
                <View className="flex-row items-center gap-1">
                    <View className="w-2 h-2 rounded-full bg-green-500" />
                    <Text className="text-sm text-muted-foreground">{item.activeCount} active</Text>
                </View>
                {item.dormantCount > 0 && (
                    <View className="flex-row items-center gap-1">
                        <View className="w-2 h-2 rounded-full bg-rose-400" />
                        <Text className="text-sm text-muted-foreground">{item.dormantCount} dormant</Text>
                    </View>
                )}
                <Ionicons name="chevron-forward" size={14} color="#a1a1aa" />
            </View>
        </TouchableOpacity>
    );
});

// ─── Empty state ──────────────────────────────────────────────────────────────

const EmptyDepartments: React.FC = () => (
    <View className="flex-1 items-center justify-center py-16 px-8 gap-4">
        <Ionicons name="folder-open-outline" size={48} color="#a1a1aa" />
        <Text className="text-base text-muted-foreground text-center">
            No departments found in your group
        </Text>
    </View>
);

// ─── Main screen ──────────────────────────────────────────────────────────────

const GHWorkforceSummary: React.FC = () => {
    const { isFirstTimeGH, hasGroup } = useGroup();
    const [campusFilter, setCampusFilter] = useState<string>(ALL_CAMPUSES);

    const {
        data: allDepartments = [],
        isLoading,
        isFetching,
        refetch,
    } = useGetGroupDepartmentsQuery(undefined, { skip: isFirstTimeGH });

    const departments = useMemo(() => {
        const base =
            campusFilter === ALL_CAMPUSES
                ? allDepartments
                : allDepartments.filter(d => d.campusId === campusFilter);
        return Utils.sortStringAscending(base, 'departmentName');
    }, [allDepartments, campusFilter]);

    const handleRefresh = useCallback(() => {
        refetch();
    }, [refetch]);

    if (isFirstTimeGH || !hasGroup) {
        return (
            <ViewWrapper className="flex-1">
                <FirstTimeGHEmptyState />
            </ViewWrapper>
        );
    }

    return (
        <ErrorBoundary>
            <ViewWrapper noPadding className="flex-1">
                {/* Summary KPI strip */}
                <SummaryStrip isLoading={isLoading} />

                {/* Campus filter chips — only when departments span multiple campuses */}
                <CampusChips
                    departments={allDepartments}
                    selected={campusFilter}
                    onSelect={setCampusFilter}
                />

                {/* Department list */}
                {isLoading ? (
                    <View className="px-4 pt-4">
                        <FlatListSkeleton count={6} />
                    </View>
                ) : (
                    <FlatList
                        data={departments}
                        keyExtractor={item => item._id}
                        renderItem={({ item }) => <DepartmentRow item={item} />}
                        ListEmptyComponent={EmptyDepartments}
                        refreshControl={
                            <RefreshControl
                                refreshing={isFetching && !isLoading}
                                onRefresh={handleRefresh}
                                tintColor={THEME_CONFIG.primaryLight}
                            />
                        }
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={departments.length === 0 ? { flex: 1 } : undefined}
                        ListFooterComponent={
                            isFetching && !isLoading ? (
                                <ActivityIndicator className="py-4" />
                            ) : null
                        }
                    />
                )}
            </ViewWrapper>
        </ErrorBoundary>
    );
};

export default GHWorkforceSummary;
