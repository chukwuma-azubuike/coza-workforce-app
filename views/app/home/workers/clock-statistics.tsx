import { Icon } from '@rneui/themed';
import moment from 'moment';
import { HStack, VStack, Text } from 'native-base';
import React from 'react';
import { HomeContext } from '..';
import { THEME_CONFIG } from '@config/appConfig';
import Utils from '@utils/index';
import { IIconTypes } from '@utils/types';

interface IStatProps {
    time?: string;
    label: string;
    icon: string;
    difference?: number | string;
    iconType: IIconTypes;
}

const Stat = React.memo(({ time, label, icon, iconType, difference }: IStatProps) => {
    return (
        <VStack alignItems="center" space={0} minW="1/3">
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
                <Text fontSize="md" fontWeight="bold" _dark={{ color: 'gray.400' }} _light={{ color: 'gray.600' }}>
                    {difference ? difference : '--:--'}
                </Text>
            ) : (
                <Text fontSize="md" fontWeight="bold" _dark={{ color: 'gray.400' }} _light={{ color: 'gray.600' }}>
                    {time ? moment(time).format('LT') : '--:--'}
                </Text>
            )}
            <Text fontSize="xs" _dark={{ color: 'gray.400' }} _light={{ color: 'gray.600' }}>
                {label}
            </Text>
        </VStack>
    );
});

const ClockStatistics = () => {
    const {
        latestAttendance: { latestAttendanceData },
    } = React.useContext(HomeContext);

    return (
        <HStack justifyContent="center" justifyItems="center">
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
        </HStack>
    );
};

export default React.memo(ClockStatistics);
