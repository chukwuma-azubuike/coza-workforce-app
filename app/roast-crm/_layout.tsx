import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import { NavButton } from '~/components/NavButton';
import CallPromptManager from '~/views/roast-crm/components/CallPromptManager';

const GuestsScreensLayout: React.FC = () => {
    return (
        <SafeAreaView className="flex-1" edges={['right', 'left', Platform.OS === 'android' ? 'top' : 'bottom']}>
            <Stack screenOptions={{ headerLeft: () => <NavButton />, headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="(stack)" />
                <Stack.Screen name="(tabs)" />
            </Stack>
            <CallPromptManager />
        </SafeAreaView>
    );
};

export default GuestsScreensLayout;
