import { Text } from '~/components/ui/text';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Linking, TouchableOpacity } from 'react-native';
import useAppColorMode from '@hooks/theme/colorMode';
import { THEME_CONFIG } from '@config/appConfig';

const SupportLink = () => {
    const handleNotificationPress = () => {
        Linking.openURL(`mailto:${process.env.SUPPORT_EMAIL}`);
    };
    const { isLightMode } = useAppColorMode();
    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleNotificationPress}
            className="flex-row px-3 py-1 pb-1 rounded-xl items-center bg-muted gap-1"
        >
            <Ionicons color={isLightMode ? THEME_CONFIG.gray : THEME_CONFIG.lightGray} name="help" size={20} />
            <Text className="text-lg">Support</Text>
        </TouchableOpacity>
    );
};

export default React.memo(SupportLink);
