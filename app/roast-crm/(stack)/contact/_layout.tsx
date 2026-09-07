import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native';

/**
 * No header, deliberately.
 *
 * This screen is on-screen for about one frame before the dialer covers it, and it
 * `replace`s itself with Today — so a back button would point at a screen that is already
 * gone by the time anybody could press it.
 */
const ContactScreensLayout: React.FC = () => {
    return (
        <SafeAreaView className="flex-1">
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
            </Stack>
        </SafeAreaView>
    );
};

export default ContactScreensLayout;
