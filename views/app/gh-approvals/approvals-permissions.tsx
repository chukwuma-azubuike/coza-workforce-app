import React, { memo, useMemo, useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

import { Text } from '~/components/ui/text';
import { Card } from '~/components/ui/card';
import { Skeleton } from '~/components/ui/skeleton';
import { Separator } from '~/components/ui/separator';
import AvatarComponent from '@components/atoms/avatar';
import ErrorBoundary from '@components/composite/error-boundary';
import { AVATAR_FALLBACK_URL } from '@constants/index';
import { useGetPermissionsQuery } from '@store/services/permissions';
import { IPermission } from '@store/types';
import Utils from '@utils/index';
import { cn } from '~/lib/utils';
import FilterChip from './approvals-filter-chip';

type PermFilter = 'PENDING' | 'APPROVED' | 'DECLINED';

const FILTERS: { key: PermFilter; label: string }[] = [
    { key: 'PENDING', label: 'Pending' },
    { key: 'APPROVED', label: 'Approved' },
    { key: 'DECLINED', label: 'Declined' },
];

const STATUS_STYLES: Record<string, { container: string; dot: string; text: string }> = {
    PENDING: {
        container: 'bg-amber-100 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800',
        dot: 'bg-amber-500',
        text: 'text-amber-700 dark:text-amber-400',
    },
    APPROVED: {
        container: 'bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800',
        dot: 'bg-green-600',
        text: 'text-green-700 dark:text-green-400',
    },
    DECLINED: {
        container: 'bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800',
        dot: 'bg-red-600',
        text: 'text-red-700 dark:text-red-400',
    },
    REJECTED: {
        container: 'bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800',
        dot: 'bg-red-600',
        text: 'text-red-700 dark:text-red-400',
    },
    REVIEW_REQUESTED: {
        container: 'bg-amber-100 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800',
        dot: 'bg-amber-500',
        text: 'text-amber-700 dark:text-amber-400',
    },
    SUBMITTED: {
        container: 'bg-blue-100 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800',
        dot: 'bg-blue-500',
        text: 'text-blue-700 dark:text-blue-400',
    },
};

const PermissionRow: React.FC<IPermission> = permission => {
    const { requestor, categoryName, startDate, endDate, dateCreated, status } = permission;

    const name = `${Utils.capitalizeFirstChar(requestor?.firstName)} ${Utils.capitalizeFirstChar(requestor?.lastName)}`;
    const dayCount = Math.max(1, dayjs(endDate).diff(dayjs(startDate), 'day') + 1);
    const durationText = `${dayCount} ${dayCount === 1 ? 'day' : 'days'} · ${dayjs(startDate).format('D MMM')} – ${dayjs(endDate).format('D MMM')}`;
    const submittedWhen = dateCreated ? `submitted ${dayjs(dateCreated).fromNow()}` : '';

    const statusKey = (status ?? 'PENDING') as string;
    const style = STATUS_STYLES[statusKey] ?? STATUS_STYLES.PENDING;
    const statusLabel = Utils.capitalizeFirstChar((status ?? 'PENDING').replace(/_/g, ' '));

    const handlePress = () => {
        router.push({ pathname: '/permissions/permission-details', params: permission as any });
    };

    return (
        <TouchableOpacity activeOpacity={0.6} onPress={handlePress}>
            <View className="flex-row items-start gap-3 px-4 py-3.5">
                <AvatarComponent
                    alt="avatar"
                    className="w-10 h-10"
                    imageUrl={requestor?.pictureUrl ?? AVATAR_FALLBACK_URL}
                />
                <View className="flex-1 gap-1">
                    <View className="flex-row items-center justify-between gap-2">
                        <Text className="!text-sm font-semibold text-foreground flex-1 leading-snug">{name}</Text>
                        <View className="self-start flex-row items-center gap-1 rounded-full h-6 px-2.5 bg-secondary border border-border">
                            <Text className="!text-[11px] font-semibold text-primary">{categoryName}</Text>
                        </View>
                    </View>
                    <Text className="!text-xs font-medium text-foreground">{durationText}</Text>
                    <View className="flex-row items-center justify-between gap-2 mt-0.5">
                        <Text className="!text-[11px] text-muted-foreground">{submittedWhen}</Text>
                        <View className={cn('flex-row items-center gap-1.5 rounded-full h-5 px-2', style.container)}>
                            <View className={cn('w-1.5 h-1.5 rounded-full', style.dot)} />
                            <Text className={cn('!text-[10px] font-semibold', style.text)}>{statusLabel}</Text>
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const ApprovalsPermissions: React.FC = () => {
    const [filter, setFilter] = useState<PermFilter>('PENDING');

    const { data: permissions = [], isLoading, refetch } = useGetPermissionsQuery(
        { isGH: true, limit: 50 } as any
    );

    const filtered = useMemo(
        () => permissions.filter(p => p.status === filter),
        [permissions, filter]
    );

    return (
        <View className="flex-1">
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="py-3 grow-0 shrink-0"
                contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
            >
                {FILTERS.map(f => (
                    <FilterChip key={f.key} active={filter === f.key} onPress={() => setFilter(f.key)}>
                        {f.label}
                    </FilterChip>
                ))}
            </ScrollView>

            <ScrollView className="flex-1">
                <View className="px-4 pb-8">
                    {isLoading ? (
                        <View className="gap-3">
                            {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}
                        </View>
                    ) : filtered.length === 0 ? (
                        <View className="py-12 items-center">
                            <Text className="!text-sm text-muted-foreground text-center">
                                No {filter.toLowerCase()} permissions.
                            </Text>
                        </View>
                    ) : (
                        <Card className="p-0">
                            <ErrorBoundary>
                                {filtered.map((permission, i) => (
                                    <View key={permission._id}>
                                        {i > 0 && <Separator />}
                                        <PermissionRow {...permission} />
                                    </View>
                                ))}
                            </ErrorBoundary>
                        </Card>
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

export default memo(ApprovalsPermissions);
