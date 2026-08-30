import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Modal, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import dayjs from 'dayjs';
import * as Haptics from 'expo-haptics';
import RNDatePicker from 'react-native-date-picker';

import { Text } from '~/components/ui/text';
import { Separator } from '~/components/ui/separator';
import { Button } from '~/components/ui/button';
import { IRoastReminder } from '~/store/types';

interface SnoozeSheetProps {
    visible: boolean;
    reminder?: IRoastReminder;
    onClose: () => void;
    onSnooze: (dueAt: string) => void;
}

/**
 * Snooze a reminder (US-2.4).
 *
 * Separate from `ReminderSheet` because it answers a different question. Editing asks
 * "when should this actually be?"; snoozing asks "not now — how much later?", and the
 * answer is almost always one of three. A worker deferring a reminder is, by definition,
 * busy, so this costs one tap.
 *
 * The snooze count is deliberately visible once it climbs. A reminder deferred five times
 * is a signal — either the task is not real or the worker is stuck — and the row that
 * hides it is the row that lets it run to eleven.
 */
const SnoozeSheet: React.FC<SnoozeSheetProps> = ({ visible, reminder, onClose, onSnooze }) => {
    const slideAnim = useRef(new Animated.Value(300)).current;
    const [pickerOpen, setPickerOpen] = useState(false);

    useEffect(() => {
        Animated.spring(slideAnim, {
            toValue: visible ? 0 : 300,
            useNativeDriver: true,
            bounciness: 4,
        }).start();
    }, [visible, slideAnim]);

    // Recomputed per open, so "this evening" is never a time that has already gone.
    const options = useMemo(() => {
        if (!visible) {
            return [];
        }

        const evening = dayjs().hour(18).minute(0).second(0).millisecond(0);

        return [
            { key: '1h', label: 'In an hour', at: dayjs().add(1, 'hour').second(0).millisecond(0).toDate() },
            ...(evening.valueOf() > Date.now()
                ? [{ key: 'evening', label: 'This evening', at: evening.toDate() }]
                : []),
            {
                key: 'tomorrow',
                label: 'Tomorrow 9am',
                at: dayjs().add(1, 'day').hour(9).minute(0).second(0).millisecond(0).toDate(),
            },
        ];
    }, [visible]);

    const choose = (date: Date) => {
        Haptics.selectionAsync();
        onSnooze(date.toISOString());
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={onClose}>
                <View className="flex-1 justify-end bg-black/40">
                    <TouchableWithoutFeedback>
                        <Animated.View
                            style={{ transform: [{ translateY: slideAnim }] }}
                            className="bg-background rounded-t-3xl"
                        >
                            <View className="items-center pt-3 pb-1">
                                <View className="w-10 h-1 rounded-full bg-muted" />
                            </View>

                            <View className="px-5 pt-3 pb-2">
                                <Text className="!text-base font-bold text-foreground">Snooze until</Text>
                                {!!reminder && reminder.snoozeCount >= 3 && (
                                    <Text className="!text-xs text-muted-foreground mt-1">
                                        Snoozed {reminder.snoozeCount} times already — worth rescheduling properly?
                                    </Text>
                                )}
                            </View>

                            <Separator />

                            <View className="px-5 py-2">
                                {options.map(option => (
                                    <TouchableOpacity
                                        key={option.key}
                                        activeOpacity={0.6}
                                        onPress={() => choose(option.at)}
                                        className="py-4 flex-row items-center justify-between"
                                    >
                                        <Text className="!text-base">{option.label}</Text>
                                        <Text className="!text-sm text-muted-foreground">
                                            {dayjs(option.at).format('ddd h:mm A')}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <View className="px-5 pt-2 pb-8">
                                <Button variant="outline" size="sm" onPress={() => setPickerOpen(true)}>
                                    Pick a time
                                </Button>
                            </View>

                            <RNDatePicker
                                modal
                                mode="datetime"
                                open={pickerOpen}
                                date={new Date()}
                                minimumDate={new Date()}
                                onConfirm={date => {
                                    setPickerOpen(false);
                                    choose(date);
                                }}
                                onCancel={() => setPickerOpen(false)}
                            />
                        </Animated.View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

export default SnoozeSheet;
