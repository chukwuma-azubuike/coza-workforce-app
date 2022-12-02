import React from 'react';
import ViewWrapper from '../../../components/layout/viewWrapper';
import Empty from '../../../components/atoms/empty';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ParamListBase } from '@react-navigation/native';
import { VStack } from 'native-base';
import TicketsByDate from './tickets-by-date';

const Tickets: React.FC<NativeStackScreenProps<ParamListBase>> = ({
    // navigation,
} = () => {
    // const handlePress = () => {
    //     navigation.navigate('Request permission');
    // };
    return (
        <ViewWrapper>
            {/* <Empty message="Nothing here. Let's keep it that way! 😇" /> */}
            <VStack px={2} space={4}>
                <TicketsByDate />
            </VStack>
        </ViewWrapper>
    );
});

export default Tickets;
