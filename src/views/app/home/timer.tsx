import React, { memo, useEffect, useState } from 'react';
import { Text } from 'native-base';
import moment, { Moment } from 'moment';

const Timer: React.FC = () => {
    const [time, setTime] = useState<Moment>(moment());

    const timer = () =>
        setInterval(() => {
            setTime(moment());
        }, 1000);

    useEffect(() => {
        timer();
    }, []);

    return (
        <>
            <Text _dark={{ color: 'gray.50' }} color="gray.600" fontSize="4xl">
                {time.format('LT')}
            </Text>
            <Text
                _dark={{ color: 'gray.50' }}
                fontWeight="light"
                color="gray.400"
                fontSize="md"
            >
                {time.format('dddd ll')}
            </Text>
        </>
    );
};

export default memo(Timer);
