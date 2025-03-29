import React from 'react';
import { FormControl, VStack } from 'native-base';
import moment from 'moment';
import { Icon } from '@rneui/themed';
import { THEME_CONFIG } from '@config/appConfig';
import { InputComponent } from '../../atoms/input';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';
import If from '../if-container';
import { InterfaceFormControlProps } from 'native-base/lib/typescript/components/composites/FormControl/types';
interface IDateTimePickerProps {
    mode?: 'date' | 'time' | 'dateTime' | 'countdown' | 'dayMonth';
    label?: string;
    minimumDate?: Date;
    maximumDate?: Date;
    fieldName?: string;
    isInvalid?: boolean;
    value?: string | Date;
    errorMessage?: string;
    formControlProps?: InterfaceFormControlProps;
    onSelectDate?: (fieldName: string, value: any) => void;
    dateFormat?: 'dayofweek day month' | 'day month year' | 'longdate' | 'shortdate';
}

const DateTimePickerComponent: React.FC<IDateTimePickerProps> = React.memo(
    ({
        mode,
        label,
        value,
        isInvalid,
        fieldName,
        minimumDate,
        maximumDate,
        onSelectDate,
        errorMessage,
        formControlProps,
        dateFormat = 'day month year',
    }: IDateTimePickerProps) => {
        const isIOS = Platform.OS === 'ios';

        const [date, setDate] = React.useState<Date>(value ? new Date(value) : new Date());
        const [show, setShow] = React.useState<boolean>(isIOS);

        const onChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
            selectedDate && setDate(selectedDate);
            if (!isIOS) {
                setShow(false);
            }
            onSelectDate && fieldName && onSelectDate(fieldName, selectedDate);
        };

        const handlePress = () => setShow(true);
        const handleTouchCancel = () => {
            if (!isIOS) {
                setShow(false);
            }
        };

        return (
            <FormControl isInvalid={formControlProps?.isInvalid} {...formControlProps} minW={150} w="auto">
                <VStack w="auto" alignItems="flex-start" minW={150}>
                    <FormControl.Label>{label}</FormControl.Label>
                    <If condition={!isIOS}>
                        <InputComponent
                            leftIcon={{
                                name: mode === 'time' ? 'clockcircleo' : 'calendar',
                                type: 'antdesign',
                            }}
                            onPressIn={handlePress}
                            showSoftInputOnFocus={false}
                            value={moment(date).format(
                                mode === 'time' ? 'LTS' : mode === 'dayMonth' ? 'DD MMM' : 'DD MMM, yy'
                            )}
                            placeholder={moment().format(
                                mode === 'time' ? 'LTS' : mode === 'dayMonth' ? 'DD MMM' : 'DD MMM, yy'
                            )}
                        />
                    </If>
                    {show && (
                        <DateTimePicker
                            value={value ? new Date(value) : date}
                            mode={mode as any}
                            onChange={onChange}
                            accentColor={THEME_CONFIG.primary}
                            minimumDate={minimumDate}
                            maximumDate={maximumDate}
                            style={{ width: isIOS ? 140 : 'initial' }}
                            onTouchCancel={handleTouchCancel}
                            dateFormat={dateFormat}
                        />
                    )}
                    <If condition={!!errorMessage}>
                        <FormControl.ErrorMessage
                            mt={3}
                            fontSize="2xl"
                            leftIcon={<Icon size={16} name="warning" type="antdesign" color={THEME_CONFIG.error} />}
                        >
                            {errorMessage}
                        </FormControl.ErrorMessage>
                    </If>
                </VStack>
            </FormControl>
        );
    }
);

export { DateTimePickerComponent };
