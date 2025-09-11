import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Text } from '~/components/ui/text';
import dayjs from 'dayjs';
import { Icon } from '@rneui/base';
import { THEME_CONFIG } from '@config/appConfig';
import { IAttendance, IScoreMapping } from '@store/types';
import Utils from '@utils/index';
import AvatarComponent from '@components/atoms/avatar';
import { AVATAR_FALLBACK_URL } from '@constants/index';
import { router } from 'expo-router';

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

const gotoProfile = (elm: any) => () => {
    router.push({ pathname: '/workforce-summary/user-profile', params: (elm?.user as any) || elm });
};

export const MyAttendanceRow: React.FC<{ item: IAttendance; index: number }> = ({ item }) => {
    return (
        <View className="items-center py-1 flex-row w-full gap-4 justify-between">
            <View className="border border-border rounded-md !w-min justify-center py-2 px-3 items-center">
                <Text className="font-bold text-sm">{dayjs(item.createdAt).format('DD')}</Text>
                <Text className="font-bold text-sm">{dayjs(item.createdAt).format('ddd')}</Text>
                <Text className="font-bold text-sm">
                    {dayjs(item.createdAt).format('MMM')} / {dayjs(item.createdAt).format('YY')}
                </Text>
            </View>
            <View className="justify-center items-center flex-row gap-2 flex-1">
                <Icon color={THEME_CONFIG.primaryLight} name="arrow-down-right" type="feather" size={18} />
                <Text className="text-green-500">{item.clockIn ? dayjs(item.clockIn).format('h:mm A') : '--:--'}</Text>
            </View>
            <View className="justify-center items-center flex-row gap-2 flex-1">
                <Icon color={THEME_CONFIG.primaryLight} name="arrow-up-right" type="feather" size={18} />
                <Text>{item.clockOut ? dayjs(item.clockOut).format('h:mm A') : '--:--'}</Text>
            </View>
            <Text className="text-center flex-1">
                {item?.clockOut ? Utils.timeDifference(item.clockOut || '', item.clockIn || '').hrsMins : '--:--'}
            </Text>
        </View>
    );
};

