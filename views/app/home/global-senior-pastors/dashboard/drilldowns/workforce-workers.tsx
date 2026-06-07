import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Shield } from 'lucide-react-native';
import { Text } from '~/components/ui/text';
import { Separator } from '~/components/ui/separator';
import ViewWrapper from '~/components/layout/viewWrapper';
import ErrorBoundary from '@components/composite/error-boundary';
import AvatarComponent from '~/components/atoms/avatar';
import { useGetGspDepartmentWorkersQuery, IGspWorkerRow } from '@store/services/gsp-dashboard';
import { THEME_CONFIG } from '@config/appConfig';
import { SectionCard, SectionEmpty, SectionError, SectionSkeleton } from '../components/states';
import RatePill from '../components/rate-pill';
import ContactRow from '../components/contact-row';
import { formatCompactNumber } from '../lib';
import { gspRoutes } from '../routes';
import StatusTag from '~/components/atoms/status-tag';
import { AVATAR_FALLBACK_URL } from '~/constants';

const WorkerCard: React.FC<{
    worker: IGspWorkerRow;
    win: { startDate?: number; endDate?: number };
    isLast: boolean;
}> = React.memo(({ worker, win, isLast }) =>
(
    <React.Fragment>
        <TouchableOpacity
            activeOpacity={0.7}
            className="py-2"
            onPress={() => gspRoutes.worker(worker.userId, win, `${worker.firstName} ${worker.lastName}`)}
        >
            {/* Avatar row */}
            <View className="flex-row items-center gap-3">
                <AvatarComponent
                    alt={worker.firstName}
                    imageUrl={worker.pictureUrl || AVATAR_FALLBACK_URL}
                    className="w-11 h-11"
                />
                <View className="flex-1 gap-0.5">
                    <View className="flex-row items-center gap-2 flex-wrap">
                        <Text numberOfLines={1} className="text-md font-semibold text-foreground flex-1">
                            {worker.firstName} {worker.lastName}
                        </Text>
                        {worker.isLeader && (
                            <StatusTag>{worker.roleLabel ?? 'Leader'}</StatusTag>
                        )}
                    </View>
                    {/* <View className="flex-row items-center gap-3">
                            <RatePill rate={worker?.attendance?.rate} size="sm" />
                            <Text className="!text-[12px] text-muted-foreground">
                                {formatCompactNumber((worker?.attendance?.present ?? 0) + (worker?.attendance?.late ?? 0))}/{formatCompactNumber(worker?.attendance?.expected ?? 0)} attended
                            </Text>
                        </View> */}
                </View>
            </View>

            {/* Mini attendance bar */}
            {/* <View className="flex-row h-1.5 rounded-full overflow-hidden bg-secondary ml-14">
                    {[
                        { v: worker?.attendance?.present, c: THEME_CONFIG.success },
                        { v: worker?.attendance?.late, c: THEME_CONFIG.warning },
                        { v: worker?.attendance?.absent, c: THEME_CONFIG.error },
                    ].map(({ v, c }, i) => (
                        <View key={i} style={{ flex: Math.max(0.0001, v), backgroundColor: c }} />
                    ))}
                </View> */}

            {/* Badges + quick-contact */}
            <View className="flex-row items-center gap-3 ml-14">
                {(worker?.permissionsApproved ?? 0) > 0 && (
                    <Text className="!text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                        {worker.permissionsApproved} permissions
                    </Text>
                )}
                {(worker?.openTickets ?? 0) > 0 && (
                    <Text className="!text-[11px] text-red-600 dark:text-red-400 font-medium">
                        {worker.openTickets} tickets
                    </Text>
                )}
            </View>

            {/* Inline contact icons — only the available ones */}
            {/* <View className="ml-14">
                    <ContactRow contact={worker.contact} />
                </View> */}
        </TouchableOpacity>
        {!isLast && <Separator />}
    </React.Fragment>
));

WorkerCard.displayName = 'WorkerCard';

const WorkforceWorkers: React.FC = () => {
    const { departmentId, departmentName, startDate, endDate } = useLocalSearchParams<{
        departmentId: string;
        departmentName?: string;
        startDate?: string;
        endDate?: string;
    }>();

    const win = {
        startDate: startDate ? Number(startDate) : undefined,
        endDate: endDate ? Number(endDate) : undefined,
    };

    const { data, isLoading, isError, refetch } = useGetGspDepartmentWorkersQuery(
        { departmentId: departmentId as string, ...win },
        { skip: !departmentId }
    );

    const workers = data?.workers ?? [];
    // Leaders float to top (server already sorts but guard client-side too)
    const sorted = React.useMemo(
        () => [...workers].sort((a, b) => (b.isLeader ? 1 : 0) - (a.isLeader ? 1 : 0)),
        [workers]
    );

    const leaderCount = sorted.filter(w => w.isLeader).length;

    return (
        <ViewWrapper scroll noPadding refreshing={false} onRefresh={refetch} className="flex-1">
            <View className="px-4 gap-6 pt-4 pb-10">
                {/* Header */}
                <View className="gap-0.5">
                    <Text className="!text-[13px] font-semibold uppercase tracking-widest text-muted-foreground">
                        Department
                    </Text>
                    <Text className="text-2xl font-bold text-foreground">
                        {data?.department.departmentName ?? departmentName ?? 'Workers'}
                    </Text>
                    {sorted.length > 0 && (
                        <Text className="text-sm text-muted-foreground">
                            {sorted.length} workers · {leaderCount} leader{leaderCount !== 1 ? 's' : ''}
                        </Text>
                    )}
                </View>

                {isLoading ? (
                    <SectionSkeleton rows={10} />
                ) : isError ? (
                    <SectionCard>
                        <SectionError onRetry={refetch} />
                    </SectionCard>
                ) : !sorted.length ? (
                    <SectionCard>
                        <SectionEmpty message="No workers found for this department." />
                    </SectionCard>
                ) : (
                    <ErrorBoundary>
                        <SectionCard className="gap-0">
                            {sorted.map((w, i) => (
                                <WorkerCard
                                    key={w.userId}
                                    worker={w}
                                    win={win}
                                    isLast={i === sorted.length - 1}
                                />
                            ))}
                        </SectionCard>
                    </ErrorBoundary>
                )}
            </View>
        </ViewWrapper>
    );
};

export default WorkforceWorkers;
