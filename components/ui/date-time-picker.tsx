import React, { memo, useEffect, useState } from 'react';
import { View } from 'react-native';
import RNDatePicker, { DatePickerProps } from 'react-native-date-picker';
import { Text } from './text';
import { Button } from './button';
import { Label } from './label';
import { cn } from '~/lib/utils';
import dayjs from 'dayjs';

interface DateTimePickerProps extends Partial<DatePickerProps> {
    label?: string;
    placeholder?: string;
    error?: string;
    initialValue?: string;
    touched?: boolean;
    onConfirmValue?: (date: string) => void;
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({
    error,
    touched,
    onConfirm,
    onConfirmValue,
    mode = 'date',
    label = 'Select Date',
    initialValue,
    placeholder,
    ...props
}) => {
    const [date, setDate] = useState<Date>(initialValue ? dayjs(initialValue).toDate() : new Date());
    const [open, setOpen] = useState<boolean>(false);

    const showPicker = () => {
        setOpen(true);
    };

    return (
        <View className="gap-4">
            <Label>{label}</Label>
            <Button
                variant="outline"
                onPress={showPicker}
                className={cn(
                    'rounded-2xl !h-16',
                    `${touched && error && 'border border-destructive'}`,
                    props.className
                )}
            >
                <Text className={`text-left w-full ${!initialValue && '!text-base font-normal'}`}>
                    {!initialValue
                        ? placeholder
                        : dayjs(date).format(
                              mode === 'date'
                                  ? 'DD MMMM, YYYY'
                                  : mode === 'datetime'
                                  ? 'dddd, DD MMMM, HH:MM A'
                                  : 'HH:MM A'
                          )}
                </Text>
            </Button>
            {error && touched && <Text className="text-destructive">{error}</Text>}
            <RNDatePicker
                {...props}
                modal
                open={open}
                date={date}
                mode={mode}
                onConfirm={date => {
                    setOpen(false);
                    setDate(date);
                    onConfirm && onConfirm(date.toISOString() as any);
                    onConfirmValue && onConfirmValue(date.toISOString());
                }}
                onCancel={() => {
                    setOpen(false);
                }}
            />
        </View>
    );
};

export default memo(DateTimePicker);

DateTimePicker.displayName = 'DateTimePicker';
