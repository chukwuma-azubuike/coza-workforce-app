import React from 'react';
import { HStack, IconButton } from 'native-base';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ParamListBase } from '@react-navigation/native';
import AvatarComponent from '../../../components/atoms/avatar';
import { Icon } from '@rneui/themed';
import { THEME_CONFIG } from '../../../config/appConfig';
import { GestureResponderEvent } from 'react-native';
import Clocker from './clocker';

const Home: React.FC<NativeStackScreenProps<ParamListBase>> = ({
    navigation,
}) => {
    // API implementation

    const handleNotificationPress = (e: GestureResponderEvent) => () => {
        e.preventDefault();
        // navigation.navigate('Profile');
    };

    return (
        <>
            <HStack
                justifyContent="space-between"
                alignItems="center"
                position="relative"
                backgroundColor="white"
                mx={4}
                w="full"
                pr={4}
            >
                <AvatarComponent imageUrl="https://bit.ly/3AdGvvM" />
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
            {/* <GeoLocation /> */}
            <Clocker />
        </>
    );
};

export default Home;
