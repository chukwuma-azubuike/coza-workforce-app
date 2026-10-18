import React, { memo, useCallback, useEffect, useState } from 'react';
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
    // `date` always holds something for the native picker to open on, but it is only a real value
    // once picked (or passed in) — until then the button shows the placeholder, not the current time.
    const [hasSelected, setHasSelected] = useState<boolean>(!!initialValue);

    const showPicker = () => {
        setOpen(true);
    };

    const handleConfirmDate = useCallback(
        (date: Date) => {
            setOpen(false);
            setDate(date);
            setHasSelected(true);

            if (onConfirm) {
                onConfirm(date.toISOString() as unknown as Date);
            }
        },
        [onConfirm]
    );

    useEffect(() => {
        if (initialValue) {
            setDate(dayjs(initialValue).toDate());
            setHasSelected(true);
        } else if (initialValue === '') {
            // A controlled field that was cleared, e.g. by a form reset.
            setHasSelected(false);
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
                <Text className={cn('text-left w-full', !hasSelected && 'font-normal text-muted-foreground')}>
                    {!hasSelected
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
                onConfirm={handleConfirmDate}
                onCancel={() => {
                    setOpen(false);
                }}
            />
        </View>
    );
};

export default memo(DateTimePicker);

DateTimePicker.displayName = 'DateTimePicker';
