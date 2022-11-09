import React from 'react';
import { Center, VStack } from 'native-base';
import { ToggleDarkMode } from '../../../components/utils/ToggleDarkMode';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ParamListBase } from '@react-navigation/native';
import ClockButton from './clock-button';
import ViewWrapper from '../../../components/layout/viewWrapper';
import Timer from './timer';

const Home: React.FC<NativeStackScreenProps<ParamListBase>> = ({
    navigation,
}) => {
    return (
        <ViewWrapper>
            <Center px={4} flex={1} _dark={{ bg: 'black' }}>
                <VStack space={24} alignItems="center">
                    <Timer />
                    <ClockButton />
                    <ToggleDarkMode />
                </VStack>
            </Center>
        </ViewWrapper>
    );
};

export default Home;
