import React from 'react';
import { Box, Center, HStack, Text, VStack } from 'native-base';
import moment from 'moment';
import { Icon } from '@rneui/base';
import { THEME_CONFIG } from '@config/appConfig';
import { IFlatListColumn } from '@components/composite/flat-list';
import { IAttendance, IScoreMapping, IUser } from '@store/types';
import Utils from '@utils/index';
import { Appearance } from 'react-native';
import AvatarComponent from '@components/atoms/avatar';
import { AVATAR_FALLBACK_URL } from '@constants/index';
import HStackComponent from '@components/layout/h-stack';

const colorScheme = Appearance.getColorScheme();

const isLightMode = colorScheme === 'light';

const myAttendanceColumns: IFlatListColumn[] = [
    {
        title: '',
        dataIndex: 'date',
        render: (elm: IAttendance, key) => {
            return (
                <HStack alignItems="center" px={2} w="full" key={key} flex={1}>
                    <Box
                        pb={1}
                        flex={1}
                        size="52px"
                        borderWidth={0.2}
                        key={`date-${key}`}
                        borderColor={isLightMode ? 'gray.700' : 'gray.500'}
                    >
                        <Center pt={0}>
                            <Text bold fontSize={14} color={isLightMode ? 'gray.700' : 'gray.300'}>
                                {moment(elm.createdAt).format('ll').substring(4, 6).split(',').join('')}
                            </Text>
                            <Text bold color={isLightMode ? 'gray.700' : 'gray.300'} fontSize={10}>
                                {moment(elm.createdAt).format('dddd').substring(0, 3).toUpperCase()}
                            </Text>
                            <Text bold color={isLightMode ? 'gray.700' : 'gray.300'} fontSize={10}>
                                {moment(elm.createdAt).format('MMMM').substring(0, 3)} /{' '}
                                {moment(elm.createdAt).format('YY')}
                            </Text>
                        </Center>
                    </Box>
                    <HStack
                        justifyContent="center"
                        flex={1}
                        key={`clockin-${key}`}
                        alignItems="center"
                        minWidth={{ base: '15%', md: '10%' }}
                    >
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
                    <HStack
                        justifyContent="center"
                        flex={1}
                        key={`clockout-${key}`}
                        alignItems="center"
                        minWidth={{ base: '15%', md: '10%' }}
                    >
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
                    <Text
                        flex={1}
                        justifyContent="center"
                        key={`hours-${key}`}
                        _dark={{
                            color: 'warmGray.50',
                        }}
                        minWidth={{ base: '15%', md: '10%' }}
                        color="gray.500"
                        textAlign="center"
                    >
                        {elm?.clockOut ? Utils.timeDifference(elm.clockOut || '', elm.clockIn || '').hrsMins : '--:--'}
                    </Text>
                </HStack>
            );
        },
    },
];

export interface ITransformUserAttendanceList {
    score: number;
    userId: string;
    clockIn: string;
    lastName: string;
    clockOut: string;
    createdAt: string;
    firstName: string;
    pictureUrl: string;
    departmentName: string;
}

const teamAttendanceDataColumns: IFlatListColumn[] = [
    {
        title: '',
        dataIndex: 'name',
        render: (elm: ITransformUserAttendanceList, key) => (
            <HStackComponent style={{ alignItems: 'center', paddingHorizontal: 4 }} key={key}>
                <AvatarComponent
                    mr={4}
                    size="md"
                    badge={!!elm.clockIn}
                    imageUrl={elm.pictureUrl || AVATAR_FALLBACK_URL}
                />
                <VStack minWidth={{ base: '36%', md: '40%' }} ml={2} flex={1}>
                    <Text
                        bold
                        fontSize="md"
                        noOfLines={1}
                        ellipsizeMode="tail"
                        _dark={{ color: 'gray.200' }}
                        _light={{ color: 'gray.800' }}
                    >
                        {`${Utils.capitalizeFirstChar(elm?.firstName)} ${Utils.capitalizeFirstChar(elm?.lastName)}`}
                    </Text>
                    <Text
                        noOfLines={1}
                        flexWrap="wrap"
                        ellipsizeMode="tail"
                        color={isLightMode ? 'gray.800' : 'gray.100'}
                    >
                        {Utils.truncateString(elm.departmentName)}
                    </Text>
                </VStack>
                <HStack
                    justifyContent="center"
                    flex={1}
                    key={`clockin-${key}`}
                    alignItems="center"
                    minWidth={{ base: '15%', md: '15%' }}
                >
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
                <HStack
                    justifyContent="center"
                    flex={1}
                    key={`clockout-${key}`}
                    alignItems="center"
                    minWidth={{ base: '15%', md: '15%' }}
                >
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
            </HStackComponent>
        ),
    },
];

