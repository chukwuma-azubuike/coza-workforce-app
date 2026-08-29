import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Icon } from '@rneui/themed';
import * as Haptics from 'expo-haptics';

import { Text } from '~/components/ui/text';
import { Card, CardContent } from '~/components/ui/card';
import { cn } from '~/lib/utils';
import { THEME_CONFIG } from '~/config/appConfig';
import { IRoastReminder, REMINDER_STATUS } from '~/store/types';

dayjs.extend(relativeTime);

interface ReminderRowProps {
    reminder: IRoastReminder;
    onPress?: (reminder: IRoastReminder) => void;
    onComplete?: (reminder: IRoastReminder) => void;
    onSnooze?: (reminder: IRoastReminder) => void;
    onEdit?: (reminder: IRoastReminder) => void;
    onDelete?: (reminder: IRoastReminder) => void;
    /** Highlights the row a notification pointed at (US-2.2's `reminderId` param). */
    isHighlighted?: boolean;
    /** The guest profile already knows whose reminder this is. */
    hideGuestName?: boolean;
    /**
     * Resolved by the caller from `useGuestNameIndex`.
     *
     * The reminders API returns a `guestId` and no name, so a row cannot look this up for
     * itself without every row firing its own lookup. `undefined` renders as a neutral
     * label rather than an empty line — a guest can legitimately have been reassigned
     * away since the reminder was set.
     */
    guestName?: string;
}

/**
 * One reminder.
 *
 * **One primary action per row.** The checkbox is it; everything else is a secondary
 * control sized and coloured to say so. A row with three equally-weighted buttons makes
 * the worker choose before they have read the note, and the whole point of this list is
 * that it can be worked through without thinking.
 */
const ReminderRow: React.FC<ReminderRowProps> = ({
    reminder,
    onPress,
    onComplete,
    onSnooze,
    onEdit,
    onDelete,
    isHighlighted,
    hideGuestName,
    guestName,
}) => {
    const isCompleted = reminder.status === REMINDER_STATUS.COMPLETED;
    const dueAt = dayjs(reminder.dueAt);
    const isOverdue = !isCompleted && dueAt.valueOf() < Date.now();

    const handleComplete = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onComplete?.(reminder);
    };

    return (
        <Card className={cn('mb-3', isHighlighted && 'border-primary border-2', isCompleted && 'opacity-60')}>
            <CardContent className="p-4 flex-row items-start gap-3">
                <TouchableOpacity
                    activeOpacity={0.6}
                    onPress={handleComplete}
                    disabled={isCompleted}
                    // Larger than it looks. The visible circle is 24pt; the touch target
                    // has to clear 44pt, and this is a control people reach for one-handed
                    // while walking.
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    className={cn(
                        'w-6 h-6 rounded-full border-2 items-center justify-center mt-0.5',
                        isCompleted ? 'bg-primary border-primary' : 'border-muted-foreground'
                    )}
                >
                    {isCompleted && <Icon type="feather" name="check" size={14} color="#fff" />}
                </TouchableOpacity>

                <TouchableOpacity
                    activeOpacity={0.6}
                    onPress={() => onPress?.(reminder)}
                    disabled={!onPress}
                    className="flex-1 gap-1"
                >
                    {!hideGuestName && (
                        <Text className={cn('font-semibold', isCompleted && 'line-through')}>
                            {guestName ?? 'This guest'}
                        </Text>
                    )}

                    <Text
                        className={cn('!text-sm text-muted-foreground', isCompleted && 'line-through')}
                        numberOfLines={2}
                    >
                        {reminder.note}
                    </Text>

                    <View className="flex-row items-center gap-2 mt-1">
                        <Icon
                            type="feather"
                            name="clock"
                            size={12}
                            color={isOverdue ? THEME_CONFIG.error : THEME_CONFIG.lightGray}
                        />
                        <Text className={cn('!text-xs', isOverdue ? 'text-destructive' : 'text-muted-foreground')}>
                            {isCompleted
                                ? `Done ${dayjs(reminder.completedAt).fromNow()}`
                                : `${dueAt.format('ddd D MMM, h:mm A')} · ${dueAt.fromNow()}`}
                        </Text>

                        {/* Surfaced from three onwards. Below that it is noise; at three it
                            is the first honest sign that this reminder is not working. */}
                        {!isCompleted && reminder.snoozeCount >= 3 && (
                            <Text className="!text-xs text-muted-foreground">· snoozed {reminder.snoozeCount}×</Text>
                        )}
                    </View>
                </TouchableOpacity>

                {!isCompleted && (
                    <View className="flex-row items-center gap-1">
                        {!!onSnooze && (
                            <TouchableOpacity
                                activeOpacity={0.6}
                                onPress={() => onSnooze(reminder)}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                className="p-2"
                            >
                                <Icon
                                    type="material-community"
                                    name="alarm-snooze"
                                    size={18}
                                    color={THEME_CONFIG.lightGray}
                                />
                            </TouchableOpacity>
                        )}
                        {!!onEdit && (
                            <TouchableOpacity
                                activeOpacity={0.6}
                                onPress={() => onEdit(reminder)}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                className="p-2"
                            >
                                <Icon type="feather" name="edit-2" size={16} color={THEME_CONFIG.lightGray} />
                            </TouchableOpacity>
                        )}
                        {!!onDelete && (
                            <TouchableOpacity
                                activeOpacity={0.6}
                                onPress={() => onDelete(reminder)}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                className="p-2"
                            >
                                <Icon type="feather" name="trash-2" size={16} color={THEME_CONFIG.error} />
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </CardContent>
        </Card>
    );
};

export default ReminderRow;
