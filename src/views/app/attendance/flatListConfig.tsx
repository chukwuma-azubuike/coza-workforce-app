import React from 'react';
import { Box, Center, HStack, Text } from 'native-base';
import moment from 'moment';
import { Icon } from '@rneui/base';
import { THEME_CONFIG } from '../../../config/appConfig';
import { IFlatListColumn } from '../../../components/composite/flat-list';

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
        clockIn: '6:45 AM',
        clockOut: '12:47 PM',
        date: '2022-11-03T00:18:29+01:00',
        hours: '07h 30m',
    },
];

const columns: IFlatListColumn[] = [
    {
        title: 'Date',
        dataIndex: 'date',
        render: (elm: typeof data[0], key) => (
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
        title: 'Clock In',
        dataIndex: 'clockIn',
        render: (elm: typeof data[0], key) => (
            <HStack key={key} alignItems="center">
                <Icon
                    color={THEME_CONFIG.gray}
                    name="arrow-down-right"
                    type="feather"
                    size={18}
                />
                <Text
                    _dark={{
                        color: 'green.300',
                    }}
                    color="green.500"
                >
                    {elm.clockIn}
                </Text>
            </HStack>
        ),
    },
    {
        title: 'Clock In',
        dataIndex: 'clockOut',
        render: (elm: typeof data[0], key) => (
            <HStack key={key} alignItems="center">
                <Icon
                    color={THEME_CONFIG.gray}
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
                    {elm.clockOut}
                </Text>
            </HStack>
        ),
    },
    {
        title: 'Service hrs',
        dataIndex: 'hours',
        render: (elm: typeof data[0], key) => (
            <Text
                key={key}
                _dark={{
                    color: 'warmGray.50',
                }}
                color="gray.500"
            >
                {elm.hours}
            </Text>
        ),
    },
];

export { columns, data };
