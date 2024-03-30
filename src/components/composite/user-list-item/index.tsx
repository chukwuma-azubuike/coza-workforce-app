import React from 'react';
import HStackComponent from '@components/layout/h-stack';
import VStackComponent from '@components/layout/v-stack';
import { AVATAR_FALLBACK_URL } from '@constants/index';
import { IUser } from '@store/types';
import AvatarComponent from '@components/atoms/avatar';
import StatusTag from '@components/atoms/status-tag';
import { Text } from 'native-base';
import Utils from '@utils/index';
import { ViewProps } from 'react-native';

const UserListItem: React.FC<IUser & { style?: ViewProps['style'] }> = ({
    pictureUrl,
    firstName,
    lastName,
    departmentName,
    gender,
    style,
}) => {
    return (
        <HStackComponent space={3} style={{ alignItems: 'center', ...(style as {}) }}>
            <AvatarComponent size="sm" imageUrl={pictureUrl || AVATAR_FALLBACK_URL} />
            <VStackComponent>
                <Text
                    bold
                    fontSize="md"
                    noOfLines={1}
                    ellipsizeMode="tail"
                    _dark={{ color: 'gray.200' }}
                    _light={{ color: 'gray.800' }}
                >
                    {`${Utils.capitalizeFirstChar(firstName)} ${Utils.capitalizeFirstChar(lastName)}`}
                </Text>
                <Text
                    fontSize="md"
                    noOfLines={1}
                    ellipsizeMode="tail"
                    _dark={{ color: 'gray.200' }}
                    _light={{ color: 'gray.800' }}
                >
                    {departmentName}
                </Text>
            </VStackComponent>
            <StatusTag>{(gender === 'M' ? 'Male' : 'Female') as any}</StatusTag>
        </HStackComponent>
    );
};

export default React.memo(UserListItem);
