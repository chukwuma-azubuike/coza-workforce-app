import React from 'react';
import { Center, Text, VStack } from 'native-base';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ParamListBase } from '@react-navigation/native';
import ClockButton from './clock-button';
import ViewWrapper from '../../../components/layout/viewWrapper';
import Timer from './timer';
import CampusLocation from './campus-location';
import ClockStatistics from './clock-statistics';

const Home: React.FC<NativeStackScreenProps<ParamListBase>> = ({
    navigation,
}) => {
    // API implementation

    return (
        <ViewWrapper>
            <Center p={4} _dark={{ bg: 'black' }}>
                <VStack space={16} py={24} alignItems="center">
                    <Text fontSize="xl" color="gray.500" fontWeight="light">
                        COZA SUNDAY
                    </Text>
                    <Timer />
                    <VStack alignItems="center" space={6}>
                        <ClockButton />
                        <CampusLocation />
                    </VStack>
                    <ClockStatistics />
                </VStack>
            </Center>
        </ViewWrapper>
    );
};

export default Home;
