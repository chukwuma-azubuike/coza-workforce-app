import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import dayjs from 'dayjs';
import { Text } from '~/components/ui/text';
import { Skeleton } from '~/components/ui/skeleton';
import PickerSelect from '~/components/ui/picker-select';
import AvatarComponent from '~/components/atoms/avatar';
import Loading from '~/components/atoms/loading';
import { getRankIcon, getTrendIcon } from '../utils/icons';
import { AssimilationFunnel, StatCard, AssimilationStageBreakdown } from '../zone-dashboard/components/ZoneStats';
import {
    useGetAssimilationStagesQuery,
    useGetAssimilationSubStagesQuery,
    useGetWorkerGuestsByStageQuery,
    useGetWorkerProfileQuery,
    useGetZonesQuery,
    useUpdateGuestMutation,
} from '~/store/services/roast-crm';
import useInfiniteData from '~/hooks/fetch-more-data/use-infinite-data';
import { AssimilationStage, Guest, WorkerLeaderboardEntry } from '~/store/types';
import type { WorkerGuestsPayload, WorkerStageBreakdown } from '~/store/types/roast-crm';
import { AVATAR_FALLBACK_URL } from '~/constants';

const GuestListView = React.lazy(() => import('../components/GuestListView'));

const STAGE_BREAKDOWN_KEY: Partial<Record<AssimilationStage, keyof WorkerStageBreakdown>> = {
    [AssimilationStage.INVITED]: 'invited',
    [AssimilationStage.ATTENDED]: 'attended',
    [AssimilationStage.BEING_DISCIPLED]: 'discipled',
    [AssimilationStage.ASSIMILATED]: 'assimilated',
};

const toBreakdown = (stageBreakdown?: WorkerStageBreakdown): AssimilationStageBreakdown => {
    const countFor = (label: AssimilationStage) => {
        const key = STAGE_BREAKDOWN_KEY[label];
        return (key && stageBreakdown?.[key]?.count) ?? 0;
    };

    return {
        invitedCount: countFor(AssimilationStage.INVITED),
        attendedCount: countFor(AssimilationStage.ATTENDED),
        discipleCount: countFor(AssimilationStage.BEING_DISCIPLED),
        joinedCount: countFor(AssimilationStage.ASSIMILATED),
        totalGuests: Object.values(stageBreakdown ?? {}).reduce((sum, entry) => sum + (entry?.count ?? 0), 0),
    };
};

type WorkerProfileParams = Partial<WorkerLeaderboardEntry> & { workerId: string };

