import { Linking, Platform } from 'react-native';
import React from 'react';
import { Icon } from '@rneui/themed';
import { HStack, Text } from 'native-base';
import useAppColorMode from '../../hooks/theme/colorMode';
import { THEME_CONFIG } from '../../config/appConfig';

const SupportLink = () => {
    const handleNotificationPress = () => {
        const email = process.env.SUPPORT_EMAIL as string;
        const url = `mailto:${email}`;

        Linking.canOpenURL(url).then(supported => {
            if (!supported) {
                Linking.openURL(url);
            } else {
                // Fallback for iOS versions that don't support mailto:
                if (Platform.OS === 'ios') {
                    const fallbackUrl = `message://compose?to=${email}`;
                    Linking.openURL(fallbackUrl);
                }
            }
        });
    };
    const { isLightMode } = useAppColorMode();
    return (
        <HStack px={2} py={1} pb={1.5} borderRadius="lg" alignItems="center" _dark={{ bg: 'gray.800', space: 2 }}>
            <Icon
                color={isLightMode ? THEME_CONFIG.gray : THEME_CONFIG.lightGray}
                iconStyle={{ fontSize: 16 }}
                name="help"
                underlayColor="white"
                raised={isLightMode}
                borderRadius={10}
                type="Entypo"
                size={8}
            />
            <Text onPress={handleNotificationPress}>Support</Text>
        </HStack>
    );
};

export default SupportLink;
