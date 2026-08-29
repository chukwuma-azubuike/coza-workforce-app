import React, { useMemo, useState } from 'react';
import { Alert, View } from 'react-native';
import { Icon } from '@rneui/themed';

import { Text } from '~/components/ui/text';
import { Card, CardContent } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Skeleton } from '~/components/ui/skeleton';
import { THEME_CONFIG } from '~/config/appConfig';
import { Guest, IRoastReminder, QUALIFYING_ACTION_KIND, REMINDER_COMPLETED_VIA, REMINDER_STATUS } from '~/store/types';
import {
    useCompleteReminderMutation,
    useDeleteReminderMutation,
    useGetRemindersQuery,
    useSnoozeReminderMutation,
} from '~/store/services/roast-engagement';
import { usePingAction } from '~/hooks/roast-engagement';
import ReminderRow from '~/views/roast-crm/reminders/ReminderRow';
import ReminderSheet from '~/views/roast-crm/reminders/ReminderSheet';
import SnoozeSheet from '~/views/roast-crm/reminders/SnoozeSheet';

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

interface GuestRemindersCardProps {
    guest: Guest;
    /**
     * From the notification payload (US-2.2). Scrolls into view highlighted, so a tap on
     * "Emeka · Call back re: baptism class" lands on *that* reminder rather than on a
     * profile the worker then has to search.
     */
    highlightReminderId?: string;
}

/** Completed reminders shown inline before the list stops being a summary. */
const COMPLETED_PREVIEW = 3;

/**
 * This guest's reminders, on their profile.
 *
 * Deliberately not a link to the reminders screen. Setting a reminder is something a
 * worker decides *while looking at a guest* — usually seconds after a call that did not
 * connect — and a card that makes them navigate away to do it is a card they will not use.
 */
const GuestRemindersCard: React.FC<GuestRemindersCardProps> = ({ guest, highlightReminderId }) => {
    const [sheetOpen, setSheetOpen] = useState(false);
    const [editing, setEditing] = useState<IRoastReminder | null>(null);
    const [snoozing, setSnoozing] = useState<IRoastReminder | null>(null);
    const [showAllCompleted, setShowAllCompleted] = useState(false);

    const { pingAction } = usePingAction();
    const [completeReminder] = useCompleteReminderMutation();
    const [snoozeReminder] = useSnoozeReminderMutation();
    const [deleteReminder] = useDeleteReminderMutation();

    // No `status` filter: the profile shows both, because "what did I already do about
    // this guest" is half the question a profile answers.
    const { data: page, isLoading } = useGetRemindersQuery({ guestId: guest._id }, { skip: !guest._id });
    const reminders = page?.data ?? [];

    const { upcoming, completed } = useMemo(() => {
        const rows = [...reminders];

        return {
            upcoming: rows
                .filter(reminder => reminder.status === REMINDER_STATUS.UPCOMING)
                .sort((a, b) => Date.parse(a.dueAt) - Date.parse(b.dueAt)),
            completed: rows
                .filter(reminder => reminder.status === REMINDER_STATUS.COMPLETED)
                .sort((a, b) => completedOrder(b) - completedOrder(a)),
        };
    }, [reminders]);

    const handleComplete = async (reminder: IRoastReminder) => {
        try {
            await completeReminder({ _id: reminder._id, completedVia: REMINDER_COMPLETED_VIA.APP }).unwrap();
            pingAction(QUALIFYING_ACTION_KIND.REMINDER_COMPLETED, reminder._id);
        } catch {
            // Rolled back by the optimistic patch.
        }
    };

    const handleDelete = (reminder: IRoastReminder) => {
        Alert.alert('Delete this reminder?', reminder.note, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => deleteReminder(reminder._id) },
        ]);
    };

    const visibleCompleted = showAllCompleted ? completed : completed.slice(0, COMPLETED_PREVIEW);

    return (
        <Card>
            <CardContent className="p-4 gap-3">
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2">
                        <Icon type="feather" name="bell" size={18} color={THEME_CONFIG.blue} />
                        <Text className="font-semibold">Reminders</Text>
                        {!!upcoming.length && (
                            <View className="px-2 py-0.5 rounded-full bg-primary/10">
                                <Text className="!text-xs text-blue-500">{upcoming.length}</Text>
                            </View>
                        )}
                    </View>
                    <Button
                        size="sm"
                        className="!h-10"
                        variant="outline"
                        onPress={() => setSheetOpen(true)}
                        icon={<Icon type="feather" name="plus" size={22} color={THEME_CONFIG.blue} />}
                    >
                        Set reminder
                    </Button>
                </View>

                {isLoading ? (
                    <View className="gap-2">
                        <Skeleton className="h-20 w-full rounded-2xl" />
                        <Skeleton className="h-20 w-full rounded-2xl" />
                    </View>
                ) : !reminders.length ? (
                    <Text className="!text-sm text-muted-foreground py-2">No reminders for {guest.firstName} yet.</Text>
                ) : (
                    <View>
                        {upcoming.map(reminder => (
                            <ReminderRow
                                hideGuestName
                                key={reminder._id}
                                reminder={reminder}
                                onEdit={setEditing}
                                onSnooze={setSnoozing}
                                onDelete={handleDelete}
                                onComplete={handleComplete}
                                isHighlighted={reminder._id === highlightReminderId}
                            />
                        ))}

                        {!!visibleCompleted.length && (
                            <>
                                <Text className="!text-xs text-muted-foreground mb-2 mt-1">Done</Text>
                                {visibleCompleted.map(reminder => (
                                    <ReminderRow hideGuestName key={reminder._id} reminder={reminder} />
                                ))}
                            </>
                        )}

                        {completed.length > COMPLETED_PREVIEW && (
                            <Button
                                size="sm"
                                variant="ghost"
                                className="!h-9 self-start"
                                onPress={() => setShowAllCompleted(current => !current)}
                            >
                                {showAllCompleted ? 'Show less' : `Show ${completed.length - COMPLETED_PREVIEW} more`}
                            </Button>
                        )}
                    </View>
                )}
            </CardContent>

            <ReminderSheet
                guest={guest}
                visible={sheetOpen || !!editing}
                reminder={editing ?? undefined}
                onClose={() => {
                    setSheetOpen(false);
                    setEditing(null);
                }}
            />

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
        </Card>
    );
};

export default GuestRemindersCard;
