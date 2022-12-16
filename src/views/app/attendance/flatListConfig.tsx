import React from 'react';
import { Box, Center, HStack, Text } from 'native-base';
import moment from 'moment';
import { Icon } from '@rneui/base';
import { THEME_CONFIG } from '../../../config/appConfig';
import { IFlatListColumn } from '../../../components/composite/flat-list';
import { IAttendance } from '../../../store/types';
import Utils from '../../../utils';

const data = [
    {
        id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
        clockIn: '07:47 PM',
        clockOut: '12:47 PM',
        date: '2022-11-16T00:18:29+01:00',
        hours: '07h 30m',
    },
    {
        id: '3ac68afc-c605-48d3-a4f8-fbd91aa97f63',
        clockIn: '6:45 AM',
        clockOut: '11:11 PM',
        date: '2022-11-13T00:18:29+01:00',
        hours: '07h 30m',
    },
    {
        id: '58694a0f-3da1-471f-bd96-145571e29d72',
        clockIn: '6:45 AM',
        clockOut: '6:22 PM',
        date: '2022-11-09T00:18:29+01:00',
        hours: '07h 30m',
    },
    {
        id: '68694a0f-3da1-431f-bd56-142371e29d72',
        clockIn: '6:45 AM',
        clockOut: '8:56 PM',
        date: '2022-11-06T00:18:29+01:00',
        hours: '07h 30m',
    },
    {
        id: '28694a0f-3da1-471f-bd96-142456e29d72',
        clockIn: null,
        clockOut: null,
        date: '2022-11-03T00:18:29+01:00',
        hours: '0h 0m',
    },
    {
        id: '58694a0f-3da1-471f-bd96-142456e29c78',
        clockIn: '4:45 PM',
        clockOut: '8:22 PM',
        date: '2022-11-07T00:18:29+01:00',
        hours: '04h 30m',
    },
];

const teamAttendanceData = [
    {
        id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
        clockIn: '07:47 PM',
        clockOut: '12:47 PM',
        name: 'Tunde Peterson',
        date: '2022-11-16T00:18:29+01:00',
        hours: '07h 30m',
    },
    {
        id: '3ac68afc-c605-48d3-a4f8-fbd91aa97f63',
        clockIn: '6:45 AM',
        clockOut: '11:11 PM',
        name: 'Chike Osita',
        date: '2022-11-13T00:18:29+01:00',
        hours: '07h 30m',
    },
    {
        id: '58694a0f-3da1-471f-bd96-145571e29d72',
        clockIn: '6:45 AM',
        clockOut: '6:22 PM',
        name: 'Adebola Kamoru',
        date: '2022-11-09T00:18:29+01:00',
        hours: '07h 30m',
    },
    {
        id: '68694a0f-3da1-431f-bd56-142371e29d72',
        clockIn: '6:45 AM',
        clockOut: '8:56 PM',
        name: 'Ajago Ayabo',
        date: '2022-11-06T00:18:29+01:00',
        hours: '07h 30m',
    },
    {
        id: '28694a0f-3da1-471f-bd96-142456e29d72',
        clockIn: null,
        clockOut: null,
        name: 'Laide Balogun',
        date: '2022-11-03T00:18:29+01:00',
        hours: '0h 0m',
    },
];

const myAttendanceColumns: IFlatListColumn[] = [
    {
        title: 'Date',
        dataIndex: 'date',
        render: (elm: IAttendance, key) => (
            <Box key={key} size="48px" borderWidth={0.2} borderColor="gray.300">
                <Center pt={0}>
                    <Text bold color="gray.600" fontSize={16}>
                        {moment(elm.createdAt)
                            .format('ll')
                            .substring(4, 6)
                            .split(',')
                            .join('')}
                    </Text>
                    <Text bold color="gray.600" fontSize={12}>
                        {moment(elm.createdAt)
                            .format('dddd')
                            .substring(0, 3)
                            .toUpperCase()}
                    </Text>
                </Center>
            </Box>
        ),
    },
    {
        title: 'Clock In',
        dataIndex: 'clockIn',
        render: (elm: IAttendance, key) => (
            <HStack key={key} alignItems="center">
                <Icon
                    color={THEME_CONFIG.primaryLight}
                    name="arrow-down-right"
                    type="feather"
                    size={18}
                />
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
                <Icon
                    color={THEME_CONFIG.primaryLight}
                    name="arrow-up-right"
                    type="feather"
                    size={18}
                />
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
                {`${
                    Utils.timeDifference(elm.clockIn, elm.clockOut).minutes
                }mins`}
            </Text>
        ),
    },
];

const teamAttendanceDataColumns: IFlatListColumn[] = [
    {
        title: 'Date',
        dataIndex: 'date',
        render: (elm: typeof teamAttendanceData[0], key) => (
            <Box key={key} size="48px" borderWidth={0.2} borderColor="gray.300">
                <Center pt={0}>
                    <Text bold color="gray.600" fontSize={16}>
                        {moment(elm.date)
                            .format('ll')
                            .substring(4, 6)
                            .split(',')
                            .join('')}
                    </Text>
                    <Text bold color="gray.600" fontSize={12}>
                        {moment(elm.date)
                            .format('dddd')
                            .substring(0, 3)
                            .toUpperCase()}
                    </Text>
                </Center>
            </Box>
        ),
    },
    {
        title: 'Name',
        dataIndex: 'name',
    },
    {
        title: 'Clock In',
        dataIndex: 'clockIn',
        render: (elm: typeof teamAttendanceData[0], key) => (
            <HStack
                key={key}
                alignItems="center"
                flex={1}
                textAlign="left"
                w="full"
            >
                <Icon
                    color={THEME_CONFIG.primaryLight}
                    name="arrow-down-right"
                    type="feather"
                    size={18}
                />
                <Text
                    _dark={{
                        color: elm.clockIn ? 'green.300' : 'red.300',
                    }}
                    color={elm.clockIn ? 'green.500' : 'red.500'}
                >
                    {elm.clockIn ? elm.clockIn : '--:--'}
                </Text>
            </HStack>
        ),
    },
    {
        title: 'Clock Out',
        dataIndex: 'clockOut',
        render: (elm: typeof teamAttendanceData[0], key) => (
            <HStack
                key={key}
                alignItems="center"
                flex={1}
                textAlign="left"
                w="full"
            >
                <Icon
                    color={THEME_CONFIG.primaryLight}
                    name="arrow-up-right"
                    type="feather"
                    size={18}
                />
                <Text
                    color="gray.500"
                    _dark={{
                        color: 'warmGray.200',
                    }}
                >
                    {elm.clockOut ? elm.clockOut : '--:--'}
                </Text>
            </HStack>
        ),
    },
];

export {
    myAttendanceColumns,
    data,
    teamAttendanceData,
    teamAttendanceDataColumns,
};