const teamAttendanceDataColumns_1: IFlatListColumn[] = [
    {
        title: '',
        dataIndex: 'name',
        render: (elm: ITransformUserAttendanceList, key) => (
            <HStackComponent style={{ alignItems: 'center', paddingHorizontal: 4 }} key={key}>
                <AvatarComponent
                    mr={4}
                    size="md"
                    badge={!!elm.clockIn}
                    imageUrl={elm.pictureUrl || AVATAR_FALLBACK_URL}
                />
                <VStack minWidth={{ base: '36%', md: '40%' }} ml={2} flex={1}>
                    <Text
                        bold
                        fontSize="md"
                        noOfLines={1}
                        ellipsizeMode="tail"
                        _dark={{ color: 'gray.200' }}
                        _light={{ color: 'gray.800' }}
                    >
                        {`${Utils.capitalizeFirstChar(elm?.firstName)} ${Utils.capitalizeFirstChar(elm?.lastName)}`}
                    </Text>
                    <Text
                        noOfLines={1}
                        flexWrap="wrap"
                        ellipsizeMode="tail"
                        color={isLightMode ? 'gray.800' : 'gray.100'}
                    >
                        {Utils.truncateString(elm.departmentName)}
                    </Text>
                </VStack>
                <HStack
                    justifyContent="center"
                    flex={1}
                    key={`clockin-${key}`}
                    alignItems="center"
                    minWidth={{ base: '15%', md: '15%' }}
                >
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
                <HStack
                    justifyContent="center"
                    flex={1}
                    key={`clockout-${key}`}
                    alignItems="center"
                    minWidth={{ base: '15%', md: '15%' }}
                >
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
            </HStackComponent>
        ),
    },
];

const scoreMappingColumn: IFlatListColumn[] = [
    {
        title: '',
        dataIndex: 'name',
        render: (elm: IScoreMapping & IAttendance, key) => (
            <HStack alignItems="center" key={`name-${key}`}>
                <HStack
                    key={`name-${key}`}
                    alignItems="center"
                    flex={1}
                    textAlign="left"
                    minWidth={{ base: '20%', md: '15%' }}
                >
                    <AvatarComponent
                        mr={4}
                        size="sm"
                        badge={!!elm.clockIn}
                        imageUrl={elm?.user?.pictureUrl || elm?.pictureUrl || AVATAR_FALLBACK_URL}
                    />
                    <VStack justifyContent="center">
                        <Text flexWrap="wrap" color={isLightMode ? 'gray.800' : 'gray.100'}>
                            {Utils.capitalizeFirstChar(elm?.user?.firstName || elm?.firstName)}
                        </Text>
                        <Text flexWrap="wrap" color={isLightMode ? 'gray.800' : 'gray.100'}>
                            {Utils.capitalizeFirstChar(elm?.user?.lastName || elm?.lastName)}
                        </Text>
                    </VStack>
                </HStack>
                <HStack
                    key={`clockin-${key}`}
                    minWidth={0}
                    justifyContent="center"
                    flex={1}
                    textAlign="left"
                    minWidth={{ base: '20%', md: '15%' }}
                >
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
                <HStack
                    key={`clockout-${key}`}
                    justifyContent="center"
                    flex={1}
                    textAlign="left"
                    minWidth={{ base: '20%', md: '15%' }}
                >
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
                <HStack key={`score-${key}`} justifyContent="center" flex={1} textAlign="left">
                    <Text
                        color="gray.500"
                        _dark={{
                            color: 'warmGray.200',
                        }}
                    >
                        {!!elm.score ? `${elm.score}` : `${0}`}
                    </Text>
                </HStack>
            </HStack>
        ),
    },
];

