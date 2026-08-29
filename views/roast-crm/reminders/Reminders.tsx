import React, { useCallback, useMemo, useState } from 'react';
import { Alert, RefreshControl, TouchableOpacity, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { Text } from '~/components/ui/text';
import { Skeleton } from '~/components/ui/skeleton';
import { cn } from '~/lib/utils';
import ROAST_COPY from '~/constants/roast-copy';
import { IRoastReminder, QUALIFYING_ACTION_KIND, REMINDER_COMPLETED_VIA, REMINDER_STATUS } from '~/store/types';
import {
    useCompleteReminderMutation,
    useDeleteReminderMutation,
    useGetRemindersQuery,
    useSnoozeReminderMutation,
} from '~/store/services/roast-engagement';
import { usePingAction } from '~/hooks/roast-engagement';
import ReminderRow from './ReminderRow';
import useGuestNameIndex from '../hooks/use-guest-name-index';
import ReminderSheet from './ReminderSheet';
import SnoozeSheet from './SnoozeSheet';

/**
 * When a reminder was finished, for ordering the Completed tab.
 *
 * `updatedAt` is optional on the wire — the server only sets it on a mutation — so a row
 * completed by a path that did not touch it would sort as `NaN` and land wherever the
 * comparator happened to leave it. `createdAt` is always present and is the right last
 * resort.
 */
const completedOrder = (reminder: IRoastReminder): number =>
    Date.parse(reminder.completedAt ?? reminder.updatedAt ?? reminder.createdAt);

type Tab = REMINDER_STATUS.UPCOMING | REMINDER_STATUS.COMPLETED;

/**
 * My Reminders (US-2.6).
 *
 * Two lists, one screen. Upcoming is the working list and is sorted **soonest first** —
 * the opposite of the completed list, which is most-recent first, because the questions
 * are different: "what is next" versus "what did I just do".
 */
const Reminders: React.FC = () => {
    const [tab, setTab] = useState<Tab>(REMINDER_STATUS.UPCOMING);
    const [editing, setEditing] = useState<IRoastReminder | null>(null);
    const [snoozing, setSnoozing] = useState<IRoastReminder | null>(null);

    const { pingAction } = usePingAction();
    const [completeReminder] = useCompleteReminderMutation();
    const [snoozeReminder] = useSnoozeReminderMutation();
    const [deleteReminder] = useDeleteReminderMutation();

    const { data: page, isLoading, isFetching, refetch } = useGetRemindersQuery({ status: tab, limit: 200 });
    const reminders = page?.data ?? [];

    // Reminders arrive with a `guestId` and no name — see `useGuestNameIndex`. Resolved
    // here rather than per row so one pass over the guest cache serves the whole list.
    const guestNames = useGuestNameIndex();

    const sorted = useMemo(() => {
        const rows = [...reminders];

        return tab === REMINDER_STATUS.UPCOMING
            ? rows.sort((a, b) => Date.parse(a.dueAt) - Date.parse(b.dueAt))
            : rows.sort((a, b) => completedOrder(b) - completedOrder(a));
    }, [reminders, tab]);

    const handleComplete = useCallback(
        async (reminder: IRoastReminder) => {
            try {
                await completeReminder({
                    _id: reminder._id,
                    completedVia: REMINDER_COMPLETED_VIA.APP,
                }).unwrap();

                // Completing a reminder is a qualifying action — it is the clearest signal
                // in the app that real work happened today.
                pingAction(QUALIFYING_ACTION_KIND.REMINDER_COMPLETED, reminder._id);
            } catch {
                // The optimistic patch has already rolled itself back; the row simply
                // reappears where it was.
            }
        },
        [completeReminder, pingAction]
    );

    const handleDelete = useCallback(
        (reminder: IRoastReminder) => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

            Alert.alert('Delete this reminder?', reminder.note, [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        deleteReminder(reminder._id);
                    },
                },
            ]);
        },
        [deleteReminder]
    );

    const openGuest = useCallback((reminder: IRoastReminder) => {
        router.push({
            pathname: '/roast-crm/guests/profile' as any,
            params: { _id: reminder.guestId, reminderId: reminder._id },
        });
    }, []);

    const renderItem = useCallback(
        ({ item }: { item: IRoastReminder }) => (
            <ReminderRow
                reminder={item}
                guestName={guestNames[item.guestId]?.fullName}
                onPress={openGuest}
                onComplete={handleComplete}
                onSnooze={setSnoozing}
                onEdit={setEditing}
                onDelete={handleDelete}
            />
        ),
        [handleComplete, handleDelete, openGuest, guestNames]
    );

    return (
        <View className="flex-1 bg-background">
            <View className="flex-row px-4 pt-4 pb-2 gap-2">
                {(
                    [
                        [REMINDER_STATUS.UPCOMING, 'Upcoming'],
                        [REMINDER_STATUS.COMPLETED, 'Completed'],
                    ] as Array<[Tab, string]>
                ).map(([value, label]) => (
                    <TouchableOpacity
                        key={value}
                        activeOpacity={0.6}
                        onPress={() => {
                            Haptics.selectionAsync();
                            setTab(value);
                        }}
                        className={cn(
                            'h-10 px-5 rounded-full justify-center border',
                            tab === value ? 'bg-primary border-primary' : 'border-border'
                        )}
                    >
                        <Text className={cn('!text-sm', tab === value && 'text-primary-foreground dark:text-white')}>
                            {label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {isLoading ? (
                <View className="px-4 pt-2 gap-3">
                    {[...Array(4)].map((_, index) => (
                        <Skeleton key={index} className="h-24 w-full rounded-2xl" />
                    ))}
                </View>
            ) : (
                <FlashList
                    data={sorted}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32 }}
                    refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
                    ListEmptyComponent={
                        <View className="items-center pt-24 px-8 gap-2">
                            <Text className="!text-base font-semibold">
                                {tab === REMINDER_STATUS.UPCOMING
                                    ? ROAST_COPY.reminders.emptyUpcoming
                                    : ROAST_COPY.reminders.emptyCompleted}
                            </Text>
                            {tab === REMINDER_STATUS.UPCOMING && (
                                <Text className="!text-sm text-muted-foreground text-center">
                                    {ROAST_COPY.reminders.emptyUpcomingBody}
                                </Text>
                            )}
                        </View>
                    }
                />
            )}

            {!!editing && (
                <ReminderSheet
                    visible
                    reminder={editing}
                    guest={{
                        _id: editing.guestId,
                        firstName: guestNames[editing.guestId]?.firstName || 'this guest',
                        lastName: guestNames[editing.guestId]?.lastName ?? '',
                    }}
                    onClose={() => setEditing(null)}
                />
            )}

            <SnoozeSheet
                visible={!!snoozing}
                reminder={snoozing ?? undefined}
                onClose={() => setSnoozing(null)}
                onSnooze={dueAt => {
                    if (snoozing) {
                        snoozeReminder({ _id: snoozing._id, dueAt });
                    }
                }}
            />
        </View>
    );
};

export default Reminders;
