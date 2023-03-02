import React from 'react';
import { Box, Center, HStack, Text, VStack } from 'native-base';
import moment from 'moment';
import { Icon } from '@rneui/base';
import { THEME_CONFIG } from '../../../config/appConfig';
import { IFlatListColumn } from '../../../components/composite/flat-list';
import { IAttendance } from '../../../store/types';
import Utils from '../../../utils';
import { AvatarComponentWithoutBadge } from '../../../components/atoms/avatar';
import { Appearance } from 'react-native';

const colorScheme = Appearance.getColorScheme();

const isLightMode = colorScheme === 'light';

const myAttendanceColumns: IFlatListColumn[] = [
    {
        title: 'Date',
        dataIndex: 'date',
        render: (elm: IAttendance, key) => {
            return (
                <Box key={key} size="42px" borderWidth={0.2} borderColor={isLightMode ? 'gray.700' : 'gray.300'}>
                    <Center pt={0}>
                        <Text bold fontSize={16} color={isLightMode ? 'gray.700' : 'gray.300'}>
                            {moment(elm.createdAt).format('ll').substring(4, 6).split(',').join('')}
                        </Text>
                        <Text bold color={isLightMode ? 'gray.700' : 'gray.300'} fontSize={12}>
                            {moment(elm.createdAt).format('dddd').substring(0, 3).toUpperCase()}
                        </Text>
                    </Center>
                </Box>
            );
        },
    },
    {
        title: 'Clock In',
        dataIndex: 'clockIn',
        render: (elm: IAttendance, key) => (
            <HStack key={key} alignItems="center">
                <Icon color={THEME_CONFIG.primaryLight} name="arrow-down-right" type="feather" size={18} />
                <Text
                    _dark={{
                        color: elm.clockIn ? 'green.300' : 'red.300',
                    }}
                    color={elm.clockIn ? 'green.500' : 'red.500'}
                >
                    {elm.clockIn ? moment(elm.clockIn).format('LT') : '--:--'}
                </Text>
            </HStack>
        ),
    },
    {
        title: 'Clock Out',
        dataIndex: 'clockOut',
        render: (elm: IAttendance, key) => (
            <HStack key={key} alignItems="center">
                <Icon color={THEME_CONFIG.primaryLight} name="arrow-up-right" type="feather" size={18} />
                <Text
                    color="gray.500"
                    _dark={{
                        color: 'warmGray.200',
                    }}
                >
                    {elm.clockOut ? moment(elm.clockOut).format('LT') : '--:--'}
                </Text>
            </HStack>
        ),
    },
    {
        title: 'Service hrs',
        dataIndex: 'hours',
        render: (elm: IAttendance, key) => (
            <Text
                key={key}
                _dark={{
                    color: 'warmGray.50',
                }}
                color="gray.500"
            >
                {`${!elm.clockOut ? '--:--' : `${Utils.timeDifference(elm.clockIn, elm.clockOut).minutes}mins`}`}
            </Text>
        ),
    },
];

