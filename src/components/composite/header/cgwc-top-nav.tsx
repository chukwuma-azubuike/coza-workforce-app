import React, { ReactNode } from 'react';
import { HStack } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import AvatarComponent from '@components/atoms/avatar';
import { Icon } from '@rneui/themed';
import { THEME_CONFIG } from '@config/appConfig';
import useRole from '@hooks/role';
import useAppColorMode from '@hooks/theme/colorMode';
import { Linking, TouchableOpacity } from 'react-native';
import { AVATAR_FALLBACK_URL } from '@constants/index';
import { ScreenWidth } from '@rneui/base';

const CGWCTopNav: React.FC<{ title: string | ReactNode }> = ({ title }) => {
    const { navigate } = useNavigation();

    const handleSupportPress = () => {
        Linking.openURL(`mailto:${process.env.SUPPORT_EMAIL}`);
    };

    const handlePress = () => navigate('Profile');

    const { user } = useRole();
    const { isLightMode } = useAppColorMode();

    return (
        <HStack
            h="100%"
            zIndex={20}
            px={2}
            w={ScreenWidth}
            alignItems="center"
            justifyContent="space-between"
        >
            <TouchableOpacity onPress={handlePress} activeOpacity={0.6}>
                <AvatarComponent
                    badge
                    size="sm"
                    shadow={4}
                    lastName={user?.lastName}
                    _dark={{ bg: 'gray.900' }}
                    _light={{ bg: 'gray.100' }}
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
        </HStack>
    );
};

export default React.memo(CGWCTopNav);
