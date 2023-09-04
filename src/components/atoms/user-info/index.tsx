import React from 'react';
import { Heading, HStack, Stack, Text } from 'native-base';
import Utils from '@utils/index';
import { Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Icon } from '@rneui/themed';
import { THEME_CONFIG } from '@config/appConfig';

interface IUserInfo {
    heading?: string;
    value: string;
    name: string;
}

const NON_EDITABLE = ['email'];

const UserInfo = ({ heading, value, name }: IUserInfo) => {
    const { navigate } = useNavigation();

    const handleEdit = () => {
        let field: any = {};
        field[name] = value;

        if (NON_EDITABLE.includes(name)) return;

        navigate('Edit Profile' as never, field as never);
    };

    return (
        <Pressable onPress={handleEdit}>
            <HStack alignItems="center" justifyContent="space-between" paddingRight={2}>
                <Stack ml={4} flexDirection="row" alignItems="center" justifyItems="center" my={2}>
                    <Heading size="sm" _dark={{ color: 'gray.300' }} _light={{ color: 'gray.700' }}>
                        {heading}:
                    </Heading>
                    <Text
                        ml="2"
                        flexWrap="wrap"
                        fontWeight="400"
                        _dark={{ color: 'gray.400' }}
                        _light={{ color: 'gray.600' }}
                    >
                        {value && Utils.truncateString(value, 40)}
                    </Text>
                </Stack>
                <Icon color={THEME_CONFIG.gray} name="edit" size={18} type="antdesign" />
            </HStack>
        </Pressable>
    );
};

export default UserInfo;
