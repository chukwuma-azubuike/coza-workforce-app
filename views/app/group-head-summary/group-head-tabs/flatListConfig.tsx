import { Text } from "~/components/ui/text";
import { Icon } from '@rneui/base';
import dayjs from 'dayjs';
import React from 'react';
import { Appearance, View } from 'react-native';
import AvatarComponent from '@components/atoms/avatar';
import { IFlatListColumn } from '@components/composite/flat-list';
import { THEME_CONFIG } from '@config/appConfig';
import { AVATAR_FALLBACK_URL } from '@constants';
import Utils from '@utils';

const colorScheme = Appearance.getColorScheme();

const isLightMode = colorScheme === 'light';

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
            <View key={`name-${key}`} alignItems="center" flex={1} textAlign="left" w="full" minWidth={45}>
                <AvatarComponent
                    mr={4}
                    size="md"
                    badge={!!elm.clockIn}
                    imageUrl={elm.pictureUrl || AVATAR_FALLBACK_URL}
                />
                <View justifyContent="center">
                    <Text flexWrap="wrap" color={isLightMode ? 'gray.800' : 'gray.100'} ml={2}>
                        {Utils.capitalizeFirstChar(elm.firstName)}
                    </Text>
                    <Text flexWrap="wrap" color={isLightMode ? 'gray.800' : 'gray.100'} ml={2}>
                        {Utils.capitalizeFirstChar(elm.lastName)}
                    </Text>
                </View>
            </View>
        ),
    },
    {
        title: '                     Clock In',
        dataIndex: 'clockIn',
        render: (elm: ITransformUserAttendanceList, key) => (
            <View key={`clockin-${key}`} minWidth={0} justifyContent="center" flex={1} textAlign="left" w="full">
                <Icon color={THEME_CONFIG.primaryLight} name="arrow-down-right" type="feather" size={18} />
                <Text
                    _dark={{
                        color: elm.clockIn ? 'green.300' : 'red.300',
                    }}
                    color={elm.clockIn ? 'green.500' : 'red.500'}
                    textAlign="center"
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
            <View key={`clockout-${key}`} justifyContent="center" flex={1} textAlign="left" w="full">
                <Icon color={THEME_CONFIG.primaryLight} name="arrow-up-right" type="feather" size={18} />
                <Text
                    color="gray.500"
                    _dark={{
                        color: 'warmGray.200',
                    }}
                >
                    {elm.clockOut ? dayjs(elm.clockOut).format('h:mm A') : '--:--'}
                </Text>
            </View>
        ),
    },
];
export { teamAttendanceDataColumns };