export function WorkerProfile() {
    const params = useLocalSearchParams() as unknown as WorkerProfileParams;
    const { workerId, name, pictureUrl, zone: zoneName, campus, trend } = params;

    const [selectedPeriodCode, setSelectedPeriodCode] = useState<'' | '7d' | '30d' | '90d'>('');
    const [date, setDate] = useState<{ startDate?: number; endDate?: number }>({});

    const handleDateRangeChange = useCallback((period: '' | '7d' | '30d' | '90d') => {
        setSelectedPeriodCode(period);

        if (!period) return setDate({});

        setDate({
            startDate: dayjs().subtract(Number(period.replace('d', '')), 'day').valueOf(),
            endDate: dayjs().valueOf(),
        });
    }, []);

    // The worker leaderboard row only carries a zone *name*, not an id, but the
    // worker-profile endpoint is scoped by zoneId - resolve it from the zones list.
    // Try an exact match first, then fall back to a loose contains-match in case the
    // leaderboard's zone label and the canonical zone name differ slightly.
    const { data: zones = [] } = useGetZonesQuery({});
    const zoneId = useMemo(() => {
        const target = zoneName?.trim().toLowerCase();
        if (!target) return undefined;

        const exact = zones.find(z => z.name?.trim().toLowerCase() === target);
        if (exact) return exact._id;

        const partial = zones.find(z => {
            const zn = z.name?.trim().toLowerCase();
            return zn && (zn.includes(target) || target.includes(zn));
        });
        return partial?._id;
    }, [zones, zoneName]);

    const { data: assimilationStagesRaw = [] } = useGetAssimilationStagesQuery();
    const assimilationStages = useMemo(
        () => [...assimilationStagesRaw].sort((a, b) => a.order - b.order),
        [assimilationStagesRaw]
    );
    const { data: assimilationSubStages = [] } = useGetAssimilationSubStagesQuery();

    const [selectedStageId, setSelectedStageId] = useState<string | undefined>();

    useEffect(() => {
        if (!selectedStageId && assimilationStages.length) {
            setSelectedStageId(assimilationStages[0]?._id);
        }
    }, [assimilationStages, selectedStageId]);

    const {
        data: workerProfile,
        isLoading: profileLoading,
        isFetching: profileFetching,
        isError: profileError,
        refetch: refetchProfile,
    } = useGetWorkerProfileQuery({ zoneId: zoneId as string, workerId, ...date }, { skip: !zoneId || !workerId });

    const [updateGuest] = useUpdateGuestMutation();
    const onGuestUpdate = useCallback(async (guestId: string, assimilationSubStageId: string) => {
        try {
            await updateGuest({ _id: guestId, assimilationSubStageId });
        } catch (error) { }
    }, []);

    const handleViewGuest = useCallback((guest: Guest) => {
        router.push({ pathname: '/roast-crm/guests/profile', params: guest as any });
    }, []);

    const {
        refetch,
        isLoading,
        hasNextPage,
        fetchNextPage,
        pagination,
        isFetchingNextPage,
        data: guests,
    } = useInfiniteData<Guest, WorkerGuestsPayload>(
        { workerId, stageId: selectedStageId as string, zoneId, limit: 20, ...date },
        useGetWorkerGuestsByStageQuery as any,
        '_id',
        !selectedStageId || !workerId
    );

    const handleRefreshAll = useCallback(() => {
        refetchProfile();
        refetch();
    }, [refetchProfile, refetch]);

    const stageBreakdown = useMemo(
        () => toBreakdown(workerProfile?.stageBreakdown),
        [workerProfile?.stageBreakdown]
    );

    const profileHeader = (
        <View className="p-4 gap-4">
            <View className="flex-row items-center gap-4">
                {profileLoading ? (
                    <Skeleton className="w-6 h-6 rounded-full" />
                ) : (
                    typeof workerProfile?.rank === 'number' && getRankIcon(workerProfile.rank)
                )}
                <AvatarComponent
                    imageUrl={pictureUrl || AVATAR_FALLBACK_URL}
                    alt={`${name}-picture`}
                    className="w-16 h-16"
                />
                <View className="flex-1">
                    <Text className="text-2xl font-bold">{workerProfile?.name ?? name}</Text>
                    <Text className="text-muted-foreground">
                        {[workerProfile?.zone ?? zoneName, workerProfile?.campus ?? campus].filter(Boolean).join(' · ') ||
                            'Zone unknown'}
                    </Text>
                </View>
                {!!trend && getTrendIcon(trend)}
            </View>

            <View className="gap-4">
                <View className="flex-row items-center justify-between gap-4">
                    <Text className="font-semibold text-lg">Score Breakdown</Text>
                    <View className="flex-1">
                        <PickerSelect
                            valueKey="_id"
                            labelKey="name"
                            items={[
                                { _id: '', name: 'All Time' },
                                { _id: '7d', name: 'Last 7 Days' },
                                { _id: '30d', name: 'Last 30 Days' },
                                { _id: '90d', name: 'Last 90 Days' },
                            ]}
                            className="!h-10"
                            value={selectedPeriodCode}
                            placeholder="Select Period"
                            onValueChange={handleDateRangeChange}
                        />
                    </View>
                </View>
                {!zoneId && !!zoneName ? (
                    <Text className="text-muted-foreground">
                        Couldn't match "{zoneName}" to a zone, so the score breakdown isn't available for this
                        worker.
                    </Text>
                ) : profileError ? (
                    <Text className="text-destructive">Failed to load this worker's score breakdown.</Text>
                ) : profileLoading ? (
                    <View className="flex-row flex-wrap gap-4">
                        {[...Array(4)].map((_, i) => (
                            <Skeleton key={i} className="min-w-[20%] h-24 flex-1" />
                        ))}
                    </View>
                ) : (
                    <View className="flex-row flex-wrap gap-4">
                        <StatCard value={workerProfile?.score ?? 0} label="Total Score" color="text-blue-600" />
                        <StatCard
                            value={workerProfile?.conversions ?? 0}
                            label="Conversions"
                            color="text-green-600"
                        />
                        <StatCard
                            value={workerProfile?.guestsInPeriod ?? workerProfile?.totalGuests ?? 0}
                            label="Guests"
                            color="text-purple-600"
                        />
                        <StatCard
                            value={workerProfile?.timelines ?? 0}
                            label="Engagements"
                            color="text-orange-600"
                        />
                    </View>
                )}
            </View>

            <View className="gap-2">
                <Text className="font-semibold text-lg">Guests by Stage</Text>
                {!zoneId && !!zoneName && (
                    <Text className="text-muted-foreground text-sm">
                        Counts unavailable until this worker's zone can be matched - tap a stage below to still
                        filter the guest list.
                    </Text>
                )}
                <AssimilationFunnel
                    stages={assimilationStages}
                    breakdown={stageBreakdown}
                    selectedStageId={selectedStageId}
                    onSelectStage={id => id && setSelectedStageId(id)}
                />
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-background">
            <React.Suspense fallback={<Loading cover />}>
                <GuestListView
                    type="zone"
                    refetch={handleRefreshAll}
                    isLoading={isLoading || profileFetching}
                    hasNextPage={hasNextPage}
                    onGuestUpdate={onGuestUpdate}
                    fetchNextPage={fetchNextPage}
                    total={pagination?.total ?? 0}
                    handleViewGuest={handleViewGuest}
                    displayGuests={guests as Guest[]}
                    isFetchingNextPage={isFetchingNextPage}
                    assimilationSubStages={assimilationSubStages}
                    ListHeaderComponent={profileHeader}
                />
            </React.Suspense>
        </View>
    );
}
