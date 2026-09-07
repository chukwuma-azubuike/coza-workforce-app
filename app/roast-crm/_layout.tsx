import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import { NavButton } from '~/components/NavButton';
import CallPromptManager from '~/views/roast-crm/components/CallPromptManager';
import { useRoastEngagement } from '~/hooks/roast-engagement';

const GuestsScreensLayout: React.FC = () => {
    /**
     * The engagement runtime — scheduler, outbox, tray actions, ping, streak.
     *
     * Mounted here, once. It has to sit above every Roast screen (a reminder must be
     * rescheduled whether or not the reminders screen is open) and below the session (all
     * five are no-ops when signed out). Mounting it per-screen would give the scheduler
     * two copies reconciling against one ledger.
     */
    useRoastEngagement();

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
