import { Icon } from '@rneui/themed';
import { HStack, VStack, Text } from 'native-base';
import React from 'react';
import { THEME_CONFIG } from '../../../config/appConfig';

const CLOCK_STATS = [
    {
        time: '6:45AM',
        label: 'Clock in',
        icon: 'check-circle',
        iconType: 'feather',
    },
    {
        time: '1:45PM',
        label: 'Clock out',
        icon: 'logout',
        iconType: 'antdesign',
    },
    {
        time: '7:00',
        label: 'Service hrs',
        icon: 'hour-glass',
        iconType: 'entypo',
    },
];

const Stat = ({ time, label, icon, iconType }: typeof CLOCK_STATS[0]) => {
    return (
        <VStack alignItems="center" space={0}>
            <Icon
                size={25}
                name={icon}
                type={iconType}
                color={THEME_CONFIG.primaryLight}
            />
            <Text fontWeight="bold" fontSize="md" color="gray.600">
                {time}
            </Text>
            <Text fontWeight="light" fontSize="xs" color="gray.400">
                {label}
            </Text>
        </VStack>
    );
};

const ClockStatistics = () => {
    return (
        <HStack space={10} width="full" justifyContent="space-evenly">
            <>
                {CLOCK_STATS.map((stat, idx) => (
                    <Stat
                        key={idx}
                        time={stat.time}
                        icon={stat.icon}
                        label={stat.label}
                        iconType={stat.iconType}
                    />
                ))}
            </>
        </HStack>
    );
};

export default ClockStatistics;
