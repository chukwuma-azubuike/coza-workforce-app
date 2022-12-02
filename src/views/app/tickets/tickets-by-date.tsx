import { Text } from 'native-base';
import React from 'react';
import { Line } from '../../../components/atoms/line';

const TicketsByDate: React.FC = () => {
    return (
        <>
            <Text pl="3" fontWeight="semibold">
                13th November, 2022
            </Text>
            <Line
                color={'#888787'}
                width="full"
                height="1px"
                marginTop="5px"
                marginBottom="10px"
            />

            <Text pl="3">TicketsByDate: React.FC</Text>
        </>
    );
};

export default TicketsByDate;
