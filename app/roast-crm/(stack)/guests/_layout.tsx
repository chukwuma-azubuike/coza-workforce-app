import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native';
import { NavButton } from '~/components/NavButton';

const GuestsScreensLayout: React.FC = () => {
    return (
        <SafeAreaView className="flex-1">
            <Stack screenOptions={{ headerLeft: () => <NavButton /> }}>
                <Stack.Screen name="index" options={{ title: 'Guests' }} />
                <Stack.Screen name="profile" options={{ title: 'Guest profile' }} />
                <Stack.Screen name="add-guest" options={{ presentation: 'modal', title: 'Add Guest' }} />
            </Stack>
        </SafeAreaView>
    );
};

export default GuestsScreensLayout;
