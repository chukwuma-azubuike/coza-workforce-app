import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import isToday from 'dayjs/plugin/isToday';
import isYesterday from 'dayjs/plugin/isYesterday';

dayjs.extend(relativeTime);
dayjs.extend(isToday);
dayjs.extend(isYesterday);

import ViewWrapper from '@components/layout/viewWrapper';
import { Text } from '~/components/ui/text';
import { Separator } from '~/components/ui/separator';
import { FlatListSkeleton } from '~/components/layout/skeleton';
import { EmptyState } from '~/components/ui/empty-state';
import { useAppSelector } from '~/store/hooks';
import { userSelectors } from '~/store/actions/users';
import useInfiniteData from '~/hooks/fetch-more-data/use-infinite-data';
import {
    INotificationRow,
    useGetNotificationsQuery,
    useMarkAllNotificationsReadMutation,
    useMarkNotificationsReadMutation,
} from '~/store/services/notification';
import { NOTIFICATION_CATEGORY } from '~/constants/notification-channels';
import { resolveInboxRowTarget } from '~/utils/notification-routing';

const PAGE_SIZE = 20;

/**
 * The real `category` enum, passed to the server as `?category=` rather than filtered
 * here — a client-side filter over a paginated list shows "no permissions" whenever the
 * first page happens to hold none, which is a lie the user cannot tell from an empty
 * inbox.
 *
 * `SYSTEM` has no chip on purpose: it is infrastructure noise to a worker, and it still
 * appears under All.
 */
const FILTERS: Array<{ key: NOTIFICATION_CATEGORY | 'ALL'; label: string }> = [
    { key: 'ALL', label: 'All' },
    { key: NOTIFICATION_CATEGORY.ATTENDANCE, label: 'Attendance' },
    { key: NOTIFICATION_CATEGORY.PERMISSION, label: 'Permissions' },
    { key: NOTIFICATION_CATEGORY.REPORT, label: 'Reports' },
    { key: NOTIFICATION_CATEGORY.TICKET, label: 'Tickets' },
    { key: NOTIFICATION_CATEGORY.ANNOUNCEMENT, label: 'Announcements' },
    { key: NOTIFICATION_CATEGORY.ACCOUNT, label: 'Account' },
];

const FILTER_CHIP_ACTIVE = 'h-8 px-3.5 rounded-full border items-center justify-center bg-primary border-primary';
const FILTER_CHIP_INACTIVE = 'h-8 px-3.5 rounded-full border items-center justify-center bg-background border-border';

/** `Today` / `Yesterday` / a date, per §8.4. */
const dayLabel = (date: string): string => {
    const day = dayjs(date);

    if (day.isToday()) {
        return 'Today';
    }

    if (day.isYesterday()) {
        return 'Yesterday';
    }

    return day.year() === dayjs().year() ? day.format('ddd, D MMM') : day.format('D MMM YYYY');
};

type IListEntry = { kind: 'header'; key: string; label: string } | { kind: 'row'; key: string; row: INotificationRow };

/**
 * Flattens the rows into a single list of day headers and rows.
 *
 * Sectioned rather than nested so `FlashList` still virtualises one flat array — a list
 * of lists defeats recycling, and this screen is the one place a user scrolls through
 * months of history.
 */
const toListEntries = (rows: INotificationRow[]): IListEntry[] => {
    const entries: IListEntry[] = [];
    let lastLabel: string | null = null;

    for (const row of rows) {
        const label = dayLabel(row.createdAt);

        if (label !== lastLabel) {
            entries.push({ kind: 'header', key: `header-${label}`, label });
            lastLabel = label;
        }

        entries.push({ kind: 'row', key: row._id, row });
    }

    return entries;
};

interface INotificationRowProps {
    row: INotificationRow;
    isRead: boolean;
    onPress: (row: INotificationRow) => void;
}

