import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native';
import { NavButton } from '~/components/NavButton';

const GuestsScreensLayout: React.FC = () => {
    return (
        <SafeAreaView className="flex-1">
            <Stack screenOptions={{ headerLeft: () => <NavButton />, headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="(stack)" />
                <Stack.Screen name="(tabs)" />
            </Stack>
        </SafeAreaView>
    );
};

export default GuestsScreensLayout;
