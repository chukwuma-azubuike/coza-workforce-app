import React from 'react';
import { Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Icon } from '@rneui/themed';
import { THEME_CONFIG } from '@config/appConfig';
import TextComponent from '@components/text';
import HStackComponent from '@components/layout/h-stack';

interface IUserInfo {
    heading?: string;
    value: string;
    name: string;
    isEditable?: boolean;
}

const NON_EDITABLE = ['email', 'role'];

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
            <HStackComponent style={{ paddingVertical: 8 }}>
                <TextComponent>
                    <TextComponent size="lg" bold>
                        {heading}:{' '}
                    </TextComponent>
                    <TextComponent size="lg">{value}</TextComponent>
                </TextComponent>
                {!NON_EDITABLE.includes(name) && (
                    <Icon color={THEME_CONFIG.gray} name="edit" size={18} type="antdesign" />
                )}
            </HStackComponent>
        </Pressable>
    );
};

export default React.memo(UserInfo);
