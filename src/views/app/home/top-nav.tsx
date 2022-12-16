import React from 'react';
import { HStack, IconButton, Text } from 'native-base';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ParamListBase } from '@react-navigation/native';
import AvatarComponent from '../../../components/atoms/avatar';
import { Icon } from '@rneui/themed';
import { THEME_CONFIG } from '../../../config/appConfig';
import { HomeContext } from '.';
import { TouchableNativeFeedback } from 'react-native';

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

    return (
        <HStack
            justifyContent="space-between"
            backgroundColor="transparent"
            alignItems="center"
            zIndex={20}
            flex={1}
            w="full"
            pl={4}
        >
            <TouchableNativeFeedback onPress={handlePress}>
                <AvatarComponent
                    badge
                    size="sm"
                    shadow={9}
                    imageUrl="https://bit.ly/3AdGvvM"
                />
            </TouchableNativeFeedback>

            <Text
                marginLeft={6}
                fontSize="lg"
                color="gray.500"
                fontWeight="light"
            >
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
                onPress={handleNotificationPress}
                borderRadius="full"
            />
        </HStack>
    );
};

export default TopNav;
