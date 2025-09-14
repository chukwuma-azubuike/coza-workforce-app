import { Text } from '~/components/ui/text';

import React, { memo, useEffect, useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { View } from 'react-native';

const Timer: React.FC = () => {
    const [time, setTime] = useState<Dayjs>(dayjs());

    useEffect(() => {
        const subscribe = setInterval(() => {
            setTime(dayjs());
        }, 1000 * 60);

        return () => {
            clearInterval(subscribe);
        };
    }, []);

    const formattedTime = time.format('hh:mm A');
    const formattedDate = time.format('dddd MMM D, YYYY');

    return (
        <View className="w-full items-center">
            <Text className="text-4xl">{formattedTime}</Text>
            <Text className="text-muted-foreground font-light">{formattedDate}</Text>
        </View>
    );
};

export default memo(Timer);
