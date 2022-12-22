import { Icon } from '@rneui/themed';
import moment from 'moment';
import { HStack, VStack, Text } from 'native-base';
import React from 'react';
import { HomeContext } from '.';
import { THEME_CONFIG } from '../../../config/appConfig';
import Utils from '../../../utils';
import { IIconTypes } from '../../../utils/types';

interface IStatProps {
    time?: string;
    label: string;
    icon: string;
    difference?: number | string;
    iconType: IIconTypes;
}

const Stat = ({ time, label, icon, iconType, difference }: IStatProps) => {
    return (
        <VStack alignItems="center" space={0}>
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
                <Text fontWeight="bold" fontSize="md" color="gray.600">
                    {difference && '--:--'}
                </Text>
            ) : (
                <Text fontWeight="bold" fontSize="md" color="gray.600">
                    {time ? moment(time).format('LT') : '--:--'}
                </Text>
            )}
            <Text fontWeight="light" fontSize="xs" color="gray.400">
                {label}
            </Text>
        </VStack>
    );
};

const ClockStatistics = () => {
    const {
        latestAttendance: { latestAttendanceData },
    } = React.useContext(HomeContext);

    return (
        <HStack space={20}>
            <Stat
                time={latestAttendanceData?.clockIn}
                icon="check-circle"
                iconType="feather"
                label="Clock in"
            />
            <Stat
                time={latestAttendanceData?.clockOut}
                label="Clock out"
                icon="logout"
                iconType="antdesign"
            />
            <Stat
                difference={`${
                    Utils.timeDifference(
                        latestAttendanceData?.clockOut as string,
                        latestAttendanceData?.clockIn as string
                    ).minutes
                }mins`}
                label="Time spent"
                icon="hour-glass"
                iconType="entypo"
            />
        </HStack>
    );
};

export default ClockStatistics;
