import React from 'react';
import { FormControl, HStack, Text, VStack } from 'native-base';
import { Swipeable } from 'react-native-gesture-handler';
import moment from 'moment';
import { Icon } from '@rneui/themed';
import { THEME_CONFIG } from '../../../config/appConfig';
import { InputComponent } from '../../atoms/input';
import DateTimePicker, {
    DateTimePickerEvent,
} from '@react-native-community/datetimepicker';

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

    return (
        <Swipeable
            onSwipeableOpen={handleSwipe}
            containerStyle={{
                padding: 20,
                borderTopWidth: 0.2,
                borderBottomWidth: 0.2,
                alignContent: 'center',
                justifyContent: 'center',
                borderColor: THEME_CONFIG.veryLightGray,
            }}
        >
            <HStack justifyContent="space-around" alignItems="center">
                <Icon
                    color={THEME_CONFIG.lightGray}
                    name="chevron-small-left"
                    type="entypo"
                    size={26}
                />
                <HStack
                    w="full"
                    space={2}
                    justifyContent="center"
                    alignItems="center"
                >
                    <Icon
                        size={20}
                        name="calendar"
                        type="antdesign"
                        color={THEME_CONFIG.primary}
                    />
                    <Text bold fontSize="md" color="primary.600">
                        {moment().format('MMMM y')}
                    </Text>
                </HStack>
                <Icon
                    color={THEME_CONFIG.lightGray}
                    name="chevron-small-right"
                    type="entypo"
                    size={26}
                />
            </HStack>
        </Swipeable>
    );
};

interface IDateTimePickerProps {
    label?: string;
    minimumDate?: Date;
    maximumDate?: Date;
    fieldName?: string;
    onSelectDate?: (fieldName: string, value: any) => void;
}

const DateTimePickerComponent: React.ForwardRefExoticComponent<
    IDateTimePickerProps & React.RefAttributes<any>
> = React.forwardRef(
    (
        {
            label,
            minimumDate,
            fieldName,
            maximumDate,
            onSelectDate,
        }: IDateTimePickerProps,
        ref
    ) => {
        const [date, setDate] = React.useState<Date>(new Date());
        const [show, setShow] = React.useState<boolean>(false);

        const onChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
            selectedDate && setDate(selectedDate);
            setShow(false);
            onSelectDate && fieldName && onSelectDate(fieldName, selectedDate);
        };

        const handlePress = () => setShow(true);
        const handleTouchCancel = () => setShow(false);

        return (
            <VStack w={160}>
                <FormControl.Label>{label}</FormControl.Label>
                <InputComponent
                    isRequired
                    leftIcon={{
                        name: 'calendar',
                        type: 'antdesign',
                    }}
                    onPressIn={handlePress}
                    showSoftInputOnFocus={false}
                    ref={ref as React.MutableRefObject<any>}
                    value={moment(date).format('DD MMM, yy')}
                    placeholder={moment().format('DD MMM, yy')}
                />
                {show && (
                    <DateTimePicker
                        value={date}
                        onChange={onChange}
                        minimumDate={minimumDate}
                        maximumDate={maximumDate}
                        onTouchCancel={handleTouchCancel}
                    />
                )}
            </VStack>
        );
    }
);

export { MonthPicker, DateTimePickerComponent };
