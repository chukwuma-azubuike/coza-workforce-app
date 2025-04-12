import { Text } from '~/components/ui/text';
import React from 'react';
import dayjs from 'dayjs';
import { Icon } from '@rneui/base';
import { THEME_CONFIG } from '@config/appConfig';
import { IFlatListColumn } from '@components/composite/flat-list';
import { IAttendance, IScoreMapping } from '@store/types';
import Utils from '@utils/index';
import { Appearance, View } from 'react-native';
import AvatarComponent from '@components/atoms/avatar';
import { AVATAR_FALLBACK_URL } from '@constants/index';

const colorScheme = Appearance.getColorScheme();

const isLightMode = colorScheme === 'light';

const myAttendanceColumns: IFlatListColumn[] = [
    {
        title: '',
        dataIndex: 'date',
        render: (elm: IAttendance, key) => {
            return (
                <View key={key} className="items-center py-4">
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
                        <Text size="xs" className="font-bold">
                            {dayjs(elm.createdAt).format('ll').substring(4, 6).split(',').join('')}
                        </Text>
                        <Text size="xs" className="font-bold">
                            {dayjs(elm.createdAt).format('dddd').substring(0, 3).toUpperCase()}
                        </Text>
                        <Text size="xs" className="font-bold">
                            {dayjs(elm.createdAt).format('MMMM').substring(0, 3)} / {dayjs(elm.createdAt).format('YY')}
                        </Text>
                    </View>
                    <View key={`clockin-${key}`} className="justify-center items-center">
                        <Icon color={THEME_CONFIG.primaryLight} name="arrow-down-right" type="feather" size={18} />
                        <Text>{elm.clockIn ? dayjs(elm.clockIn).format('h:mm A') : '--:--'}</Text>
                    </View>
                    <View key={`clockin-${key}`} className="justify-center items-center">
                        <Icon color={THEME_CONFIG.primaryLight} name="arrow-up-right" type="feather" size={18} />
                        <Text>{elm.clockOut ? dayjs(elm.clockOut).format('h:mm A') : '--:--'}</Text>
                    </View>
                    <Text key={`hours-${key}`} className="flex-1 text-center">
                        {elm?.clockOut ? Utils.timeDifference(elm.clockOut || '', elm.clockIn || '').hrsMins : '--:--'}
                    </Text>
                </View>
            );
        },
    },
];

export interface ITransformUserAttendanceList {
    campus: string;
    score: number;
    userId: string;
    clockIn: string;
    lastName: string;
    clockOut: string;
    createdAt: string;
    firstName: string;
    pictureUrl: string;
    departmentName: string;
    department: string;
}

const teamAttendanceDataColumns: IFlatListColumn[] = [
    {
        title: '',
        dataIndex: 'name',
        render: (elm: ITransformUserAttendanceList, key) => (
            <View space={4} key={key} className="items-center py-4">
                <AvatarComponent
                    mr={4}
                    size="md"
                    badge={!!elm.clockIn}
                    imageUrl={elm.pictureUrl || AVATAR_FALLBACK_URL}
                />
                <View>
                    <Text className="font-bold">
                        {`${Utils.capitalizeFirstChar(elm?.firstName)} ${Utils.capitalizeFirstChar(elm?.lastName)}`}
                    </Text>
                </View>
                <View key={`clockin-${key}`} className="items-center justify-center">
                    <Icon color={THEME_CONFIG.primaryLight} name="arrow-down-right" type="feather" size={18} />
                    <Text>{elm.clockIn ? dayjs(elm.clockIn).format('h:mm A') : '--:--'}</Text>
                </View>
                <View key={`clockin-${key}`} className="items-center justify-center">
                    <Icon color={THEME_CONFIG.primaryLight} name="arrow-up-right" type="feather" size={18} />
                    <Text>{elm.clockOut ? dayjs(elm.clockOut).format('h:mm A') : '--:--'}</Text>
                </View>
            </View>
        ),
    },
];

const teamAttendanceDataColumns_1: IFlatListColumn[] = [
    {
        title: '',
        dataIndex: 'name',
        render: (elm: ITransformUserAttendanceList, key) => (
            <View space={6} key={key} className="items-center py-4">
                <AvatarComponent
                    mr={4}
                    size="md"
                    badge={!!elm.clockIn}
                    imageUrl={elm.pictureUrl || AVATAR_FALLBACK_URL}
                />
                <View>
                    <Text className="font-bold">
                        {`${Utils.capitalizeFirstChar(elm?.firstName)} ${Utils.capitalizeFirstChar(elm?.lastName)}`}
                    </Text>
                    <Text
                        noOfLines={1}
                        flexWrap="wrap"
                        ellipsizeMode="tail"
                        color={isLightMode ? 'gray.800' : 'gray.100'}
                    >
                        {`Score: ${elm?.score || 0}`}
                    </Text>
                </View>
                <View key={`clockin-${key}`} className="items-center justify-center">
                    <Icon color={THEME_CONFIG.primaryLight} name="arrow-down-right" type="feather" size={18} />
                    <Text>{elm.clockIn ? dayjs(elm.clockIn).format('h:mm A') : '--:--'}</Text>
                </View>
                <View key={`clockin-${key}`} className="items-center justify-center">
                    <Icon color={THEME_CONFIG.primaryLight} name="arrow-up-right" type="feather" size={18} />
                    <Text>{elm.clockOut ? dayjs(elm.clockOut).format('h:mm A') : '--:--'}</Text>
                </View>
            </View>
        ),
    },
];

