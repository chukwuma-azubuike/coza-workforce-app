import { Text } from '~/components/ui/text';
import { Icon } from '@rneui/base';
import dayjs from 'dayjs';
import React from 'react';
import { View } from 'react-native';
import AvatarComponent from '@components/atoms/avatar';
import { IFlatListColumn } from '@components/composite/flat-list';
import { THEME_CONFIG } from '@config/appConfig';
import { AVATAR_FALLBACK_URL } from '@constants';
import Utils from '@utils';
export interface ITransformUserAttendanceList {
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
        title: 'Name',
        dataIndex: 'name',
        render: (elm: ITransformUserAttendanceList, key) => (
            <View key={`name-${key}`} className="items-center flex-1 text-left w-full">
                <AvatarComponent
                    alt="avatar"
                    className="mr-8"
                    badge={!!elm.clockIn}
                    imageUrl={elm.pictureUrl || AVATAR_FALLBACK_URL}
                />
                <View className="justify-center">
                    <Text className="flex-wrap text-muted-foreground ml-4">
                        {Utils.capitalizeFirstChar(elm.firstName)}
                    </Text>
                    <Text className="flex-wrap text-muted-foreground ml-2">
                        {Utils.capitalizeFirstChar(elm.lastName)}
                    </Text>
                </View>
            </View>
        ),
    },
    {
        title: 'Clock In',
        dataIndex: 'clockIn',
        render: (elm: ITransformUserAttendanceList, key) => (
            <View key={`clockin-${key}`} className="min-w-0 justify-center flex-1 text-left w-full">
                <Icon color={THEME_CONFIG.primaryLight} name="arrow-down-right" type="feather" size={18} />
                <Text
                    className={`text-center ${
                        elm.clockIn ? 'text-green-500 dark:text-green-300' : 'text-red-500 dark:text-red-300'
                    }`}
                >
                    {elm.clockIn ? dayjs(elm.clockIn).format('h:mm A') : '--:--'}
                </Text>
            </View>
        ),
    },
    {
        title: 'Clock Out',
        dataIndex: 'clockOut',
        render: (elm: ITransformUserAttendanceList, key) => (
            <View key={`clockout-${key}`} className="justify-center flex-1 text-left w-full">
                <Icon color={THEME_CONFIG.primaryLight} name="arrow-up-right" type="feather" size={18} />
                <Text className="text-muted-foreground">
                    {elm.clockOut ? dayjs(elm.clockOut).format('h:mm A') : '--:--'}
                </Text>
            </View>
        ),
    },
];
export { teamAttendanceDataColumns };
