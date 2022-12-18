import React from 'react';
import { HStack, IconButton, Text } from 'native-base';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ParamListBase } from '@react-navigation/native';
import AvatarComponent from '../../../components/atoms/avatar';
import { Icon } from '@rneui/themed';
import { THEME_CONFIG } from '../../../config/appConfig';
import { HomeContext } from '.';
import useRole from '../../../hooks/role';

const TopNav: React.FC<
    NativeStackNavigationProp<ParamListBase, string, undefined>
> = navigation => {
    // API implementation

    const handleNotificationPress = () => {
        navigation.navigate('Notifications');
    };

    const handlePress = () => navigation.navigate('Profile');

    const {
        latestService: { data, isError, isLoading },
    } = React.useContext(HomeContext);

    const { user } = useRole();

    return (
        <HStack
            justifyContent="space-between"
            backgroundColor="transparent"
            alignItems="center"
            zIndex={20}
            flex={1}
            w="full"
            pr={4}
            pl={3}
        >
            <IconButton
                onPress={handlePress}
                icon={
                    <AvatarComponent
                        badge
                        size="sm"
                        shadow={4}
                        firstName={user?.firstName}
                        lastName={user?.lastName}
                        imageUrl={
                            user?.pictureUrl
                                ? user.pictureUrl
                                : 'https://i.ibb.co/P6k4dWF/Group-3.png'
                        }
                    />
                }
                p={0}
                h={10}
                w={10}
                borderRadius="full"
            />
            <Text fontSize="lg" color="gray.500" fontWeight="light">
                {isLoading
                    ? 'Searching for service...'
                    : !isError
                    ? data?.name
                    : 'No service today'}
            </Text>
            <IconButton
                icon={
                    <Icon
                        color={THEME_CONFIG.lightGray}
                        iconStyle={{ fontSize: 21 }}
                        name="notifications-outline"
                        underlayColor="white"
                        borderRadius={10}
                        type="ionicon"
                        size={16}
                        raised
                    />
                }
                p={1}
                h={10}
                w={10}
                onPress={handleNotificationPress}
                borderRadius="full"
            />
        </HStack>
    );
};

export default TopNav;
