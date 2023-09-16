import React from 'react';
import { HStack, Text } from 'native-base';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ParamListBase } from '@react-navigation/native';
import AvatarComponent from '@components/atoms/avatar';
import { Icon } from '@rneui/themed';
import { THEME_CONFIG } from '@config/appConfig';
import { HomeContext } from '.';
import useRole from '@hooks/role';
import useAppColorMode from '@hooks/theme/colorMode';
import { Linking, TouchableOpacity } from 'react-native';
import { AVATAR_FALLBACK_URL } from '@constants/index';
import { ScreenWidth } from '@rneui/base';

const TopNav: React.FC<NativeStackNavigationProp<ParamListBase, string, undefined>> = navigation => {
    const handleNotificationPress = () => {
        navigation.navigate('Notifications');
    };

    const handleSupportPress = () => {
        Linking.openURL(`mailto:${process.env.SUPPORT_EMAIL}`);
    };

    const handlePress = () => navigation.navigate('Profile');

    const { latestService } = React.useContext(HomeContext);
    const data = latestService?.data;
    const isError = latestService?.isError;
    const isLoading = latestService?.isLoading;

    const { user } = useRole();

    const { isLightMode } = useAppColorMode();

    return (
        <HStack px={3} pt={6} zIndex={20} w={ScreenWidth - 12} alignItems="center" justifyContent="space-between">
            <TouchableOpacity onPress={handlePress} activeOpacity={0.6}>
                <AvatarComponent
                    badge
                    size="sm"
                    shadow={4}
                    _dark={{ bg: 'gray.900' }}
                    _light={{ bg: 'gray.100' }}
                    firstName={user?.firstName}
                    lastName={user?.lastName}
                    imageUrl={user?.pictureUrl ? user.pictureUrl : AVATAR_FALLBACK_URL}
                />
            </TouchableOpacity>
            <Text fontSize="lg" fontWeight="light" _dark={{ color: 'gray.400' }} _light={{ color: 'gray.600' }}>
                {isLoading ? 'Searching for service...' : !isError ? data?.name : 'No service today'}
            </Text>
            {/* <TouchableOpacity onPress={handleNotificationPress} activeOpacity={0.6}>
                <Icon
                    size={16}
                    type="ionicon"
                    borderRadius={10}
                    name="notifications"
                    underlayColor="white"
                    iconStyle={{ fontSize: 35 }}
                    color={isLightMode ? THEME_CONFIG.gray : THEME_CONFIG.lightGray}
                />
            </TouchableOpacity> */}
            <TouchableOpacity onPress={handleSupportPress} activeOpacity={0.6}>
                <Icon
                    size={16}
                    name="help"
                    type="Entypo"
                    borderRadius={10}
                    underlayColor="white"
                    iconStyle={{ fontSize: 35 }}
                    color={isLightMode ? THEME_CONFIG.gray : THEME_CONFIG.lightGray}
                />
            </TouchableOpacity>
        </HStack>
    );
};

export default TopNav;
