import { Text } from '~/components/ui/text';

import dayjs from 'dayjs';
import React from 'react';
import { HomeContext } from '..';
import { THEME_CONFIG } from '@config/appConfig';
import Utils from '@utils/index';
import { IIconTypes } from '@utils/types';
import { View } from 'react-native';
import { Icon } from '@rneui/themed';

interface IStatProps {
    time?: string;
    label: string;
    icon: string;
    iconType: IIconTypes;
    difference?: number | string;
}

const Stat = React.memo(({ time, label, icon, iconType, difference }: IStatProps) => {
    return (
        <View className="items-center min-w-[6rem]">
            <Icon
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
                <Text className="font-bold text-muted-foreground">{time ? dayjs(time).format('h:mm A') : '--:--'}</Text>
            )}
            <Text className="font-light text-muted-foreground text-sm">{label}</Text>
        </View>
    );
});

const ClockStatistics = () => {
    const {
        latestAttendance: { latestAttendanceData },
    } = React.useContext(HomeContext);

    return (
        <View className="justify-items-center flex-row w-full justify-around">
            <Stat
                time={latestAttendanceData?.length ? latestAttendanceData[0]?.clockIn : ''}
                icon="check-circle"
                iconType="feather"
                label="Clock in"
            />
            <Stat
                time={latestAttendanceData?.length ? latestAttendanceData[0]?.clockOut : ''}
                label="Clock out"
                icon="logout"
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
                icon="hour-glass"
                iconType="entypo"
            />
        </View>
    );
};

export default React.memo(ClockStatistics);