const NotificationListRow: React.FC<INotificationRowProps> = memo(({ row, isRead, onPress }) => (
    <TouchableOpacity activeOpacity={0.6} onPress={() => onPress(row)}>
        <View className={`px-4 py-3.5 flex-row gap-3 ${isRead ? '' : 'bg-primary/5'}`}>
            {/* Unread is carried by the dot *and* the title weight — §8.4 asks for more
                than colour, which a worker with a colour vision deficiency cannot read. */}
            <View className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${isRead ? 'bg-transparent' : 'bg-primary'}`} />
            <View className="flex-1 gap-0.5">
                <Text className={`!text-[13px] line-clamp-2 text-foreground ${isRead ? 'font-medium' : 'font-bold'}`}>
                    {row.title}
                </Text>
                <Text className="!text-[12px] line-clamp-none text-foreground leading-snug">{row.message}</Text>
                <Text className="!text-[11px] text-muted-foreground mt-0.5">{dayjs(row.createdAt).fromNow()}</Text>
            </View>
        </View>
    </TouchableOpacity>
));

NotificationListRow.displayName = 'NotificationListRow';

const Notifications: React.FC = () => {
    const user = useAppSelector(userSelectors.selectCurrentUser);
    const userId = (user?.userId ?? user?._id) as string | undefined;

    const [filter, setFilter] = useState<NOTIFICATION_CATEGORY | 'ALL'>('ALL');

    /**
     * Rows read on this screen, before or instead of the server saying so.
     *
     * Held here rather than patched into the RTK Query cache because `useInfiniteData`
     * merges pages with `uniqBy`, which keeps the *first* copy of a row — so a cache patch
     * to a row on page two would never reach the screen. A local set also survives the
     * refetch that follows, and reverting is a delete rather than an inverse patch.
     */
    const [locallyRead, setLocallyRead] = useState<Set<string>>(new Set());

    const [markRead] = useMarkNotificationsReadMutation();
    const [markAllRead, { isLoading: isMarkingAll }] = useMarkAllNotificationsReadMutation();

    const params = useMemo(
        () => ({
            userId: userId as string,
            limit: PAGE_SIZE,
            ...(filter === 'ALL' ? {} : { category: filter }),
        }),
        [userId, filter]
    );

    const { data, isLoading, isFetching, isFetchingNextPage, hasNextPage, fetchNextPage, refetch } = useInfiniteData<
        INotificationRow,
        typeof params
    >(params, useGetNotificationsQuery as any, '_id', !userId);

    const entries = useMemo(() => toListEntries(data), [data]);

    const hasUnread = useMemo(() => data.some(row => !row.isRead && !locallyRead.has(row._id)), [data, locallyRead]);

    /**
     * Guards against re-sending a read for a row the user taps twice, and against a
     * refetch resurrecting the request. Refs rather than state — this is bookkeeping, not
     * something the screen renders.
     */
    const inFlightReads = useRef<Set<string>>(new Set());

    const handlePress = useCallback(
        (row: INotificationRow) => {
            const alreadyRead = row.isRead || locallyRead.has(row._id);

            if (userId && !alreadyRead && !inFlightReads.current.has(row._id)) {
                inFlightReads.current.add(row._id);
                setLocallyRead(previous => new Set(previous).add(row._id));

                markRead({ userId, notificationIds: [row._id] })
                    .unwrap()
                    .catch(() => {
                        // Reverts silently. A toast here would interrupt the navigation the
                        // user actually asked for, to report a failure they cannot act on —
                        // and the next focus reconciles it anyway.
                        setLocallyRead(previous => {
                            const next = new Set(previous);
                            next.delete(row._id);
                            return next;
                        });
                    })
                    .finally(() => {
                        inFlightReads.current.delete(row._id);
                    });
            }

            // The row carries the same `url` + `content` the push did, so it resolves
            // through the same code path — including the allowlist, which is what stops a
            // row for a type this build predates from opening a dead screen.
            const target = resolveInboxRowTarget(row);

            if (target.isFallback) {
                // Already on the notification centre. Navigating here would push a second
                // copy of this screen onto the stack for no reason.
                return;
            }

            router.push({ pathname: target.pathname as any, params: target.params });
        },
        [userId, locallyRead, markRead]
    );

    const handleMarkAllRead = useCallback(() => {
        if (!userId) {
            return;
        }

        // Optimistic, and no confirmation dialog: §8.4 asks for one tap. Nothing is
        // destroyed — the rows remain, and an unread row that fails to update comes back
        // on the refetch that the invalidated tag triggers.
        //
        // The revert restores the *previous* set rather than emptying it, so a failure
        // here does not also undo the individual rows the user read a moment ago.
        const previouslyRead = locallyRead;

        setLocallyRead(previous => {
            const next = new Set(previous);
            data.forEach(row => next.add(row._id));
            return next;
        });

        markAllRead(userId)
            .unwrap()
            .catch(() => setLocallyRead(previouslyRead));
    }, [userId, data, locallyRead, markAllRead]);

    const handleRefresh = useCallback(() => {
        // The server is authoritative again after a refresh, so the local overlay is
        // dropped rather than left to mask a row someone marked unread elsewhere.
        setLocallyRead(new Set());
        refetch();
    }, [refetch]);

    const renderItem = useCallback(
        ({ item, index }: { item: IListEntry; index: number }) => {
            if (item.kind === 'header') {
                return (
                    <View className="px-4 pt-4 pb-1.5 bg-background">
                        <Text className="!text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                            {item.label}
                        </Text>
                    </View>
                );
            }

            const previous = entries[index - 1];

            return (
                <>
                    {previous?.kind === 'row' && <Separator />}
                    <NotificationListRow
                        row={item.row}
                        isRead={item.row.isRead || locallyRead.has(item.row._id)}
                        onPress={handlePress}
                    />
                </>
            );
        },
        [entries, locallyRead, handlePress]
    );

    return (
        <ViewWrapper className="flex-1" noPadding>
            <View className="flex-row items-center gap-2 pr-3">
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="py-3 grow shrink"
                    contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
                >
                    {FILTERS.map(entry => (
                        <TouchableOpacity
                            key={entry.key}
                            activeOpacity={0.7}
                            onPress={() => setFilter(entry.key)}
                            className={filter === entry.key ? FILTER_CHIP_ACTIVE : FILTER_CHIP_INACTIVE}
                        >
                            <Text
                                className={`!text-sm font-semibold ${
                                    filter === entry.key ? 'text-primary-foreground dark:text-white' : 'text-foreground'
                                }`}
                            >
                                {entry.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {hasUnread && (
                    <TouchableOpacity activeOpacity={0.7} disabled={isMarkingAll} onPress={handleMarkAllRead}>
                        <Text className="!text-[12px] font-semibold text-primary">Mark all read</Text>
                    </TouchableOpacity>
                )}
            </View>

            {isLoading && !entries.length ? (
                <View className="flex-1 px-4">
                    <FlatListSkeleton />
                </View>
            ) : (
                <FlashList
                    data={entries}
                    renderItem={renderItem}
                    keyExtractor={item => item.key}
                    onEndReached={hasNextPage ? fetchNextPage : undefined}
                    onEndReachedThreshold={0.3}
                    removeClippedSubviews
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 32 }}
                    refreshControl={
                        <RefreshControl refreshing={isFetching && !isFetchingNextPage} onRefresh={handleRefresh} />
                    }
                    ListFooterComponent={
                        isFetchingNextPage ? (
                            <View className="py-6">
                                <ActivityIndicator />
                            </View>
                        ) : null
                    }
                    ListEmptyComponent={
                        <EmptyState
                            style={{ paddingVertical: 64 }}
                            title="Nothing here yet"
                            description={
                                filter === 'ALL'
                                    ? 'Clock-in reminders, permission decisions, tickets and report updates all land here — even when your phone is silent.'
                                    : 'Nothing in this category yet. Tap All to see everything.'
                            }
                        />
                    }
                />
            )}
        </ViewWrapper>
    );
};

export default memo(Notifications);
