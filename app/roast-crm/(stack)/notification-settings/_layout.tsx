import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native';
import { NavButton } from '~/components/NavButton';

const NotificationSettingsScreensLayout: React.FC = () => {
    return (
        <SafeAreaView className="flex-1">
            <Stack screenOptions={{ headerLeft: () => <NavButton /> }}>
                <Stack.Screen name="index" options={{ title: 'Notifications' }} />
            </Stack>
        </SafeAreaView>
    );
};

export default NotificationSettingsScreensLayout;
