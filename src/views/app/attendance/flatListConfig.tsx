import React from 'react';
import { Box, Center, HStack, Text, VStack } from 'native-base';
import moment from 'moment';
import { Icon } from '@rneui/base';
import { THEME_CONFIG } from '@config/appConfig';
import { IFlatListColumn } from '@components/composite/flat-list';
import { IAttendance, IScoreMapping } from '@store/types';
import Utils from '@utils/index';
import { Appearance, View } from 'react-native';
import AvatarComponent from '@components/atoms/avatar';
import { AVATAR_FALLBACK_URL } from '@constants/index';
import HStackComponent from '@components/layout/h-stack';
import TextComponent from '@components/text';
import VStackComponent from '@components/layout/v-stack';

const colorScheme = Appearance.getColorScheme();

const isLightMode = colorScheme === 'light';

const myAttendanceColumns: IFlatListColumn[] = [
    {
        title: '',
        dataIndex: 'date',
        render: (elm: IAttendance, key) => {
            return (
                <HStackComponent style={{ alignItems: 'center', paddingVertical: 4 }} key={key}>
                    <View
                        style={{
                            flex: 1,
                            padding: 2,
                            width: 54,
                            borderWidth: 0.4,
                            paddingBottom: 4,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderColor: THEME_CONFIG.lightGray,
                        }}
                        key={`date-${key}`}
                    >
                        <TextComponent bold size="xs">
                            {moment(elm.createdAt).format('ll').substring(4, 6).split(',').join('')}
                        </TextComponent>
                        <TextComponent bold size="xs">
                            {moment(elm.createdAt).format('dddd').substring(0, 3).toUpperCase()}
                        </TextComponent>
                        <TextComponent bold size="xs">
                            {moment(elm.createdAt).format('MMMM').substring(0, 3)} /{' '}
                            {moment(elm.createdAt).format('YY')}
                        </TextComponent>
                    </View>
                    <HStackComponent
                        key={`clockin-${key}`}
                        style={{
                            minWidth: '15%',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <Icon color={THEME_CONFIG.primaryLight} name="arrow-down-right" type="feather" size={18} />
                        <TextComponent
                            style={{
                                color: elm.clockIn ? THEME_CONFIG.lightSuccess : THEME_CONFIG.rose,
                            }}
                        >
                            {elm.clockIn ? moment(elm.clockIn).format('LT') : '--:--'}
                        </TextComponent>
                    </HStackComponent>
                    <HStackComponent
                        key={`clockin-${key}`}
                        style={{
                            minWidth: '15%',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <Icon color={THEME_CONFIG.primaryLight} name="arrow-up-right" type="feather" size={18} />
                        <TextComponent>{elm.clockOut ? moment(elm.clockOut).format('LT') : '--:--'}</TextComponent>
                    </HStackComponent>
                    <TextComponent key={`hours-${key}`} style={{ flex: 1, minWidth: '15%', textAlign: 'center' }}>
                        {elm?.clockOut ? Utils.timeDifference(elm.clockOut || '', elm.clockIn || '').hrsMins : '--:--'}
                    </TextComponent>
                </HStackComponent>
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
            <HStackComponent style={{ alignItems: 'center', paddingVertical: 4 }} space={2} key={key}>
                <AvatarComponent
                    mr={4}
                    size="md"
                    badge={!!elm.clockIn}
                    imageUrl={elm.pictureUrl || AVATAR_FALLBACK_URL}
                />
                <VStackComponent style={{ minWidth: '36%' }}>
                    <TextComponent bold>
                        {`${Utils.capitalizeFirstChar(elm?.firstName)} ${Utils.capitalizeFirstChar(elm?.lastName)}`}
                    </TextComponent>
                    <TextComponent
                        noOfLines={1}
                        flexWrap="wrap"
                        ellipsizeMode="tail"
                        color={isLightMode ? 'gray.800' : 'gray.100'}
                    >
                        {`Score: ${elm?.score || 0}`}
                    </TextComponent>
                </VStackComponent>
                <HStackComponent
                    key={`clockin-${key}`}
                    style={{
                        minWidth: '15%',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Icon color={THEME_CONFIG.primaryLight} name="arrow-down-right" type="feather" size={18} />
                    <TextComponent
                        style={{
                            color: elm.clockIn ? THEME_CONFIG.lightSuccess : THEME_CONFIG.rose,
                        }}
                    >
                        {elm.clockIn ? moment(elm.clockIn).format('LT') : '--:--'}
                    </TextComponent>
                </HStackComponent>
                <HStackComponent
                    key={`clockin-${key}`}
                    style={{
                        minWidth: '15%',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Icon color={THEME_CONFIG.primaryLight} name="arrow-up-right" type="feather" size={18} />
                    <TextComponent>{elm.clockOut ? moment(elm.clockOut).format('LT') : '--:--'}</TextComponent>
                </HStackComponent>
            </HStackComponent>
        ),
    },
];

const teamAttendanceDataColumns_1: IFlatListColumn[] = [
    {
        title: '',
        dataIndex: 'name',
        render: (elm: ITransformUserAttendanceList, key) => (
            <HStackComponent style={{ alignItems: 'center', paddingVertical: 4 }} space={6} key={key}>
                <AvatarComponent
                    mr={4}
                    size="md"
                    badge={!!elm.clockIn}
                    imageUrl={elm.pictureUrl || AVATAR_FALLBACK_URL}
                />
                <VStackComponent style={{ minWidth: '36%' }}>
                    <TextComponent bold>
                        {`${Utils.capitalizeFirstChar(elm?.firstName)} ${Utils.capitalizeFirstChar(elm?.lastName)}`}
                    </TextComponent>
                    <TextComponent
                        noOfLines={1}
                        flexWrap="wrap"
                        ellipsizeMode="tail"
                        color={isLightMode ? 'gray.800' : 'gray.100'}
                    >
                        {`Score: ${elm?.score || 0}`}
                    </TextComponent>
                </VStackComponent>
                <HStackComponent
                    key={`clockin-${key}`}
                    style={{
                        minWidth: '15%',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Icon color={THEME_CONFIG.primaryLight} name="arrow-down-right" type="feather" size={18} />
                    <TextComponent
                        style={{
                            color: elm.clockIn ? THEME_CONFIG.lightSuccess : THEME_CONFIG.rose,
                        }}
                    >
                        {elm.clockIn ? moment(elm.clockIn).format('LT') : '--:--'}
                    </TextComponent>
                </HStackComponent>
                <HStackComponent
                    key={`clockin-${key}`}
                    style={{
                        minWidth: '15%',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Icon color={THEME_CONFIG.primaryLight} name="arrow-up-right" type="feather" size={18} />
                    <TextComponent>{elm.clockOut ? moment(elm.clockOut).format('LT') : '--:--'}</TextComponent>
                </HStackComponent>
            </HStackComponent>
        ),
    },
];

const scoreMappingColumn: IFlatListColumn[] = [
    {
        title: '',
        dataIndex: 'name',
        render: (elm: IScoreMapping & IAttendance, key) => (
            <HStackComponent key={`name-${key}`} space={4}>
                <HStackComponent
                    key={`name-${key}`}
                    space={6}
                    style={{
                        minWidth: '40%',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                    }}
                >
                    <AvatarComponent
                        mr={4}
                        size="sm"
                        badge={!!elm.clockIn}
                        imageUrl={elm?.user?.pictureUrl || elm?.pictureUrl || AVATAR_FALLBACK_URL}
                    />
                    <VStackComponent>
                        <TextComponent flexWrap="wrap" color={isLightMode ? 'gray.800' : 'gray.100'}>
                            {Utils.capitalizeFirstChar(elm?.user?.firstName || elm?.firstName)}
                        </TextComponent>
                        <TextComponent flexWrap="wrap" color={isLightMode ? 'gray.800' : 'gray.100'}>
                            {Utils.capitalizeFirstChar(elm?.user?.lastName || elm?.lastName)}
                        </TextComponent>
                    </VStackComponent>
                </HStackComponent>
                <HStackComponent key={`clockin-${key}`} style={{ width: '20%', flex: 0 }}>
                    <Icon color={THEME_CONFIG.primaryLight} name="arrow-down-right" type="feather" size={18} />
                    <TextComponent style={{ color: elm?.clockIn ? THEME_CONFIG.lightSuccess : undefined }}>
                        {elm.clockIn ? moment(elm.clockIn).format('LT') : '--:--'}
                    </TextComponent>
                </HStackComponent>
                <HStackComponent key={`clockout-${key}`} style={{ width: '20%', flex: 0 }}>
                    <Icon color={THEME_CONFIG.primaryLight} name="arrow-up-right" type="feather" size={18} />
                    <TextComponent>{elm.clockOut ? moment(elm.clockOut).format('LT') : '--:--'}</TextComponent>
                </HStackComponent>
                <HStackComponent key={`score-${key}`} style={{ width: '10%', flex: 0, justifyContent: 'center' }}>
                    <TextComponent>{!!elm.score ? `${elm.score}` : `${0}`}</TextComponent>
                </HStackComponent>
            </HStackComponent>
        ),
    },
];

const leadersAttendanceDataColumns: IFlatListColumn[] = [
    {
        title: '',
        dataIndex: 'name',
        render: (elm: ITransformUserAttendanceList, key) => (
            <HStackComponent style={{ alignItems: 'center', paddingVertical: 4 }} space={4} key={key}>
                <AvatarComponent size="md" badge={!!elm.clockIn} imageUrl={elm.pictureUrl || AVATAR_FALLBACK_URL} />
                <VStackComponent style={{ minWidth: '36%' }}>
                    <TextComponent bold>
                        {`${Utils.capitalizeFirstChar(elm?.firstName)} ${Utils.capitalizeFirstChar(elm?.lastName)}`}
                    </TextComponent>
                    <TextComponent>{elm.departmentName}</TextComponent>
                </VStackComponent>
                <HStackComponent style={{ justifyContent: 'center', alignItems: 'center', minWidth: '20%' }}>
                    <Icon color={THEME_CONFIG.primaryLight} name="arrow-down-right" type="feather" size={18} />
                    <TextComponent
                        style={{
                            color: elm.clockIn ? THEME_CONFIG.lightSuccess : THEME_CONFIG.rose,
                        }}
                    >
                        {elm.clockIn ? moment(elm.clockIn).format('LT') : '--:--'}
                    </TextComponent>
                </HStackComponent>
                <HStackComponent
                    style={{
                        minWidth: '20%',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Icon color={THEME_CONFIG.primaryLight} name="arrow-up-right" type="feather" size={18} />
                    <TextComponent>{elm.clockOut ? moment(elm.clockOut).format('LT') : '--:--'}</TextComponent>
                </HStackComponent>
            </HStackComponent>
        ),
    },
];

const campusColumns: IFlatListColumn[] = [
    {
        title: '',
        dataIndex: '',
        render: (elm: IAttendance, key) => (
            <HStackComponent style={{ alignItems: 'center', paddingVertical: 4 }} space={4} key={key}>
                <AvatarComponent
                    size="md"
                    badge={!!elm.clockIn}
                    imageUrl={elm?.user?.pictureUrl || AVATAR_FALLBACK_URL}
                />
                <VStackComponent style={{ minWidth: '36%' }}>
                    <TextComponent bold>
                        {`${Utils.capitalizeFirstChar(elm?.user?.firstName)} ${Utils.capitalizeFirstChar(
                            elm?.user?.lastName
                        )}`}
                    </TextComponent>
                    <TextComponent>{elm.departmentName}</TextComponent>
                </VStackComponent>
                <HStackComponent style={{ justifyContent: 'center', alignItems: 'center', minWidth: '20%' }}>
                    <Icon color={THEME_CONFIG.primaryLight} name="arrow-down-right" type="feather" size={18} />
                    <TextComponent
                        style={{
                            color: elm.clockIn ? THEME_CONFIG.lightSuccess : THEME_CONFIG.rose,
                        }}
                    >
                        {elm.clockIn ? moment(elm.clockIn).format('LT') : '--:--'}
                    </TextComponent>
                </HStackComponent>
                <HStackComponent
                    style={{
                        minWidth: '20%',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Icon color={THEME_CONFIG.primaryLight} name="arrow-up-right" type="feather" size={18} />
                    <TextComponent>{elm.clockOut ? moment(elm.clockOut).format('LT') : '--:--'}</TextComponent>
                </HStackComponent>
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
