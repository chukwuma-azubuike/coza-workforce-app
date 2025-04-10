import React, { memo, useEffect, useState } from 'react';

import dayjs, { Dayjs } from 'dayjs';
import { View } from 'react-native';
import { Text } from '~/components/ui/text';

const Timer: React.FC = () => {
    const [time, setTime] = useState<Dayjs>(dayjs());

    const timer = () =>
        setInterval(() => {
            setTime(dayjs());
        }, 1000);

    useEffect(() => {
        timer();
    }, []);

    return (
        <View className="w-full items-center">
            <Text className="text-4xl">{time.format('hh:mm A')}</Text>
            <Text className="text-muted-foreground font-light">{time.format('dddd MMM D, YYYY')}</Text>
        </View>
    );
};

export default memo(Timer);
