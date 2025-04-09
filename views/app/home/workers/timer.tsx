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
        <View className="mb-10">
            <Text className="text-muted-foreground text-4xl">{time.format('LT')}</Text>
            <Text className="text-muted-foreground font-light">{time.format('dddd ll')}</Text>
        </View>
    );
};

export default memo(Timer);
