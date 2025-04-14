import { Text } from '~/components/ui/text';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Icon } from '@rneui/themed';
import { THEME_CONFIG } from '@config/appConfig';
import { router } from 'expo-router';

interface IUserInfo {
    heading?: string;
    value: string;
    name: string;
    dateString?: string;
    isEditable?: boolean;
}

const NON_EDITABLE = ['email', 'role'];

const UserInfo = ({ heading, value, name, dateString }: IUserInfo) => {
    const handleEdit = () => {
        let field: any = {};
        field[name] = value;

        if (NON_EDITABLE.includes(name)) return;

        console.log(dateString)

        router.push({ pathname: '/profile/edit-profile', params: { [name]: dateString || value } });
    };

    const canEdit = NON_EDITABLE.includes(name);

    return (
        <TouchableOpacity activeOpacity={0.6} disabled={canEdit} onPress={handleEdit}>
            <View className="py-3 flex-1 flex-row items-center gap-2">
                <Text className="font-bold text-muted-foreground">{heading}: </Text>
                <Text className="flex-1 text-muted-foreground">{value}</Text>
                {!NON_EDITABLE.includes(name) && (
                    <Icon color={THEME_CONFIG.gray} name="edit" size={18} type="antdesign" />
                )}
            </View>
        </TouchableOpacity>
    );
};

export default React.memo(UserInfo);
