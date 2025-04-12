import { Text } from "~/components/ui/text";
import React from 'react';
import HStackComponent from '@components/layout/h-stack';
import VStackComponent from '@components/layout/v-stack';
import { AVATAR_FALLBACK_URL } from '@constants/index';
import { IUser } from '@store/types';
import AvatarComponent from '@components/atoms/avatar';
import StatusTag from '@components/atoms/status-tag';
import Utils from '@utils/index';
import { ViewProps, View } from 'react-native';
import TextComponent from '@components/text';

const UserListItem: React.FC<IUser & { style?: ViewProps['style'] }> = ({
    pictureUrl,
    firstName,
    lastName,
    departmentName,
    gender,
    style,
}) => {
    return (
        <View space={8} className="items-center">
            <AvatarComponent size="sm" imageUrl={pictureUrl || AVATAR_FALLBACK_URL} />
            <View>
                <Text className="font-bold">
                    {`${Utils.capitalizeFirstChar(firstName)} ${Utils.capitalizeFirstChar(lastName)}`}
                </Text>
                <Text>{departmentName}</Text>
            </View>
            <StatusTag>{(gender === 'M' ? 'Male' : 'Female') as any}</StatusTag>
        </View>
    );
};

export default React.memo(UserListItem);
