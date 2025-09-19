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

        const [date, setDate] = React.useState<Date>(initialValue ? dayjs(initialValue).toDate() : new Date());
        const [open, setOpen] = React.useState<boolean>(isIOS);

        const onChange = (_: DateTimePickerEvent, selectedDate?: Date) => {
            selectedDate && setDate(selectedDate);
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
                        <Text className={`text-left w-full ${!initialValue && 'font-normal'}`}>
                            {!initialValue && !date
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
                        value={value ? new Date(value) : date}
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
