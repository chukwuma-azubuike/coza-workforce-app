import { Text } from '~/components/ui/text';
import React from 'react';
import { AVATAR_FALLBACK_URL } from '@constants/index';
import { IUser } from '@store/types';
import AvatarComponent from '@components/atoms/avatar';
import StatusTag from '@components/atoms/status-tag';
import Utils from '@utils/index';
import { ViewProps, View } from 'react-native';

const UserListItem: React.FC<IUser & { style?: ViewProps['style'] }> = ({
    pictureUrl,
    firstName,
    lastName,
    departmentName,
    gender,
}) => {
    return (
        <View className="items-center flex-row gap-4 w-full">
            <AvatarComponent alt="profile-pic" imageUrl={pictureUrl || AVATAR_FALLBACK_URL} />
            <View className="flex-1">
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
