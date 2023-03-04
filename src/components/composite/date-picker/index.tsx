import React from 'react';
import { FormControl, HStack, Text, VStack } from 'native-base';
import { Swipeable } from 'react-native-gesture-handler';
import moment from 'moment';
import { Icon } from '@rneui/themed';
import { THEME_CONFIG } from '../../../config/appConfig';
import { InputComponent } from '../../atoms/input';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';
import If from '../if-container';
import useAppColorMode from '../../../hooks/theme/colorMode';

const MonthPicker = () => {
    const handleSwipe = (direction: 'left' | 'right', swipeable: Swipeable) => {
        switch (direction) {
            case 'left':
                break;
            case 'right':
            default:
                break;
        }
    };

    const { isDarkMode } = useAppColorMode();

    return (
        <Swipeable
            onSwipeableOpen={handleSwipe}
            containerStyle={{
                padding: 20,
                alignContent: 'center',
                justifyContent: 'center',
                borderColor: THEME_CONFIG.veryLightGray,
            }}
        >
            <HStack justifyContent="space-around" alignItems="center">
                <Icon color={THEME_CONFIG.lightGray} name="chevron-small-left" type="entypo" size={26} />
                <HStack w="full" space={2} justifyContent="center" alignItems="center">
                    <Icon
                        size={20}
                        name="calendar"
                        type="antdesign"
                        color={isDarkMode ? THEME_CONFIG.primaryLight : THEME_CONFIG.primary}
                    />
                    <Text bold fontSize="md" _dark={{ color: 'primary.400' }} _light={{ color: 'primary.600' }}>
                        {moment().format('MMMM y')}
                    </Text>
                </HStack>
                <Icon color={THEME_CONFIG.lightGray} name="chevron-small-right" type="entypo" size={26} />
            </HStack>
        </Swipeable>
    );
};

interface IDateTimePickerProps {
    mode?: 'date' | 'time' | 'dateTime' | 'countdown' | 'dayMonth';
    label?: string;
    minimumDate?: Date;
    maximumDate?: Date;
    fieldName?: string;
    onSelectDate?: (fieldName: string, value: any) => void;
    dateFormat: 'dayofweek day month' | 'day month year' | 'longdate' | 'shortdate';
}

const DateTimePickerComponent: React.FC<IDateTimePickerProps> = ({
    mode,
    label,
    fieldName,
    minimumDate,
    maximumDate,
    onSelectDate,
    dateFormat = 'day month year',
}: IDateTimePickerProps) => {
    const isIOS = Platform.OS === 'ios';

    const [date, setDate] = React.useState<Date>(new Date());
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
        <VStack w={160} alignItems="flex-start">
            <FormControl.Label isRequired>{label}</FormControl.Label>
            <If condition={!isIOS}>
                <InputComponent
                    leftIcon={{
                        name: mode === 'time' ? 'clockcircleo' : 'calendar',
                        type: 'antdesign',
                    }}
                    onPressIn={handlePress}
                    showSoftInputOnFocus={false}
                    value={moment(date).format(mode === 'time' ? 'LTS' : mode === 'dayMonth' ? 'DD MMM' : 'DD MMM, yy')}
                    placeholder={moment().format(
                        mode === 'time' ? 'LTS' : mode === 'dayMonth' ? 'DD MMM' : 'DD MMM, yy'
                    )}
                />
            </If>
            {show && (
                <DateTimePicker
                    value={date}
                    mode={mode as any}
                    onChange={onChange}
                    accentColor={THEME_CONFIG.primary}
                    minimumDate={minimumDate}
                    maximumDate={maximumDate}
                    style={{ width: isIOS && 90, backgroundColor: 'red' }}
                    onTouchCancel={handleTouchCancel}
                    dateFormat={dateFormat}
                />
            )}
        </VStack>
    );
};

export { MonthPicker, DateTimePickerComponent };