const teamAttendanceDataColumns: IFlatListColumn[] = [
    {
        title: 'Date',
        dataIndex: 'date',
        render: (elm: IAttendance, key) => (
            <Box key={key} size="42px" borderWidth={0.2} borderColor={isLightMode ? 'gray.700' : 'gray.300'}>
                <Center pt={0}>
                    <Text bold fontSize={16} color={isLightMode ? 'gray.800' : 'gray.100'}>
                        {moment(elm.createdAt).format('ll').substring(4, 6).split(',').join('')}
                    </Text>
                    <Text bold color={isLightMode ? 'gray.800' : 'gray.100'} fontSize={12}>
                        {moment(elm.createdAt).format('dddd').substring(0, 3).toUpperCase()}
                    </Text>
                </Center>
            </Box>
        ),
    },
    {
        title: 'Name',
        dataIndex: 'name',
        render: (elm: IAttendance, key) => (
            <HStack key={key} alignItems="center" flex={1} textAlign="left" w="full">
                {/* <AvatarComponentWithoutBadge badge mr={4} size="xs" imageUrl="https://i.ibb.co/P6k4dWF/Group-3.png" /> */}
                <VStack>
                    <Text color={isLightMode ? 'gray.800' : 'gray.100'} ml={2}>
                        {Utils.truncateString(elm.user.firstName, 15)}
                    </Text>
                    <Text color={isLightMode ? 'gray.800' : 'gray.100'} ml={2}>
                        {Utils.truncateString(elm.user.lastName, 15)}
                    </Text>
                </VStack>
            </HStack>
        ),
    },
    {
        title: 'Clock In',
        dataIndex: 'clockIn',
        render: (elm: IAttendance, key) => (
            <HStack key={key} alignItems="center" flex={1} textAlign="left" w="full">
                <Icon color={THEME_CONFIG.primaryLight} name="arrow-down-right" type="feather" size={18} />
                <Text
                    _dark={{
                        color: elm.clockIn ? 'green.300' : 'red.300',
                    }}
                    color={elm.clockIn ? 'green.500' : 'red.500'}
                >
                    {elm.clockIn ? moment(elm.clockIn).format('LT') : '--:--'}
                </Text>
            </HStack>
        ),
    },
    {
        title: 'Clock Out',
        dataIndex: 'clockOut',
        render: (elm: IAttendance, key) => (
            <HStack key={key} alignItems="center" flex={1} textAlign="left" w="full">
                <Icon color={THEME_CONFIG.primaryLight} name="arrow-up-right" type="feather" size={18} />
                <Text
                    color="gray.500"
                    _dark={{
                        color: 'warmGray.200',
                    }}
                >
                    {elm.clockOut ? moment(elm.clockOut).format('LT') : '--:--'}
                </Text>
            </HStack>
        ),
    },
];

const campusColumns: IFlatListColumn[] = [
    {
        title: 'Date',
        dataIndex: 'date',
        render: (elm: IAttendance, key) => (
            <Box key={key} size="48px" borderWidth={0.2} borderColor={isLightMode ? 'gray.300' : 'gray.700'}>
                <Center pt={0}>
                    <Text bold fontSize={16} color={isLightMode ? 'gray.700' : 'gray.300'}>
                        {moment(elm.createdAt).format('ll').substring(4, 6).split(',').join('')}
                    </Text>
                    <Text bold color={isLightMode ? 'gray.600' : 'gray.400'} fontSize={12}>
                        {moment(elm.createdAt).format('dddd').substring(0, 3).toUpperCase()}
                    </Text>
                </Center>
            </Box>
        ),
    },
    {
        title: 'Present',
        dataIndex: 'present',
        render: (elm: IAttendance, key) => (
            <HStack key={key} alignItems="center">
                <Icon color={THEME_CONFIG.primaryLight} name="arrow-down-right" type="feather" size={18} />
                <Text
                    _dark={{
                        color: elm.clockIn ? 'green.300' : 'red.300',
                    }}
                    color={elm.clockIn ? 'green.500' : 'red.500'}
                >
                    {elm.clockIn ? moment(elm.clockIn).format('LT') : '--:--'}
                </Text>
            </HStack>
        ),
    },
    {
        title: 'Late',
        dataIndex: 'late',
        render: (elm: IAttendance, key) => (
            <HStack key={key} alignItems="center">
                <Icon color={THEME_CONFIG.primaryLight} name="arrow-up-right" type="feather" size={18} />
                <Text
                    color="gray.500"
                    _dark={{
                        color: 'warmGray.200',
                    }}
                >
                    {elm.clockOut ? moment(elm.clockOut).format('LT') : '--:--'}
                </Text>
            </HStack>
        ),
    },
    {
        title: 'Absent',
        dataIndex: 'absent',
        render: (elm: IAttendance, key) => (
            <Text
                key={key}
                _dark={{
                    color: 'warmGray.50',
                }}
                color="gray.500"
            >
                {`${!elm.clockOut ? '--:--' : `${Utils.timeDifference(elm.clockIn, elm.clockOut).minutes}mins`}`}
            </Text>
        ),
    },
];

export { campusColumns, myAttendanceColumns, teamAttendanceDataColumns };