const scoreMappingColumn: IFlatListColumn[] = [
    {
        title: '',
        dataIndex: 'name',
        render: (elm: IScoreMapping & IAttendance, key) => (
            <View key={`name-${key}`} space={4}>
                <View key={`name-${key}`} space={6} className="items-center justify-start">
                    <AvatarComponent
                        mr={4}
                        size="sm"
                        badge={!!elm.clockIn}
                        imageUrl={elm?.user?.pictureUrl || elm?.pictureUrl || AVATAR_FALLBACK_URL}
                    />
                    <View>
                        <Text flexWrap="wrap" color={isLightMode ? 'gray.800' : 'gray.100'}>
                            {Utils.capitalizeFirstChar(elm?.user?.firstName || elm?.firstName)}
                        </Text>
                        <Text flexWrap="wrap" color={isLightMode ? 'gray.800' : 'gray.100'}>
                            {Utils.capitalizeFirstChar(elm?.user?.lastName || elm?.lastName)}
                        </Text>
                    </View>
                </View>
                <View key={`clockin-${key}`} className="w-20% flex-0">
                    <Icon color={THEME_CONFIG.primaryLight} name="arrow-down-right" type="feather" size={18} />
                    <Text>{elm.clockIn ? dayjs(elm.clockIn).format('h:mm A') : '--:--'}</Text>
                </View>
                <View key={`clockout-${key}`} className="w-20% flex-0">
                    <Icon color={THEME_CONFIG.primaryLight} name="arrow-up-right" type="feather" size={18} />
                    <Text>{elm.clockOut ? dayjs(elm.clockOut).format('h:mm A') : '--:--'}</Text>
                </View>
                <View key={`score-${key}`} className="w-10% flex-0 justify-center">
                    <Text>{!!elm.score ? `${elm.score}` : `${0}`}</Text>
                </View>
            </View>
        ),
    },
];

const leadersAttendanceDataColumns: IFlatListColumn[] = [
    {
        title: '',
        dataIndex: 'name',
        render: (elm: ITransformUserAttendanceList, key) => (
            <View space={4} key={key} className="items-center py-4">
                <AvatarComponent size="md" badge={!!elm.clockIn} imageUrl={elm.pictureUrl || AVATAR_FALLBACK_URL} />
                <View>
                    <Text className="font-bold">
                        {`${Utils.capitalizeFirstChar(elm?.firstName)} ${Utils.capitalizeFirstChar(elm?.lastName)}`}
                    </Text>
                    <Text>{elm.departmentName}</Text>
                </View>
                <View className="justify-center items-center">
                    <Icon color={THEME_CONFIG.primaryLight} name="arrow-down-right" type="feather" size={18} />
                    <Text>{elm.clockIn ? dayjs(elm.clockIn).format('h:mm A') : '--:--'}</Text>
                </View>
                <View className="items-center justify-center">
                    <Icon color={THEME_CONFIG.primaryLight} name="arrow-up-right" type="feather" size={18} />
                    <Text>{elm.clockOut ? dayjs(elm.clockOut).format('h:mm A') : '--:--'}</Text>
                </View>
            </View>
        ),
    },
];

const campusColumns: IFlatListColumn[] = [
    {
        title: '',
        dataIndex: '',
        render: (elm: IAttendance, key) => (
            <View space={4} key={key} className="items-center py-4">
                <AvatarComponent
                    size="md"
                    badge={!!elm.clockIn}
                    imageUrl={elm?.user?.pictureUrl || AVATAR_FALLBACK_URL}
                />
                <View>
                    <Text className="font-bold">
                        {`${Utils.capitalizeFirstChar(elm?.user?.firstName)} ${Utils.capitalizeFirstChar(
                            elm?.user?.lastName
                        )}`}
                    </Text>
                    <Text>{elm.departmentName}</Text>
                </View>
                <View className="justify-center items-center">
                    <Icon color={THEME_CONFIG.primaryLight} name="arrow-down-right" type="feather" size={18} />
                    <Text>{elm.clockIn ? dayjs(elm.clockIn).format('h:mm A') : '--:--'}</Text>
                </View>
                <View className="items-center justify-center">
                    <Icon color={THEME_CONFIG.primaryLight} name="arrow-up-right" type="feather" size={18} />
                    <Text>{elm.clockOut ? dayjs(elm.clockOut).format('h:mm A') : '--:--'}</Text>
                </View>
            </View>
        ),
    },
];

const groupAttendanceDataColumns: IFlatListColumn[] = [
    {
        title: '',
        dataIndex: 'name',
        render: (elm: ITransformUserAttendanceList, key) => (
            <View space={4} key={key} className="items-center py-4">
                <AvatarComponent size="md" badge={!!elm.clockIn} imageUrl={elm.pictureUrl || AVATAR_FALLBACK_URL} />
                <View>
                    <Text className="font-bold">
                        {`${Utils.capitalizeFirstChar(elm?.firstName)} ${Utils.capitalizeFirstChar(elm?.lastName)}`}
                    </Text>
                    <Text>{elm.campus}</Text>
                    <Text>{elm.department}</Text>
                </View>
                <View className="justify-center items-center">
                    <Icon color={THEME_CONFIG.primaryLight} name="arrow-down-right" type="feather" size={18} />
                    <Text>{elm.clockIn ? dayjs(elm.clockIn).format('h:mm A') : '--:--'}</Text>
                </View>
                <View className="items-center justify-center">
                    <Icon color={THEME_CONFIG.primaryLight} name="arrow-up-right" type="feather" size={18} />
                    <Text>{elm.clockOut ? dayjs(elm.clockOut).format('h:mm A') : '--:--'}</Text>
                </View>
            </View>
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
    groupAttendanceDataColumns,
};
