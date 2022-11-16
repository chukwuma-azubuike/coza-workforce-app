import React from 'react';
import { HStack, Text } from 'native-base';
import { Swipeable } from 'react-native-gesture-handler';
import moment from 'moment';
import { Icon } from '@rneui/themed';
import { THEME_CONFIG } from '../../../config/appConfig';

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
                    justifyContent="center"
                    alignItems="center"
                    space={2}
                >
                    <Icon
                        size={20}
                        name="calendar"
                        type="antdesign"
                        color={THEME_CONFIG.primary}
                    />
                    <Text bold fontSize="md" color="primary.900">
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

export { MonthPicker };
