import React from 'react';
import { THEME_CONFIG } from '@config/appConfig';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Platform, StyleProp, View, ViewStyle } from 'react-native';
import FormErrorMessage from '~/components/ui/error-message';
import { Label } from '~/components/ui/label';
import { Button } from '~/components/ui/button';
import { cn } from '~/lib/utils';
import dayjs from 'dayjs';
import { Text } from '~/components/ui/text';

interface IDateTimePickerLegendProps {
    mode?: 'date' | 'time' | 'dateTime' | 'countdown' | 'dayMonth';
    label?: string;
    minimumDate?: Date;
    maximumDate?: Date;
    isInvalid?: boolean;
    value?: string | Date;
    error?: string;
    initialValue?: string;
    placeholder?: string;
    touched?: boolean;
    className?: string;
    style?: StyleProp<ViewStyle>;
    onConfirm?: (value: Date) => void;
    dateFormat?: 'dayofweek day month' | 'day month year' | 'longdate' | 'shortdate';
}

const DateTimePickerLegend: React.FC<IDateTimePickerLegendProps> = React.memo(
    ({
        mode,
        label,
        value,
        minimumDate,
        maximumDate,
        onConfirm,
        error,
        touched,
        placeholder,
        initialValue,
        style,
        dateFormat = 'day month year',
        ...props
    }: IDateTimePickerLegendProps) => {
        const isIOS = Platform.OS === 'ios';

        // Clamp any date into [minimumDate, maximumDate]. The native Android
        // picker throws an out-of-range exception if `value` falls outside the
        // bounds — which happened on the DOB field, whose default of "today"
        // exceeded a maximumDate of "18 years ago".
        const clampDate = React.useCallback(
            (input: Date): Date => {
                let result = input;
                if (minimumDate && result < minimumDate) result = minimumDate;
                if (maximumDate && result > maximumDate) result = maximumDate;
                return result;
            },
            [minimumDate, maximumDate]
        );

        const [date, setDate] = React.useState<Date>(
            clampDate(initialValue ? dayjs(initialValue).toDate() : maximumDate ?? new Date())
        );
        const [open, setOpen] = React.useState<boolean>(isIOS);
        // `date` is seeded to a clamped default so the native picker never opens
        // out of range — but we only treat it as a real selection once the user
        // (or an initialValue) actually picks one, so the button still shows the
        // placeholder until then.
        const [hasSelected, setHasSelected] = React.useState<boolean>(!!initialValue);

        const onChange = (_: DateTimePickerEvent, selectedDate?: Date) => {
            if (selectedDate) {
                setDate(selectedDate);
                setHasSelected(true);
            }
            if (!isIOS) {
                setOpen(false);
            }

            if (selectedDate && onConfirm) {
                onConfirm(selectedDate.toISOString() as unknown as Date);
            }
        };

        const handlePress = () => setOpen(true);
        const handleTouchCancel = () => {
            if (!isIOS) {
                setOpen(false);
            }
        };

        const openPicker = () => {
            setOpen(true);
        };

        React.useEffect(() => {
            if (initialValue && onConfirm) {
                onConfirm(initialValue as unknown as Date);
            }
        }, [initialValue]);

        return (
            <View className="gap-2">
                <Label>{label}</Label>
                {!isIOS && (
                    <Button
                        variant="outline"
                        onPress={openPicker}
                        className={cn(
                            'rounded-2xl !h-16 !px-3',
                            `${touched && error && 'border border-destructive'}`,
                            props.className
                        )}
                    >
                        <Text
                            className={cn(
                                'text-left w-full',
                                !hasSelected && 'font-normal text-muted-foreground'
                            )}
                        >
                            {!hasSelected
                                ? placeholder
                                : dayjs(date).format(
                                      mode === 'date'
                                          ? 'DD MMMM, YYYY'
                                          : mode === 'dateTime'
                                          ? 'dddd, DD MMMM, hh:mm A'
                                          : 'hh:mm A'
                                  )}
                        </Text>
                    </Button>
                )}
                {open && (
                    <DateTimePicker
                        value={clampDate(value ? new Date(value) : date)}
                        mode={mode as any}
                        onChange={onChange}
                        accentColor={THEME_CONFIG.primary}
                        minimumDate={minimumDate}
                        maximumDate={maximumDate}
                        style={[{ marginLeft: -10 }, style]}
                        onTouchCancel={handleTouchCancel}
                        dateFormat={dateFormat}
                    />
                )}
                {error && <FormErrorMessage>{error}</FormErrorMessage>}
            </View>
        );
    }
);

export default DateTimePickerLegend;
