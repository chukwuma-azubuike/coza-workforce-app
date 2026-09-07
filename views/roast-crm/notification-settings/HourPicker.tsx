import React from 'react';
import { Modal, ScrollView, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import dayjs from 'dayjs';

import { Text } from '~/components/ui/text';
import { cn } from '~/lib/utils';

interface HourPickerProps {
    visible: boolean;
    title: string;
    /** 0–23. The wire format is an hour, not a time. */
    value: number;
    onSelect: (hour: number) => void;
    onClose: () => void;
}

const HOURS = Array.from({ length: 24 }, (_, hour) => hour);

/**
 * Picks a whole hour.
 *
 * A time picker would be the obvious choice and is the wrong one: `quietHoursStart` and
 * `quietHoursEnd` are **integers 0–23** on the wire, so a spinner that lets somebody
 * choose 22:30 and then silently stores 22:00 is a control that lies about what it did.
 * Twenty-four rows is not elegant, but every value it offers is a value the server keeps.
 */
const HourPicker: React.FC<HourPickerProps> = ({ visible, title, value, onSelect, onClose }) => (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <TouchableWithoutFeedback onPress={onClose}>
            <View className="flex-1 bg-black/50 justify-center px-8">
                <TouchableWithoutFeedback>
                    <View className="bg-background rounded-2xl overflow-hidden max-h-[70%]">
                        <Text className="font-semibold p-4">{title}</Text>

                        <ScrollView>
                            {HOURS.map(hour => (
                                <TouchableOpacity
                                    key={hour}
                                    activeOpacity={0.6}
                                    onPress={() => {
                                        onSelect(hour);
                                        onClose();
                                    }}
                                    accessibilityRole="button"
                                    className={cn('px-4 py-3', hour === value && 'bg-muted')}
                                >
                                    <Text className={cn('!text-base', hour === value && 'font-semibold')}>
                                        {dayjs().hour(hour).minute(0).format('h:mm A')}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </TouchableWithoutFeedback>
            </View>
        </TouchableWithoutFeedback>
    </Modal>
);

export default HourPicker;
