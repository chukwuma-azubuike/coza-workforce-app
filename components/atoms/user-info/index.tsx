import { Text } from '~/components/ui/text';
import React from 'react';
import { Pressable, View } from 'react-native';
import { Icon } from '@rneui/themed';
import { THEME_CONFIG } from '@config/appConfig';
import { router } from 'expo-router';

interface IUserInfo {
    heading?: string;
    value: string;
    name: string;
    isEditable?: boolean;
}

const NON_EDITABLE = ['email', 'role'];

const UserInfo = ({ heading, value, name }: IUserInfo) => {
    const handleEdit = () => {
        let field: any = {};
        field[name] = value;

        if (NON_EDITABLE.includes(name)) return;

        router.push('/profile/edit-profile');
    };

    return (
        <Pressable onPress={handleEdit}>
            <View className="py-3 flex-1 flex-row items-center gap-2">
                <Text className="font-bold text-muted-foreground">{heading}: </Text>
                <Text className="flex-1 text-muted-foreground">{value}</Text>
                {!NON_EDITABLE.includes(name) && (
                    <Icon color={THEME_CONFIG.gray} name="edit" size={18} type="antdesign" />
                )}
            </View>
        </Pressable>
    );
};

export default React.memo(UserInfo);
