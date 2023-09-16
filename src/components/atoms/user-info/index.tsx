import React from 'react';
import { Heading, HStack, Text } from 'native-base';
import { Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Icon } from '@rneui/themed';
import { THEME_CONFIG } from '@config/appConfig';
import { ScreenWidth } from '@rneui/base';

interface IUserInfo {
    heading?: string;
    value: string;
    name: string;
    isEditable?: boolean;
}

const NON_EDITABLE = ['email', 'role'];

const UserInfo = ({ heading, value, name, isEditable = true }: IUserInfo) => {
    const { navigate } = useNavigation();

    const handleEdit = () => {
        let field: any = {};
        field[name] = value;

        if (NON_EDITABLE.includes(name)) return;

        navigate('Edit Profile' as never, field as never);
    };

    return (
        <Pressable onPress={handleEdit}>
            <HStack alignItems="center" justifyContent="space-between" paddingRight={4}>
                <Text ml={3} my={2} flexDirection="row" width={ScreenWidth / 1.25}>
                    <Heading size="sm" _dark={{ color: 'gray.300' }} _light={{ color: 'gray.700' }}>
                        {heading}:{' '}
                    </Heading>
                    <Text
                        flexWrap="wrap"
                        fontWeight="400"
                        ellipsizeMode="tail"
                        numberOfLines={1}
                        width={ScreenWidth / 1.85}
                        _dark={{ color: 'gray.400' }}
                        _light={{ color: 'gray.600' }}
                    >
                        {value}
                    </Text>
                </Text>
                {!NON_EDITABLE.includes(name) && (
                    <Icon color={THEME_CONFIG.gray} name="edit" size={18} type="antdesign" />
                )}
            </HStack>
        </Pressable>
    );
};

export default UserInfo;
