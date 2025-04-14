import { Text } from '~/components/ui/text';
import React from 'react';
import dayjs from 'dayjs';
import { Icon } from '@rneui/base';
import { THEME_CONFIG } from '@config/appConfig';
import { IFlatListColumn } from '@components/composite/flat-list';
import { IAttendance, IScoreMapping } from '@store/types';
import Utils from '@utils/index';
import { TouchableOpacity, View } from 'react-native';
import AvatarComponent from '@components/atoms/avatar';
import { AVATAR_FALLBACK_URL } from '@constants/index';
import StatusTag from '~/components/atoms/status-tag';
import { router } from 'expo-router';

const gotoProfile = (elm: any) => () => {
    router.push({ pathname: '/workforce-summary/user-profile', params: elm as any });
};

const myAttendanceColumns: IFlatListColumn[] = [
    {
        title: '',
        dataIndex: 'date',
        render: (elm: IAttendance, key) => {
            return (
                <View key={key} className="items-center py-1 flex-row w-full gap-4 justify-between">
                    <View
                        className="border border-border rounded-md !w-min justify-center py-2 px-3 items-center"
                        key={`date-${key}`}
                    >
                        <Text className="font-bold text-sm">{dayjs(elm.createdAt).format('DD')}</Text>
                        <Text className="font-bold text-sm">{dayjs(elm.createdAt).format('ddd')}</Text>
                        <Text className="font-bold text-sm">
                            {dayjs(elm.createdAt).format('MMM')} / {dayjs(elm.createdAt).format('YY')}
                        </Text>
                    </View>
                    <View className="justify-center items-center flex-row gap-2 flex-1">
                        <Icon color={THEME_CONFIG.primaryLight} name="arrow-down-right" type="feather" size={18} />
                        <Text>{elm.clockIn ? dayjs(elm.clockIn).format('h:mm A') : '--:--'}</Text>
                    </View>
                    <View className="justify-center items-center flex-row gap-2 flex-1">
                        <Icon color={THEME_CONFIG.primaryLight} name="arrow-up-right" type="feather" size={18} />
                        <Text>{elm.clockOut ? dayjs(elm.clockOut).format('h:mm A') : '--:--'}</Text>
                    </View>
                    <Text className="text-center flex-1">
                        {elm?.clockOut ? Utils.timeDifference(elm.clockOut || '', elm.clockIn || '').hrsMins : '--:--'}
                    </Text>
                </View>
            );
        },
    },
];

export interface ITransformUserAttendanceList {
    campusName: string;
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
            <TouchableOpacity
                key={key}
                activeOpacity={0.6}
                onPress={gotoProfile(elm)}
                className="items-center py-3 flex-row w-full gap-4 justify-between"
            >
                <AvatarComponent
                    alt="pic"
                    className="h-14 w-14"
                    badge={!!elm.clockIn}
                    imageUrl={elm.pictureUrl || AVATAR_FALLBACK_URL}
                />
                <View className="flex-1 gap-2">
                    <View className="flex-row justify-between">
                        <Text className="font-bold truncate">
                            {`${Utils.capitalizeFirstChar(elm?.firstName)} ${Utils.capitalizeFirstChar(elm?.lastName)}`}
                        </Text>
                        //TODO: Should be attendance status ("LATE", "PRESENT")
                        {/* <StatusTag>{elm?.status}</StatusTag> */}
                    </View>
                    <View className="flex-row justify-between">
                        <View className="items-center flex-row gap-2 flex-1">
                            <Icon color={THEME_CONFIG.primaryLight} name="arrow-down-right" type="feather" size={18} />
                            <Text>{elm.clockIn ? dayjs(elm.clockIn).format('h:mm A') : '--:--'}</Text>
                        </View>
                        <View className="items-center flex-row gap-2 flex-1">
                            <Icon color={THEME_CONFIG.primaryLight} name="arrow-up-right" type="feather" size={18} />
                            <Text>{elm.clockOut ? dayjs(elm.clockOut).format('h:mm A') : '--:--'}</Text>
                        </View>
                        <Text className="text-right flex-1">
                            {elm?.clockOut
                                ? Utils.timeDifference(elm.clockOut || '', elm.clockIn || '').hrsMins
                                : '--:--'}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        ),
    },
];

