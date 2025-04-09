import dayjs from 'dayjs';

import React from 'react';
import { HomeContext } from '..';
import { THEME_CONFIG } from '@config/appConfig';
import Utils from '@utils/index';
import { IIconTypes } from '@utils/types';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { IoniconTypes } from '~/types/app';
import { Text } from '~/components/ui/text';

interface IStatProps {
    time?: string;
    label: string;
    icon: IoniconTypes;
    difference?: number | string;
    iconType: IIconTypes;
}

const Stat = React.memo(({ time, label, icon, iconType, difference }: IStatProps) => {
    return (
        <View className="items-center">
            <Ionicons
                size={25}
                name={icon}
                type={iconType}
                color={
                    label === 'Clock out'
                        ? THEME_CONFIG.rose
                        : label === 'Service hrs'
                        ? THEME_CONFIG.gray
                        : THEME_CONFIG.primaryLight
                }
            />
            {difference ? (
                <Text className="font-bold text-muted-foreground">{difference ? difference : '--:--'}</Text>
            ) : (
                <Text className="font-bold text-muted-foreground">{time ? dayjs(time).format('LT') : '--:--'}</Text>
            )}
            <Text className="font-bold text-muted-foreground text-base">{label}</Text>
        </View>
    );
});

const ClockStatistics = () => {
    const {
        latestAttendance: { latestAttendanceData },
    } = React.useContext(HomeContext);

    return (
        <View className="justify-center justify-items-center">
            <Stat
                time={latestAttendanceData?.length ? latestAttendanceData[0]?.clockIn : ''}
                icon="checkmark-circle"
                iconType="feather"
                label="Clock in"
            />
            <Stat
                time={latestAttendanceData?.length ? latestAttendanceData[0]?.clockOut : ''}
                label="Clock out"
                icon="log-out"
                iconType="antdesign"
            />
            <Stat
                difference={
                    Utils.timeDifference(
                        latestAttendanceData?.length ? latestAttendanceData[0]?.clockOut : ('' as string),
                        latestAttendanceData?.length ? latestAttendanceData[0]?.clockIn : ('' as string)
                    ).hrsMins
                }
                label="Time spent"
                icon="hourglass"
                iconType="entypo"
            />
        </View>
    );
};

export default React.memo(ClockStatistics);
