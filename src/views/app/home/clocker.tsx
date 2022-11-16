import React from 'react';
import { Center, Text, VStack } from 'native-base';
import ClockButton from './clock-button';
import Timer from './timer';
import CampusLocation from './campus-location';
import ClockStatistics from './clock-statistics';

const Clocker: React.FC = () => {
    // API implementation

    return (
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
    );
};

export default Clocker;
