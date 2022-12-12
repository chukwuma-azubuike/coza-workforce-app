import React from 'react';
import { HStack, IconButton } from 'native-base';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ParamListBase } from '@react-navigation/native';
import AvatarComponent from '../../../components/atoms/avatar';
import { Icon } from '@rneui/themed';
import { THEME_CONFIG } from '../../../config/appConfig';

const TopNav: React.FC<
    NativeStackNavigationProp<ParamListBase, string, undefined>
> = navigation => {
    // API implementation

    const handleNotificationPress = () => {
        navigation.navigate('Notifications');
    };

    const handlePress = () => navigation.navigate('Profile');

    return (
        <HStack
            justifyContent="space-between"
            backgroundColor="white"
            alignItems="center"
            position="absolute"
            flex={1}
            w="full"
            top={6}
            mx={4}
            pr={4}
        >
            <IconButton onPress={handlePress} background="none">
                <AvatarComponent
                    badge
                    shadow={9}
                    size="sm"
                    imageUrl="https://bit.ly/3AdGvvM"
                />
            </IconButton>

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
                onPress={handleNotificationPress}
                borderRadius="full"
            />
        </HStack>
    );
};

export default TopNav;