const leadersAttendanceDataColumns: IFlatListColumn[] = [
    {
        title: '',
        dataIndex: 'name',
        render: (elm: ITransformUserAttendanceList, key) => (
            <HStackComponent style={{ alignItems: 'center', paddingHorizontal: 4 }} key={key}>
                <AvatarComponent
                    mr={4}
                    size="md"
                    badge={!!elm.clockIn}
                    imageUrl={elm.pictureUrl || AVATAR_FALLBACK_URL}
                />
                <VStack minWidth={{ base: '36%', md: '40%' }} ml={2} flex={1}>
                    <Text
                        bold
                        fontSize="md"
                        noOfLines={1}
                        ellipsizeMode="tail"
                        _dark={{ color: 'gray.200' }}
                        _light={{ color: 'gray.800' }}
                    >
                        {`${Utils.capitalizeFirstChar(elm?.firstName)} ${Utils.capitalizeFirstChar(elm?.lastName)}`}
                    </Text>
                    <Text
                        noOfLines={1}
                        flexWrap="wrap"
                        ellipsizeMode="tail"
                        color={isLightMode ? 'gray.800' : 'gray.100'}
                    >
                        {Utils.truncateString(elm.departmentName)}
                    </Text>
                </VStack>
                <HStack
                    justifyContent="center"
                    flex={1}
                    key={`clockin-${key}`}
                    alignItems="center"
                    minWidth={{ base: '15%', md: '15%' }}
                >
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
                <HStack
                    justifyContent="center"
                    flex={1}
                    key={`clockout-${key}`}
                    alignItems="center"
                    minWidth={{ base: '15%', md: '15%' }}
                >
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
            </HStackComponent>
        ),
    },
];

const campusColumns: IFlatListColumn[] = [
    {
        title: '',
        dataIndex: '',
        render: (elm: IAttendance, key) => (
            <HStackComponent style={{ alignItems: 'center', paddingHorizontal: 4 }} key={key}>
                <AvatarComponent
                    mr={4}
                    size="md"
                    badge={!!elm.clockIn}
                    imageUrl={elm?.user?.pictureUrl || AVATAR_FALLBACK_URL}
                />
                <VStack minWidth={{ base: '36%', md: '40%' }} ml={2} flex={1}>
                    <Text
                        bold
                        fontSize="md"
                        noOfLines={1}
                        ellipsizeMode="tail"
                        _dark={{ color: 'gray.200' }}
                        _light={{ color: 'gray.800' }}
                    >
                        {`${Utils.capitalizeFirstChar(elm?.user?.firstName)} ${Utils.capitalizeFirstChar(
                            elm?.user?.lastName
                        )}`}
                    </Text>
                    <Text
                        noOfLines={1}
                        flexWrap="wrap"
                        ellipsizeMode="tail"
                        color={isLightMode ? 'gray.800' : 'gray.100'}
                    >
                        {Utils.truncateString(elm.departmentName)}
                    </Text>
                </VStack>
                <HStack
                    justifyContent="center"
                    flex={1}
                    key={`clockin-${key}`}
                    alignItems="center"
                    minWidth={{ base: '15%', md: '15%' }}
                >
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
                <HStack
                    justifyContent="center"
                    flex={1}
                    key={`clockout-${key}`}
                    alignItems="center"
                    minWidth={{ base: '15%', md: '15%' }}
                >
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
            </HStackComponent>
        ),
    },
];

export {
    campusColumns,
    myAttendanceColumns,
    scoreMappingColumn,
    teamAttendanceDataColumns,
    teamAttendanceDataColumns_1,
    leadersAttendanceDataColumns,
};
