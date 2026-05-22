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
import { useGetGroupPermissionsQuery } from '@store/services/permissions';
import useGroup from '@hooks/group';
import { IPermission } from '@store/types';
import Utils from '@utils/index';
import FilterChip from './approvals-filter-chip';
import StatusTag from '~/components/atoms/status-tag';
import Loading from '~/components/atoms/loading';
import RefreshControl from '~/components/RefreshControl';

type PermFilter = 'PENDING' | 'APPROVED' | 'REJECTED';

const FILTERS: { key: PermFilter; label: string }[] = [
    { key: 'PENDING', label: 'Pending' },
    { key: 'APPROVED', label: 'Approved' },
    { key: 'REJECTED', label: 'Rejected' },
];

const PermissionRow: React.FC<IPermission> = permission => {
    const { requestor, categoryName, startDate, endDate, dateCreated, status } = permission;

    const name = `${Utils.capitalizeFirstChar(requestor?.firstName)} ${Utils.capitalizeFirstChar(requestor?.lastName)}`;
    const dayCount = Math.max(1, dayjs(endDate).diff(dayjs(startDate), 'day') + 1);
    const durationText = `${dayCount} ${dayCount === 1 ? 'day' : 'days'} · ${dayjs(startDate).format('D MMM')} – ${dayjs(endDate).format('D MMM')}`;
    const submittedWhen = dateCreated ? `submitted ${dayjs(dateCreated).fromNow()}` : '';

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
                        <StatusTag>{categoryName}</StatusTag>
                    </View>
                    <Text className="!text-xs font-medium text-foreground">{durationText}</Text>
                    <View className="flex-row items-center justify-between gap-2 mt-0.5">
                        <Text className="!text-sm text-muted-foreground">{submittedWhen}</Text>
                        <StatusTag>{status}</StatusTag>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const ApprovalsPermissions: React.FC = () => {
    const [filter, setFilter] = useState<PermFilter>('PENDING');
    const { groupId } = useGroup();

    const { data: permissionsData, isLoading, isFetching, refetch } = useGetGroupPermissionsQuery(
        { status: filter, page: 1 },
        { skip: !groupId }
    );

    const filtered = useMemo(
        () => (permissionsData ?? []).filter(p => p.status === filter),
        [permissionsData, filter]
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
                            <Text className="text-muted-foreground text-center">
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
