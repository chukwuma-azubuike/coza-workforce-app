import { Text, Linking } from 'react-native';
import React from 'react';
import { Icon } from '@rneui/themed';
import { Box } from 'native-base';
import useAppColorMode from '../../hooks/theme/colorMode';
import { THEME_CONFIG } from '../../config/appConfig';

const SupportLink = () => {
    const handleNotificationPress = () => {
        Linking.openURL(`mailto:${process.env.SUPPORT_EMAIL}`);
    };
    const { isLightMode } = useAppColorMode();
    return (
        <Box flexDirection="row" alignItems="center">
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
        </Box>
    );
};

export default SupportLink;