const scoreMappingColumn: IFlatListColumn[] = [
    {
        title: '',
        dataIndex: 'name',
        render: (elm: IScoreMapping & IAttendance, key) => (
            <View key={`name-${key}`} className="gap-4">
                <View key={`name-${key}`} className="items-center justify-start gap-6">
                    <AvatarComponent
                        alt="pic"
                        badge={!!elm.clockIn}
                        className="h-8 w-8 mr-4"
                        imageUrl={elm?.user?.pictureUrl || elm?.pictureUrl || AVATAR_FALLBACK_URL}
                    />
                    <View>
                        <Text className="flex-wrap text-muted-foreground">
                            {Utils.capitalizeFirstChar(elm?.user?.firstName || elm?.firstName)}
                        </Text>
                        <Text className="flex-wrap text-muted-foreground">
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
        render: (elm: ITransformUserAttendanceList, key) => {
            return (
                <TouchableOpacity
                    key={key}
                    activeOpacity={0.6}
                    onPress={gotoProfile(elm)}
                    className="items-center py-3 flex-row w-full gap-4 justify-between"
                >
                    <AvatarComponent
                        alt="pic"
                        className="h-14 w-14"
                        badge={!!elm.clockIn}
                        imageUrl={elm.pictureUrl || AVATAR_FALLBACK_URL}
                    />
                    <View className="flex-1 gap-2">
                        <View className="flex-row justify-between">
                            <Text className="font-bold truncate">
                                {`${Utils.capitalizeFirstChar(elm?.firstName)} ${Utils.capitalizeFirstChar(
                                    elm?.lastName
                                )}`}
                            </Text>
                            //TODO: Should be attendance status ("LATE", "PRESENT")
                            {/* <StatusTag>{elm?.status}</StatusTag> */}
                        </View>
                        <View className="flex-row gap-2">
                            <Text className="flex-1 text-muted-foreground">{elm?.departmentName}</Text>
                            <View className="flex-row flex-1 gap-2">
                                <View className="items-center flex-row gap-2 flex-1">
                                    <Icon
                                        color={THEME_CONFIG.primaryLight}
                                        name="arrow-down-right"
                                        type="feather"
                                        size={18}
                                    />
                                    <Text>{elm.clockIn ? dayjs(elm.clockIn).format('h:mm A') : '--:--'}</Text>
                                </View>
                                <View className="items-center flex-row gap-2 text-right flex-1 justify-end">
                                    <Icon
                                        color={THEME_CONFIG.primaryLight}
                                        name="arrow-up-right"
                                        type="feather"
                                        size={18}
                                    />
                                    <Text>{elm.clockOut ? dayjs(elm.clockOut).format('h:mm A') : '--:--'}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            );
        },
    },
];

const campusColumns: IFlatListColumn[] = [
    {
        title: '',
        dataIndex: '',
        render: (elm: IAttendance, key) => (
            <TouchableOpacity
                key={key}
                activeOpacity={0.6}
                onPress={gotoProfile(elm)}
                className="items-center py-3 flex-row w-full gap-4 justify-between"
            >
                <AvatarComponent
                    alt="pic"
                    className="h-14 w-14"
                    badge={!!elm.clockIn}
                    imageUrl={elm?.user.pictureUrl || AVATAR_FALLBACK_URL}
                />
                <View className="flex-1 gap-2">
                    <View className="flex-row justify-between">
                        <Text className="font-bold truncate">
                            {`${Utils.capitalizeFirstChar(elm?.user?.firstName)} ${Utils.capitalizeFirstChar(
                                elm?.user?.lastName
                            )}`}
                        </Text>
                        //TODO: Should be attendance status ("LATE", "PRESENT")
                        {/* <StatusTag>{elm?.status}</StatusTag> */}
                    </View>
                    <View className="flex-row gap-2">
                        <Text className="flex-1 text-muted-foreground">{elm?.departmentName}</Text>
                        <View className="flex-row flex-1 gap-2">
                            <View className="items-center flex-row gap-2 flex-1 justify-center">
                                <Icon
                                    color={THEME_CONFIG.primaryLight}
                                    name="arrow-down-right"
                                    type="feather"
                                    size={18}
                                />
                                <Text>{elm.clockIn ? dayjs(elm.clockIn).format('h:mm A') : '--:--'}</Text>
                            </View>
                            <View className="items-center flex-row gap-2 text-right flex-1 justify-center">
                                <Icon
                                    color={THEME_CONFIG.primaryLight}
                                    name="arrow-up-right"
                                    type="feather"
                                    size={18}
                                />
                                <Text>{elm.clockOut ? dayjs(elm.clockOut).format('h:mm A') : '--:--'}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        ),
    },
];

const groupAttendanceDataColumns: IFlatListColumn[] = [
    {
        title: '',
        dataIndex: 'name',
        render: (elm: ITransformUserAttendanceList, key) => (
            <TouchableOpacity
                key={key}
                activeOpacity={0.6}
                onPress={gotoProfile(elm)}
                className="items-center py-3 flex-row w-full gap-4 justify-between"
            >
                <AvatarComponent
                    alt="pic"
                    className="h-14 w-14"
                    badge={!!elm.clockIn}
                    imageUrl={elm.pictureUrl || AVATAR_FALLBACK_URL}
                />
                <View className="flex-1 gap-1">
                    <View className="flex-row justify-between">
                        <Text className="font-bold truncate">
                            {`${Utils.capitalizeFirstChar(elm?.firstName)} ${Utils.capitalizeFirstChar(elm?.lastName)}`}
                        </Text>
                        //TODO: Should be attendance status ("LATE", "PRESENT")
                        {/* <StatusTag>{elm?.status}</StatusTag> */}
                    </View>
                    <View className="flex-row gap-2 items-end">
                        <View className="flex-1 gap-2">
                            <Text className="flex-1 text-muted-foreground">{elm?.departmentName}</Text>
                            <Text className="flex-1 text-muted-foreground">{elm?.campusName}</Text>
                        </View>
                        <View className="flex-row flex-1 gap-2">
                            <View className="items-center flex-row gap-2 flex-1">
                                <Icon
                                    color={THEME_CONFIG.primaryLight}
                                    name="arrow-down-right"
                                    type="feather"
                                    size={18}
                                />
                                <Text>{elm.clockIn ? dayjs(elm.clockIn).format('h:mm A') : '--:--'}</Text>
                            </View>
                            <View className="items-center flex-row gap-2 text-right flex-1 justify-end">
                                <Icon
                                    color={THEME_CONFIG.primaryLight}
                                    name="arrow-up-right"
                                    type="feather"
                                    size={18}
                                />
                                <Text>{elm.clockOut ? dayjs(elm.clockOut).format('h:mm A') : '--:--'}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        ),
    },
];

export {
    campusColumns,
    myAttendanceColumns,
    scoreMappingColumn,
    teamAttendanceDataColumns,
    leadersAttendanceDataColumns,
    groupAttendanceDataColumns,
};
