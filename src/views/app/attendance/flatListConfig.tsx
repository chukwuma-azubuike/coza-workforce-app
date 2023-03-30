import React from 'react';
import { Box, Center, HStack, Text, VStack } from 'native-base';
import moment from 'moment';
import { Icon } from '@rneui/base';
import { THEME_CONFIG } from '../../../config/appConfig';
import { IFlatListColumn } from '../../../components/composite/flat-list';
import { IAttendance } from '../../../store/types';
import Utils from '../../../utils';
import { Appearance } from 'react-native';
import AvatarComponent from '../../../components/atoms/avatar';
import { AVATAR_FALLBACK_URL } from '../../../constants';

const colorScheme = Appearance.getColorScheme();

const isLightMode = colorScheme === 'light';

const myAttendanceColumns: IFlatListColumn[] = [
    {
        title: 'Date',
        dataIndex: 'date',
        render: (elm: IAttendance, key) => {
            return (
                <Box
                    key={`date-${key}`}
                    size="42px"
                    borderWidth={0.2}
                    pb={1}
                    borderColor={isLightMode ? 'gray.700' : 'gray.500'}
                >
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
            <HStack key={`clockin-${key}`} alignItems="center" minWidth={88}>
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
            <HStack key={`clockout-${key}`} alignItems="center" minWidth={88}>
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
                key={`hours-${key}`}
                _dark={{
                    color: 'warmGray.50',
                }}
                color="gray.500"
                textAlign="center"
            >
                {elm?.clockOut ? Utils.timeDifference(elm.clockOut || '', elm.clockIn || '').hrsMins : '--:--'}
            </Text>
        ),
    },
];

export interface ITransformUserAttendanceList {
    firstName: string;
    lastName: string;
    clockIn: string;
    clockOut: string;
    createdAt: string;
    userId: string;
}

const teamAttendanceDataColumns: IFlatListColumn[] = [
    // {
    //     title: 'Date',
    //     dataIndex: 'date',
    //     render: (elm: IAttendance, key) => (
    //         <Box key={`date-${key}`} size="42px" borderWidth={0.2} borderColor={isLightMode ? 'gray.700' : 'gray.500'}>
    //             <Center pt={0}>
    //                 <Text bold fontSize={16} color={isLightMode ? 'gray.800' : 'gray.100'}>
    //                     {moment(elm.createdAt).format('ll').substring(4, 6).split(',').join('')}
    //                 </Text>
    //                 <Text bold color={isLightMode ? 'gray.800' : 'gray.100'} fontSize={12}>
    //                     {moment(elm.createdAt).format('dddd').substring(0, 3).toUpperCase()}
    //                 </Text>
    //             </Center>
    //         </Box>
    //     ),
    // },
    {
        title: 'Name',
        dataIndex: 'name',
        render: (elm: ITransformUserAttendanceList, key) => (
            <HStack key={`name-${key}`} alignItems="center" flex={1} textAlign="left" w="full" minWidth={45}>
                <AvatarComponent
                    mr={4}
                    size="xs"
                    badge={!!elm.clockIn}
                    imageUrl="https://i.ibb.co/P6k4dWF/Group-3.png"
                />
                <VStack justifyContent="center">
                    <Text color={isLightMode ? 'gray.800' : 'gray.100'} ml={2}>
                        {Utils.capitalizeFirstChar(elm.firstName)}
                    </Text>
                    <Text color={isLightMode ? 'gray.800' : 'gray.100'} ml={2}>
                        {Utils.capitalizeFirstChar(elm.lastName)}
                    </Text>
                </VStack>
            </HStack>
        ),
    },
    {
        title: '                     Clock In',
        dataIndex: 'clockIn',
        render: (elm: ITransformUserAttendanceList, key) => (
            <HStack key={`clockin-${key}`} minWidth={0} justifyContent="center" flex={1} textAlign="left" w="full">
                <Icon color={THEME_CONFIG.primaryLight} name="arrow-down-right" type="feather" size={18} />
                <Text
                    _dark={{
                        color: elm.clockIn ? 'green.300' : 'red.300',
                    }}
                    color={elm.clockIn ? 'green.500' : 'red.500'}
                    textAlign="center"
                >
                    {elm.clockIn ? moment(elm.clockIn).format('LT') : '--:--'}
                </Text>
            </HStack>
        ),
    },
    {
        title: 'Clock Out',
        dataIndex: 'clockOut',
        render: (elm: ITransformUserAttendanceList, key) => (
            <HStack key={`clockout-${key}`} justifyContent="center" flex={1} textAlign="left" w="full">
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
            <Box key={`date-${key}`} size="48px" borderWidth={0.2} borderColor={isLightMode ? 'gray.300' : 'gray.500'}>
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
        title: 'Name',
        dataIndex: 'name',
        render: (elm: ITransformUserAttendanceList, key) => (
            <HStack key={`name-${key}`} alignItems="center" flex={1} textAlign="left" w="full" minWidth={45}>
                <AvatarComponent
                    mr={4}
                    size="xs"
                    badge={!!elm.clockIn}
                    imageUrl="https://i.ibb.co/P6k4dWF/Group-3.png"
                />
                <VStack justifyContent="center">
                    <Text color={isLightMode ? 'gray.800' : 'gray.100'} ml={2}>
                        {Utils.capitalizeFirstChar(elm.firstName)}
                    </Text>
                    <Text color={isLightMode ? 'gray.800' : 'gray.100'} ml={2}>
                        {Utils.capitalizeFirstChar(elm.lastName)}
                    </Text>
                </VStack>
            </HStack>
        ),
    },
    {
        title: 'Present',
        dataIndex: 'present',
        render: (elm: IAttendance, key) => (
            <HStack key={`present-${key}`} alignItems="center">
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
            <HStack key={`late-${key}`} alignItems="center">
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
                key={`absent-${key}`}
                _dark={{
                    color: 'warmGray.50',
                }}
                color="gray.500"
                textAlign="center"
            >
                {`${!elm.clockOut ? '--:--' : `${Utils.timeDifference(elm.clockIn, elm.clockOut).minutes}mins`}`}
            </Text>
        ),
    },
];

const campusColumns_1: IFlatListColumn[] = [
    // {
    //     title: 'User',
    //     dataIndex: 'user',
    //     render: (elm: IAttendance, key) => (
    //         <HStack key={`user-${key}`} alignItems="center" textAlign="left" minWidth={100} space={0} flex={1} w="full">
    //             <AvatarComponent badge mr={1} size="xs" imageUrl={elm.user?.pictureUrl || AVATAR_FALLBACK_URL} />
    //             <VStack>
    //                 <HStack flexWrap="wrap" maxWidth={160}>
    //                     <Text bold color={isLightMode ? 'gray.800' : 'gray.200'} ml={2}>
    //                         {Utils.truncateString(elm.user?.firstName, 23)}
    //                     </Text>
    //                     <Text bold color={isLightMode ? 'gray.800' : 'gray.200'} ml={2}>
    //                         {Utils.truncateString(elm?.user?.lastName)}
    //                     </Text>
    //                 </HStack>
    //                 <Text color={isLightMode ? 'gray.800' : 'gray.200'} ml={2}>
    //                     {Utils.truncateString(elm?.departmentName, 21)}
    //                 </Text>
    //             </VStack>
    //         </HStack>
    //     ),
    // },
    {
        title: 'User',
        dataIndex: 'user',
        render: (elm: IAttendance, key) => (
            <HStack key={`name-${key}`} alignItems="center" flex={1} textAlign="left" w="full" minWidth={45}>
                <AvatarComponent
                    badge={!!elm.clockIn}
                    mr={1}
                    size="xs"
                    imageUrl={elm.user?.pictureUrl || AVATAR_FALLBACK_URL}
                />
                <VStack justifyContent="center">
                    <Text color={isLightMode ? 'gray.800' : 'gray.100'} ml={2}>
                        {Utils.truncateString(
                            `${Utils.capitalizeFirstChar(elm.user?.firstName)} ${Utils.capitalizeFirstChar(
                                elm.user?.lastName
                            )}`,
                            20
                        )}
                    </Text>
                    <Text bold color={isLightMode ? 'gray.800' : 'gray.100'} ml={2}>
                        {Utils.truncateString(elm?.departmentName, 20)}
                    </Text>
                </VStack>
            </HStack>
        ),
    },
    {
        title: '                                      Clock In',
        dataIndex: 'clockin',
        render: (elm: IAttendance, key) => (
            <HStack key={`clockin-${key}`} justifyContent="center" minWidth={0}>
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
        dataIndex: 'clockout',
        render: (elm: IAttendance, key) => (
            <HStack key={`clockout-${key}`} alignItems="center" minWidth={78} justifyContent="center">
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

export { campusColumns, campusColumns_1, myAttendanceColumns, teamAttendanceDataColumns };
