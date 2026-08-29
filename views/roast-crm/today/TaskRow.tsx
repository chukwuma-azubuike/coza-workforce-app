import React, { useCallback } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Icon } from '@rneui/themed';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import * as Haptics from 'expo-haptics';

import { Text } from '~/components/ui/text';
import { Card, CardContent } from '~/components/ui/card';
import { cn } from '~/lib/utils';
import { THEME_CONFIG } from '~/config/appConfig';
import { DISMISSIBLE_TASK_KINDS, ROAST_TASK_KIND, RoastTask } from '~/store/types';

dayjs.extend(relativeTime);

/**
 * One task, one primary action.
 *
 * The rule this row exists to enforce: **never menu-first**. A worker with four minutes
 * between services should be able to clear a row with one thumb without reading a menu,
 * so the action that actually resolves each kind of task is a button on the row and
 * everything else is behind `⋯`. A row with three equally-weighted buttons makes them
 * choose before they have read the line.
 */

interface IPrimaryAction {
    label: string;
    icon: string;
    iconType: string;
}

/**
 * The action that makes each kind of row go away.
 *
 * `CALL_DUE` and `FOLLOW_UP` both resolve with a call — they are the same act with
 * different reasons behind it, and giving them different buttons would be a distinction
 * that only makes sense to whoever wrote the detection query.
 */
export const primaryActionFor = (kind: ROAST_TASK_KIND): IPrimaryAction => {
    switch (kind) {
        case ROAST_TASK_KIND.REMINDER:
            return { label: 'Done', icon: 'check', iconType: 'feather' };
        case ROAST_TASK_KIND.CALL_DUE:
        case ROAST_TASK_KIND.FOLLOW_UP:
            return { label: 'Call', icon: 'phone', iconType: 'feather' };
        case ROAST_TASK_KIND.INVITE:
            return { label: 'Invite', icon: 'send', iconType: 'feather' };
        case ROAST_TASK_KIND.NOTE:
            return { label: 'Add note', icon: 'edit-3', iconType: 'feather' };
        case ROAST_TASK_KIND.PROGRESS:
            return { label: 'Update', icon: 'trending-up', iconType: 'feather' };
        default:
            return { label: 'Open', icon: 'arrow-right', iconType: 'feather' };
    }
};

interface TaskRowProps {
    task: RoastTask;
    /** Opens the guest profile. The card is the deep-link target; the buttons are shortcuts. */
    onPress: (task: RoastTask) => void;
    onPrimary: (task: RoastTask) => void;
    /** Only offered on `NOTE` and `PROGRESS` — everything else 400s. */
    onDismiss?: (task: RoastTask) => void;
}

const TaskRow: React.FC<TaskRowProps> = ({ task, onPress, onPrimary, onDismiss }) => {
    const action = primaryActionFor(task.kind);
    const dueAt = dayjs(task.dueAt);
    const isDismissible = DISMISSIBLE_TASK_KINDS.includes(task.kind);

    const handlePrimary = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPrimary(task);
    }, [onPrimary, task]);

    return (
        <Card className={cn('mb-3 overflow-hidden', task.isOverdue && 'border-destructive')}>
            <View className="flex-row">
                {/* Colour alone never carries "overdue" — the label below says it too. */}
                {task.isOverdue && <View className="w-1 bg-destructive" />}

                <CardContent className="flex-1 p-4 gap-2">
                    <TouchableOpacity
                        activeOpacity={0.6}
                        onPress={() => onPress(task)}
                        accessibilityRole="button"
                        accessibilityLabel={[
                            task.title,
                            task.isOverdue ? 'overdue' : dueAt.format('h:mm A'),
                            task.subtitle,
                        ]
                            .filter(Boolean)
                            .join(', ')}
                        className="gap-1"
                    >
                        <View className="flex-row items-start justify-between gap-3">
                            <Text className="flex-1 font-semibold" numberOfLines={2}>
                                {task.title}
                            </Text>
                            <Text
                                className={cn(
                                    '!text-xs',
                                    task.isOverdue ? 'text-destructive font-semibold' : 'text-muted-foreground'
                                )}
                            >
                                {dueAt.format('h:mm A')}
                            </Text>
                        </View>

                        {!!task.subtitle && (
                            <Text className="!text-sm text-muted-foreground" numberOfLines={2}>
                                {task.subtitle}
                            </Text>
                        )}

                        {task.isOverdue && (
                            <Text className="!text-xs text-destructive font-medium">Overdue · {dueAt.fromNow()}</Text>
                        )}
                    </TouchableOpacity>

                    <View className="flex-row items-center gap-2 pt-1">
                        <TouchableOpacity
                            activeOpacity={0.6}
                            onPress={handlePrimary}
                            accessibilityRole="button"
                            accessibilityLabel={`${action.label}: ${task.title}`}
                            // 44pt minimum. This is reached for one-handed, often while
                            // walking, and it is the only control on the row that matters.
                            className="h-11 px-4 rounded-full bg-primary flex-row items-center gap-2"
                        >
                            <Icon type={action.iconType} name={action.icon} size={15} color="#fff" />
                            <Text className="!text-sm text-primary-foreground dark:text-white font-medium">
                                {action.label}
                            </Text>
                        </TouchableOpacity>

                        {isDismissible && !!onDismiss && (
                            <TouchableOpacity
                                activeOpacity={0.6}
                                onPress={() => onDismiss(task)}
                                accessibilityRole="button"
                                accessibilityLabel={`Dismiss: ${task.title}`}
                                className="h-11 px-4 rounded-full border border-border flex-row items-center"
                            >
                                <Text className="!text-sm text-muted-foreground">Not now</Text>
                            </TouchableOpacity>
                        )}

                        <View className="flex-1" />

                        <TouchableOpacity
                            activeOpacity={0.6}
                            onPress={() => onPress(task)}
                            accessibilityRole="button"
                            accessibilityLabel={`Open guest for ${task.title}`}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            className="p-2"
                        >
                            <Icon type="feather" name="chevron-right" size={18} color={THEME_CONFIG.lightGray} />
                        </TouchableOpacity>
                    </View>
                </CardContent>
            </View>
        </Card>
    );
};

export default TaskRow;
