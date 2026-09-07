import React, { useCallback, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { Icon } from '@rneui/themed';
import { useCountUp } from 'use-count-up';

import { Text } from '~/components/ui/text';
import { Card, CardContent } from '~/components/ui/card';
import { Skeleton } from '~/components/ui/skeleton';
import { cn } from '~/lib/utils';
import { THEME_CONFIG } from '~/config/appConfig';
import ROAST_COPY, { pluralise } from '~/constants/roast-copy';
import { useAppDispatch, useAppSelector } from '~/store/hooks';
import { roastEngagementActions, roastEngagementSelectors } from '~/store/actions/roast-engagement';
import { useAcknowledgeStreakResetMutation, useGetStreakHistoryQuery } from '~/store/services/roast-engagement';
import { localTimezone, useStreak } from '~/hooks/roast-engagement';
import useReduceMotion from '~/hooks/roast-engagement/use-reduce-motion';
import StreakEmber from './StreakEmber';
import StreakCalendar from './StreakCalendar';
import StreakResetCard from './StreakResetCard';
import MilestoneBurst from './MilestoneBurst';

/** Mirrors the server's `roastEngagement.config`. Changing one without the other desyncs the ticks. */
export const MILESTONES = [7, 30, 100];

/**
 * Streak & history (US-4.x).
 *
 * Every number on this screen is the server's — `01_ARCHITECTURE.md` ADR-003. A device
 * clock is not a trustworthy input to a figure the worker cares about, and two handsets on
 * one account would otherwise disagree about the same streak. What is local is the
 * *presentation*: which milestone has been celebrated on this device, and whether motion
 * is wanted at all.
 */
const Streak: React.FC = () => {
    const dispatch = useAppDispatch();
    const reduceMotion = useReduceMotion();

    const { streak, isLoading } = useStreak();
    const celebrated = useAppSelector(roastEngagementSelectors.selectCelebratedMilestones);

    const [acknowledgeReset, { isLoading: isAcknowledging }] = useAcknowledgeStreakResetMutation();

    const { data: history, isFetching, refetch } = useGetStreakHistoryQuery({ months: 3, tz: localTimezone() });

    const [width, setWidth] = useState(0);

    const current = streak?.current ?? 0;
    const isAtRisk = !!streak?.isAtRisk;

    /**
     * The milestone still owed a celebration.
     *
     * Read from `milestonesAwarded` rather than `milestoneReached`, because the latter is
     * only non-null on the single ping that crossed the line — a worker who hits 30 days
     * while the app is closed would never see it otherwise. The highest unseen one wins,
     * so somebody returning after a long absence gets one burst, not three.
     */
    const pendingMilestone = useMemo(() => {
        const unseen = (streak?.milestonesAwarded ?? []).filter(milestone => !celebrated.includes(milestone));

        return unseen.length ? Math.max(...unseen) : null;
    }, [celebrated, streak?.milestonesAwarded]);

    const handleBurstFinished = useCallback(() => {
        if (pendingMilestone !== null) {
            dispatch(roastEngagementActions.markMilestoneCelebrated(pendingMilestone));
        }
    }, [dispatch, pendingMilestone]);

    const { value: counted } = useCountUp({
        isCounting: !reduceMotion && current > 0,
        end: current,
        duration: 1.1,
    });

    const displayed = reduceMotion ? current : (counted ?? current);

    return (
        <ScrollView
            className="flex-1 bg-background"
            contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
            refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        >
            {/* Before the ember, deliberately — a returning worker who sees a bare "0" with
                no explanation reads it as a punishment rather than a starting line. */}
            {!!streak?.wasReset && (
                <StreakResetCard
                    previous={streak.longest}
                    isDismissing={isAcknowledging}
                    onDismiss={() => acknowledgeReset()}
                />
            )}

            <View className="items-center py-6" onLayout={event => setWidth(event.nativeEvent.layout.width)}>
                {width > 0 && (
                    <MilestoneBurst
                        milestone={pendingMilestone}
                        onFinished={handleBurstFinished}
                        width={width}
                        height={220}
                    />
                )}

                <StreakEmber current={current} isAtRisk={isAtRisk} size={120} />

                {isLoading ? (
                    <Skeleton className="h-14 w-24 rounded-xl mt-3" />
                ) : (
                    <Text
                        // The ember is hidden from assistive tech, so this is the one node
                        // that has to say the whole thing.
                        accessibilityLabel={`${pluralise(current, 'day')} streak, ${
                            current === 0 ? 'not started' : isAtRisk ? 'at risk' : 'active'
                        }`}
                        className={cn('font-bold mt-3', current >= 100 ? '!text-6xl' : '!text-5xl')}
                    >
                        {displayed}
                    </Text>
                )}

                <Text className="!text-sm text-muted-foreground mt-1 text-center px-8">
                    {current === 0
                        ? 'Check in today to start your streak.'
                        : isAtRisk
                          ? ROAST_COPY.widget.footerAtRisk
                          : ROAST_COPY.widget.footerHealthy(current)}
                </Text>
            </View>

            <View className="flex-row gap-3">
                <Card className="flex-1">
                    <CardContent className="p-4 items-center gap-1">
                        <Text className="!text-xs text-muted-foreground uppercase">Longest</Text>
                        <Text className="!text-2xl font-bold">{streak?.longest ?? 0}</Text>
                    </CardContent>
                </Card>

                <Card className="flex-1">
                    <CardContent className="p-4 items-center gap-1">
                        <Text className="!text-xs text-muted-foreground uppercase">Days logged</Text>
                        <Text className="!text-2xl font-bold">
                            {history?.days.filter(day => day.engaged).length ?? 0}
                        </Text>
                    </CardContent>
                </Card>
            </View>

            <Text className="!text-sm font-semibold mt-8 mb-3">Last 3 months</Text>

            {!history ? (
                <Skeleton className="h-40 w-full rounded-2xl" />
            ) : width > 0 ? (
                <StreakCalendar days={history.days} width={width} />
            ) : null}

            <Text className="!text-sm font-semibold mt-8 mb-3">Milestones</Text>

            <View className="flex-row gap-3">
                {MILESTONES.map(milestone => {
                    const reached = (streak?.milestonesAwarded ?? []).includes(milestone);

                    return (
                        <Card key={milestone} className={cn('flex-1', !reached && 'opacity-60')}>
                            <CardContent className="p-4 items-center gap-1">
                                <Icon
                                    type="feather"
                                    name={reached ? 'check-circle' : 'circle'}
                                    size={18}
                                    color={reached ? THEME_CONFIG.success : THEME_CONFIG.lightGray}
                                />
                                <Text className="!text-sm font-semibold">{pluralise(milestone, 'day')}</Text>
                            </CardContent>
                        </Card>
                    );
                })}
            </View>
        </ScrollView>
    );
};

export default Streak;
