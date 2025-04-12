import React, { ReactNode } from 'react';
import { useNavigation } from '@react-navigation/native';
import AvatarComponent from '@components/atoms/avatar';
import { Icon } from '@rneui/themed';
import { THEME_CONFIG } from '@config/appConfig';
import useRole from '@hooks/role';
import useAppColorMode from '@hooks/theme/colorMode';
import { Linking, TouchableOpacity, View } from 'react-native';
import { AVATAR_FALLBACK_URL } from '@constants/index';
import { ScreenWidth } from '@rneui/base';
import { router } from 'expo-router';

const CGWCTopNav: React.FC<{ title: string | ReactNode }> = ({ title }) => {
    const { navigate } = useNavigation();

    const handleSupportPress = () => {
        Linking.openURL(`mailto:${process.env.SUPPORT_EMAIL}`);
    };

    const handlePress = () => router.push('/profile');

    const { user } = useRole();
    const { isLightMode } = useAppColorMode();

    return (
        <View style={{ width: ScreenWidth }} className="px-2 h-full z-20 items-center justify-center">
            <TouchableOpacity onPress={handlePress} activeOpacity={0.6}>
                <AvatarComponent
                    badge
                    alt="profle-pic"
                    lastName={user?.lastName}
                    className="w-8 h-8 shadow-sm"
                    firstName={user?.firstName}
                    imageUrl={user?.pictureUrl || AVATAR_FALLBACK_URL}
                />
            </TouchableOpacity>
            {title}
            <TouchableOpacity onPress={handleSupportPress} activeOpacity={0.6}>
                <Icon
                    size={16}
                    name="help"
                    type="Entypo"
                    borderRadius={10}
                    underlayColor="white"
                    iconStyle={{ fontSize: 36, marginRight: -3 }}
                    color={isLightMode ? THEME_CONFIG.gray : THEME_CONFIG.lightGray}
                />
            </TouchableOpacity>
        </View>
    );
};

export default React.memo(CGWCTopNav);
