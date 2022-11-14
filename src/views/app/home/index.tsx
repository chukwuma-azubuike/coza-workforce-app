import React from 'react';
import { Center, HStack, Text, VStack } from 'native-base';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ParamListBase } from '@react-navigation/native';
import ClockButton from './clock-button';
import ViewWrapper from '../../../components/layout/viewWrapper';
import Timer from './timer';
import CampusLocation from './campus-location';
import ClockStatistics from './clock-statistics';
import AvatarComponent from '../../../components/atoms/avatar';
import { Icon } from '@rneui/themed';
import { THEME_CONFIG } from '../../../config/appConfig';
import { GestureResponderEvent } from 'react-native';

const Home: React.FC<NativeStackScreenProps<ParamListBase>> = ({
    navigation,
}) => {
    // API implementation

    const handleNotificationPress = (e: GestureResponderEvent) => () => {
        e.preventDefault();
    };

    return (
        <ViewWrapper>
            <>
                <HStack
                    justifyContent="space-between"
                    alignItems="center"
                    mx={4}
                    pl={1}
                >
                    <AvatarComponent imageUrl="https://bit.ly/3AdGvvM" />

                    <Icon
                        onPress={handleNotificationPress}
                        color={THEME_CONFIG.lightGray}
                        name="notifications-outline"
                        iconStyle={{ fontSize: 21 }}
                        underlayColor="white"
                        borderRadius={10}
                        type="ionicon"
                        size={16}
                        raised
                    />
                </HStack>
                <Center p={4} _dark={{ bg: 'black' }}>
                    <VStack space={16} pb={24} pt={4} alignItems="center">
                        <Text fontSize="xl" color="gray.500" fontWeight="light">
                            COZA SUNDAY
                        </Text>
                        <Timer />
                        <VStack alignItems="center" space={8}>
                            <ClockButton />
                            <CampusLocation />
                        </VStack>
                        <ClockStatistics />
                    </VStack>
                </Center>
            </>
        </ViewWrapper>
    );
};

export default Home;
