import React, { memo, useEffect, useState } from 'react';
import { View } from 'react-native';
import RNDatePicker, { DatePickerProps } from 'react-native-date-picker';

import { cn } from '~/lib/utils';
import dayjs from 'dayjs';
import { Label } from '~/components/ui/label';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import FormErrorMessage from '~/components/ui/error-message';

interface DateTimePickerProps extends Partial<DatePickerProps> {
    label?: string;
    placeholder?: string;
    error?: string;
    initialValue?: string;
    disabled?: boolean;
    touched?: boolean;
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({
    error,
    touched,
    onConfirm,
    mode = 'date',
    label = 'Select Date',
    initialValue,
    disabled,
    placeholder,
    ...props
}) => {
    const [date, setDate] = useState<Date>(initialValue ? dayjs(initialValue).toDate() : new Date());
    const [open, setOpen] = useState<boolean>(false);

    const showPicker = () => {
        setOpen(true);
    };

    useEffect(() => {
        if (initialValue) {
            setDate(dayjs(initialValue).toDate());
        }
    }, [initialValue]);

    return (
        <View className="gap-2 flex-1">
            <Label>{label}</Label>
            <Button
                disabled={disabled}
                variant="outline"
                onPress={showPicker}
                className={cn(
                    'rounded-2xl !h-16 !px-3',
                    `${touched && error && 'border border-destructive'}`,
                    props.className
                )}
            >
                <Text className={`text-left w-full ${!initialValue && 'font-normal'}`}>
                    {!initialValue && !date
                        ? placeholder
                        : dayjs(date).format(
                              mode === 'date'
                                  ? 'DD MMMM, YYYY'
                                  : mode === 'datetime'
                                    ? 'dddd, DD MMMM, hh:mm A'
                                    : 'hh:mm A'
                          )}
                </Text>
            </Button>
            {error && <FormErrorMessage>{error}</FormErrorMessage>}
            <RNDatePicker
                {...props}
                modal
                open={open}
                date={date}
                mode={mode}
                onConfirm={date => {
                    setOpen(false);
                    setDate(date);
                    onConfirm && onConfirm(date.toISOString() as unknown as Date);
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