export const TeamAttendanceRow: React.FC<{ item: ITransformUserAttendanceList; index: number }> = ({ item }) => {
    return (
        <TouchableOpacity
            activeOpacity={0.6}
            onPress={gotoProfile(item)}
            className="items-center py-3 pr-4 flex-row w-full gap-4 justify-between"
        >
            <AvatarComponent
                alt="pic"
                className="h-14 w-14"
                badge={!!item.clockIn}
                imageUrl={item.pictureUrl || AVATAR_FALLBACK_URL}
            />
            <View className="flex-1 gap-2">
                <View className="flex-row justify-between">
                    <Text className="font-bold truncate">
                        {`${Utils.capitalizeFirstChar(item?.firstName)} ${Utils.capitalizeFirstChar(item?.lastName)}`}
                    </Text>
                </View>
                <View className="flex-row justify-between">
                    <View className="items-center flex-row gap-2 flex-1">
                        <Icon color={THEME_CONFIG.primaryLight} name="arrow-down-right" type="feather" size={18} />
                        <Text className="text-green-500">
                            {item.clockIn ? dayjs(item.clockIn).format('h:mm A') : '--:--'}
                        </Text>
                    </View>
                    <View className="items-center flex-row gap-2 flex-1">
                        <Icon color={THEME_CONFIG.primaryLight} name="arrow-up-right" type="feather" size={18} />
                        <Text>{item.clockOut ? dayjs(item.clockOut).format('h:mm A') : '--:--'}</Text>
                    </View>
                    <Text className="text-right flex-1">
                        {item?.clockOut
                            ? Utils.timeDifference(item.clockOut || '', item.clockIn || '').hrsMins
                            : '--:--'}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

export const LeadersAttendanceRow: React.FC<{ item: ITransformUserAttendanceList; index: number }> = ({ item }) => {
    return (
        <TouchableOpacity
            activeOpacity={0.6}
            onPress={gotoProfile(item)}
            className="items-center py-3 pr-4 flex-row w-full gap-4 justify-between"
        >
            <AvatarComponent
                alt="pic"
                className="h-14 w-14"
                badge={!!item.clockIn}
                imageUrl={item?.pictureUrl || AVATAR_FALLBACK_URL}
            />
            <View className="flex-1 gap-2">
                <View className="flex-row justify-between">
                    <Text className="font-bold truncate">
                        {`${Utils.capitalizeFirstChar(item?.firstName)} ${Utils.capitalizeFirstChar(item?.lastName)}`}
                    </Text>
                </View>
                <View className="flex-row gap-2 flex-1">
                    <Text className="flex-1 text-muted-foreground">{item?.departmentName}</Text>
                    <View className="flex-row flex-1 gap-4">
                        <View className="items-center flex-row gap-2 w-5/12 justify-center">
                            <Icon color={THEME_CONFIG.primaryLight} name="arrow-down-right" type="feather" size={18} />
                            <Text className="text-green-500">
                                {item.clockIn ? dayjs(item.clockIn).format('h:mm A') : '--:--'}
                            </Text>
                        </View>
                        <View className="items-center flex-row gap-2 text-right flex-1 justify-center">
                            <Icon color={THEME_CONFIG.primaryLight} name="arrow-up-right" type="feather" size={18} />
                            <Text>{item.clockOut ? dayjs(item.clockOut).format('h:mm A') : '--:--'}</Text>
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

export const CampusAttendanceRow: React.FC<{ item: IAttendance; index: number }> = ({ item }) => {
    return (
        <TouchableOpacity
            activeOpacity={0.6}
            onPress={gotoProfile(item)}
            className="items-center py-3 pr-2 flex-row w-full gap-4 justify-between"
        >
            <AvatarComponent
                alt="pic"
                className="h-14 w-14"
                badge={!!item.clockIn}
                imageUrl={item?.user?.pictureUrl || AVATAR_FALLBACK_URL}
            />
            <View className="flex-1 gap-2">
                <View className="flex-row justify-between">
                    <Text className="font-bold truncate">
                        {`${Utils.capitalizeFirstChar(item?.user?.firstName)} ${Utils.capitalizeFirstChar(
                            item?.user?.lastName
                        )}`}
                    </Text>
                </View>
                <View className="flex-row gap-2">
                    <Text className="w-5/12 text-muted-foreground">{item?.departmentName}</Text>
                    <View className="flex-row flex-1 gap-2">
                        <View className="items-center flex-row gap-2 flex-1 justify-center">
                            <Icon color={THEME_CONFIG.primaryLight} name="arrow-down-right" type="feather" size={18} />
                            <Text className="text-green-500">
                                {item.clockIn ? dayjs(item.clockIn).format('h:mm A') : '--:--'}
                            </Text>
                        </View>
                        <View className="items-center flex-row gap-2 text-right flex-1 justify-center">
                            <Icon color={THEME_CONFIG.primaryLight} name="arrow-up-right" type="feather" size={18} />
                            <Text>{item.clockOut ? dayjs(item.clockOut).format('h:mm A') : '--:--'}</Text>
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

export const GroupAttendanceRow: React.FC<{ item: IAttendance; index: number }> = ({ item }) => {
    return (
        <TouchableOpacity
            activeOpacity={0.6}
            onPress={gotoProfile(item)}
            className="items-center py-3 pr-2 flex-row w-full gap-4 justify-between"
        >
            <AvatarComponent
                alt="pic"
                className="h-14 w-14"
                badge={!!item.clockIn}
                imageUrl={item?.user?.pictureUrl || AVATAR_FALLBACK_URL}
            />
            <View className="flex-1 gap-2">
                <View className="flex-row justify-between">
                    <Text className="font-bold truncate">
                        {`${Utils.capitalizeFirstChar(item?.user?.firstName)} ${Utils.capitalizeFirstChar(
                            item?.user?.lastName
                        )}`}
                    </Text>
                </View>
                <View className="flex-row gap-2">
                    <Text className="w-5/12 font-semibold flex-1">
                        {item?.campusName}{' '}
                        <Text className="font-semibold text-muted-foreground">({item?.departmentName})</Text>
                    </Text>
                    <View className="flex-row flex-1 gap-2">
                        <View className="items-center flex-row gap-2 flex-1 justify-center">
                            <Icon color={THEME_CONFIG.primaryLight} name="arrow-down-right" type="feather" size={18} />
                            <Text className="text-green-500">
                                {item.clockIn ? dayjs(item.clockIn).format('h:mm A') : '--:--'}
                            </Text>
                        </View>
                        <View className="items-center flex-row gap-2 text-right flex-1 justify-center">
                            <Icon color={THEME_CONFIG.primaryLight} name="arrow-up-right" type="feather" size={18} />
                            <Text>{item.clockOut ? dayjs(item.clockOut).format('h:mm A') : '--:--'}</Text>
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

export const ScoreMappingRow: React.FC<{ item: IAttendance & IScoreMapping; index: number }> = ({ item }) => {
    return (
        <View className="gap-4 flex-row w-full">
            <View className="items-center justify-start gap-4 flex-row flex-1">
                <AvatarComponent
                    alt="pic"
                    badge={!!item.clockIn}
                    className="h-12 w-12"
                    imageUrl={item?.user?.pictureUrl || item?.pictureUrl || AVATAR_FALLBACK_URL}
                />
                <View>
                    <Text className="flex-wrap text-muted-foreground">
                        {Utils.capitalizeFirstChar(item?.user?.firstName || item?.firstName)}
                    </Text>
                    <Text className="flex-wrap text-muted-foreground">
                        {Utils.capitalizeFirstChar(item?.user?.lastName || item?.lastName)}
                    </Text>
                </View>
            </View>
            <View className="flex-row justify-between">
                <View className="flex-row items-center w-24 justify-center">
                    <Icon color={THEME_CONFIG.primaryLight} name="arrow-down-right" type="feather" size={18} />
                    <Text className="text-green-500">
                        {item.clockIn ? dayjs(item.clockIn).format('h:mm A') : '--:--'}
                    </Text>
                </View>
                <View className="flex-row items-center w-24 justify-center">
                    <Icon color={THEME_CONFIG.primaryLight} name="arrow-up-right" type="feather" size={18} />
                    <Text>{item.clockOut ? dayjs(item.clockOut).format('h:mm A') : '--:--'}</Text>
                </View>
                <View className="flex-row items-center w-8 justify-center">
                    <Text>{!!item.score ? `${item.score}` : `${0}`}</Text>
                </View>
            </View>
        </View>
    );
};
