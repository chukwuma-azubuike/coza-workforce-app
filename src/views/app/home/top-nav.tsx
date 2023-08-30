import React from 'react';
import { HStack, IconButton, Text } from 'native-base';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ParamListBase } from '@react-navigation/native';
import AvatarComponent from '../../../components/atoms/avatar';
import { Icon } from '@rneui/themed';
import { THEME_CONFIG } from '../../../config/appConfig';
import { HomeContext } from '.';
import useRole from '../../../hooks/role';
import useAppColorMode from '../../../hooks/theme/colorMode';
import { Linking } from 'react-native';
import { AVATAR_FALLBACK_URL } from '../../../constants';

const TopNav: React.FC<NativeStackNavigationProp<ParamListBase, string, undefined>> = navigation => {
    // API implementation

    const handleNotificationPress = () => {
        Linking.openURL(`mailto:${process.env.SUPPORT_EMAIL}`);

        // navigation.navigate('Notifications');
    };

    const handlePress = () => navigation.navigate('Profile');

    const { latestService } = React.useContext(HomeContext);
    const data = latestService?.data;
    const isError = latestService?.isError;
    const isLoading = latestService?.isLoading;

    const { user } = useRole();

    const { isLightMode } = useAppColorMode();

    return (
        <HStack justifyContent="space-between" alignItems="center" zIndex={20} w="full" pr={4} pl={3} pt={10}>
            <IconButton
                onPress={handlePress}
                icon={
                    <AvatarComponent
                        badge
                        _light={{ bg: 'gray.100' }}
                        _dark={{ bg: 'gray.900' }}
                        size="sm"
                        shadow={4}
                        firstName={user?.firstName}
                        lastName={user?.lastName}
                        imageUrl={user?.pictureUrl ? user.pictureUrl : AVATAR_FALLBACK_URL}
                    />
                }
                p={0}
                h={10}
                w={10}
                borderRadius="full"
            />
            <Text fontSize="lg" fontWeight="light" _dark={{ color: 'gray.400' }} _light={{ color: 'gray.600' }}>
                {isLoading ? 'Searching for service...' : !isError ? data?.name : 'No service today'}
            </Text>
            {/* <IconButton
                icon={
                    <Icon
                        color={isLightMode ? THEME_CONFIG.gray : THEME_CONFIG.lightGray}
                        iconStyle={{ fontSize: 21 }}
                        name="notifications-outline"
                        underlayColor="white"
                        raised={isLightMode}
                        borderRadius={10}
                        type="ionicon"
                        size={16}
                    />
                }
                p={1}
                h={10}
                w={10}
                _light={{ bg: 'gray.100' }}
                _dark={{ bg: 'gray.900' }}
                onPress={handleNotificationPress}
                borderRadius="full"
            /> */}
            <IconButton
                icon={
                    <Icon
                        color={isLightMode ? THEME_CONFIG.gray : THEME_CONFIG.lightGray}
                        iconStyle={{ fontSize: 26 }}
                        name="help"
                        underlayColor="white"
                        raised={isLightMode}
                        borderRadius={10}
                        type="Entypo"
                        size={16}
                    />
                }
                p={1}
                h={10}
                w={10}
                _light={{ bg: 'gray.100' }}
                _dark={{ bg: 'gray.900' }}
                onPress={handleNotificationPress}
                borderRadius="full"
            />
        </HStack>
    );
};

export default TopNav;
