import React, { memo, useState } from 'react';
import { Text } from 'native-base';
import moment from 'moment';

const Timer: React.FC = () => {
    const [time, setTime] = useState<string>(moment().format('LTS'));

    const timer = () =>
        setInterval(() => {
            setTime(moment().format('LTS'));
        }, 1000);

    timer();

    return (
        <Text color="primary.100" fontSize="3xl">
            {time}
        </Text>
    );
};

export default memo(Timer);
