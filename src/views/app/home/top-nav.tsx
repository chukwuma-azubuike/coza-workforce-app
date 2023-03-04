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

const TopNav: React.FC<NativeStackNavigationProp<ParamListBase, string, undefined>> = navigation => {
    // API implementation

    const handleNotificationPress = () => {
        navigation.navigate('Notifications');
    };

    const handlePress = () => navigation.navigate('Profile');

    const {
        latestService: { data, isError, isLoading },
    } = React.useContext(HomeContext);

    const { user } = useRole();

    const { isLightMode } = useAppColorMode();

    return (
        <HStack justifyContent="space-between" alignItems="center" zIndex={20} w="full" pr={4} pl={3}>
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
                        imageUrl={user?.pictureUrl ? user.pictureUrl : 'https://i.ibb.co/P6k4dWF/Group-3.png'}
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
            <IconButton
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
            />
        </HStack>
    );
};

export default TopNav;
