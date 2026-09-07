import React, { useCallback, useEffect, useMemo } from 'react';
import { RefreshControl, TouchableOpacity, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { Icon } from '@rneui/themed';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import { Text } from '~/components/ui/text';
import { Skeleton } from '~/components/ui/skeleton';
import { THEME_CONFIG } from '~/config/appConfig';
import ROAST_COPY from '~/constants/roast-copy';
import {
    ContactChannel,
    QUALIFYING_ACTION_KIND,
    REMINDER_COMPLETED_VIA,
    ROAST_TASK_KIND,
    RoastTask,
} from '~/store/types';
import { useAppDispatch, useAppSelector } from '~/store/hooks';
import { roastEngagementActions, roastEngagementSelectors } from '~/store/actions/roast-engagement';
import {
    useCompleteReminderMutation,
    useDismissTaskMutation,
    useGetTodayTasksQuery,
} from '~/store/services/roast-engagement';
import { localTimezone, usePingAction, useStreak } from '~/hooks/roast-engagement';
import { openPhoneNumber } from '../utils/communication';
import useGuestNameIndex from '../hooks/use-guest-name-index';
import TaskRow from './TaskRow';
import StreakHeader from './StreakHeader';
import EmptyToday from './EmptyToday';

dayjs.extend(relativeTime);

/**
 * Today — the Task Feed, and the app's answer to "what do I do now".
 *
 * **Sections, not filters.** Overdue / Today / Later, always in that order, always all
 * three present when they have contents. A worker should never have to choose a filter to
 * discover what is urgent; the screen has already decided, and it decided the same way it
 * decided yesterday.
 *
 * The rows arrive **already composed** — `title` and `subtitle` are server-rendered
 * sentences. That is what keeps the push body and the in-app row from drifting: they are
 * one string, produced once.
 */

type Row = { kind: 'header'; id: string; label: string } | { kind: 'task'; id: string; task: RoastTask };

const SECTIONS = ['Overdue', 'Today', 'Later'] as const;

/**
 * Which section a task belongs to.
 *
 * `isOverdue` is the server's, not a local comparison — the device clock is the one input
 * that cannot be trusted here, and a phone an hour fast would otherwise silently promote
 * half the day's work into Overdue.
 */
export const sectionFor = (task: RoastTask, endOfDay: number): (typeof SECTIONS)[number] =>
    task.isOverdue ? 'Overdue' : Date.parse(task.dueAt) <= endOfDay ? 'Today' : 'Later';

export const buildRows = (tasks: RoastTask[], endOfDay: number): Row[] => {
    const grouped = new Map<string, RoastTask[]>(SECTIONS.map(section => [section, []]));

    tasks.forEach(task => grouped.get(sectionFor(task, endOfDay))?.push(task));

    return SECTIONS.flatMap(section => {
        const rows = grouped.get(section) ?? [];

        if (!rows.length) {
            return [];
        }

        return [
            { kind: 'header', id: `header-${section}`, label: section } as Row,
            ...rows
                .sort((a, b) => Date.parse(a.dueAt) - Date.parse(b.dueAt))
                .map(task => ({ kind: 'task', id: task._id, task }) as Row),
        ];
    });
};

const Today: React.FC = () => {
    const dispatch = useAppDispatch();

    const { streak } = useStreak();
    const { pingAction } = usePingAction();
    const guests = useGuestNameIndex();

    const cachedFeed = useAppSelector(roastEngagementSelectors.selectCachedFeed);
    const hasSeenIntro = useAppSelector(roastEngagementSelectors.selectHasSeenTodayIntro);

    const [completeReminder] = useCompleteReminderMutation();
    const [dismissTask] = useDismissTaskMutation();

    const { data, isLoading, isFetching, refetch } = useGetTodayTasksQuery({ tz: localTimezone() });

    // The last good response is kept for the offline render *and* for the widget snapshot,
    // which has no session of its own and can only draw what the app last left it.
    useEffect(() => {
        if (data) {
            dispatch(
                roastEngagementActions.setCachedFeed({
                    tasks: data.tasks,
                    counts: data.counts,
                    generatedAt: data.generatedAt,
                })
            );
        }
    }, [data, dispatch]);

    const feed = data ?? cachedFeed;

    // Only when the live query has nothing — a cached render that does not say so is a
    // screen quietly lying about how current it is.
    const staleLabel =
        !data && cachedFeed ? ROAST_COPY.today.stale(dayjs(cachedFeed.generatedAt).fromNow()) : undefined;

    const rows = useMemo(() => buildRows(feed?.tasks ?? [], dayjs().endOf('day').valueOf()), [feed?.tasks]);

    const openGuest = useCallback((task: RoastTask) => {
        if (task.deepLink) {
            router.push(task.deepLink as any);
            return;
        }

        if (task.guestId) {
            router.push({ pathname: '/roast-crm/guests/profile', params: { _id: task.guestId } });
        }
    }, []);

    const handlePrimary = useCallback(
        async (task: RoastTask) => {
            switch (task.kind) {
                case ROAST_TASK_KIND.REMINDER: {
                    if (!task.reminderId) {
                        // A REMINDER row without one is a server bug, not a dead button —
                        // fall through to the profile rather than swallowing the tap.
                        openGuest(task);
                        return;
                    }

                    try {
                        await completeReminder({
                            _id: task.reminderId,
                            completedVia: REMINDER_COMPLETED_VIA.APP,
                        }).unwrap();

                        pingAction(QUALIFYING_ACTION_KIND.REMINDER_COMPLETED, task.reminderId);
                    } catch {
                        // The optimistic patch rolls itself back; the row reappears.
                    }

                    return;
                }

                case ROAST_TASK_KIND.CALL_DUE:
                case ROAST_TASK_KIND.FOLLOW_UP: {
                    const phoneNumber = task.guestId ? guests[task.guestId]?.phoneNumber : undefined;

                    // No number on record — reassigned away, or captured without one. The
                    // profile is where they can fix that, so it is the honest fallback.
                    if (!phoneNumber) {
                        openGuest(task);
                        return;
                    }

                    await openPhoneNumber(phoneNumber, ContactChannel.CALL)();
                    return;
                }

                default:
                    openGuest(task);
            }
        },
        [completeReminder, guests, openGuest, pingAction]
    );

    const handleDismiss = useCallback(
        (task: RoastTask) => {
            dismissTask(task._id);
        },
        [dismissTask]
    );

    const renderItem = useCallback(
        ({ item }: { item: Row }) => {
            if (item.kind === 'header') {
                return (
                    <Text className="text-sm font-semibold uppercase text-muted-foreground mt-4 mb-2 tracking-wide">
                        {item.label}
                    </Text>
                );
            }

            return <TaskRow task={item.task} onPress={openGuest} onPrimary={handlePrimary} onDismiss={handleDismiss} />;
        },
        [handleDismiss, handlePrimary, openGuest]
    );

    if (isLoading && !feed) {
        return (
            <View className="flex-1 bg-background px-4 pt-4 gap-3">
                <Skeleton className="h-16 w-full rounded-2xl" />
                {[...Array(4)].map((_, index) => (
                    <Skeleton key={index} className="h-28 w-full rounded-2xl" />
                ))}
            </View>
        );
    }

    return (
        <View className="flex-1 bg-background">
            <FlashList
                data={rows}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                getItemType={item => item.kind}
                contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40 }}
                refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
                ListHeaderComponent={
                    <View>
                        <StreakHeader streak={streak} counts={feed?.counts} staleLabel={staleLabel} />

                        {!hasSeenIntro && (
                            <View className="flex-row gap-3 items-start bg-muted rounded-2xl p-4 mt-3">
                                <Icon type="feather" name="info" size={16} color={THEME_CONFIG.primary} />
                                <Text className="flex-1 !text-sm text-muted-foreground line-clamp-none">
                                    Roast will tell you who needs you each morning. Set your own reminders from any
                                    guest's profile.
                                </Text>
                                <TouchableOpacity
                                    activeOpacity={0.6}
                                    onPress={() => dispatch(roastEngagementActions.dismissTodayIntro())}
                                    accessibilityRole="button"
                                    accessibilityLabel="Dismiss introduction"
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <Icon type="feather" name="x" size={14} color={THEME_CONFIG.lightGray} />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                }
                ListEmptyComponent={<EmptyToday streak={streak?.current} />}
            />
        </View>
    );
};

export default Today;
