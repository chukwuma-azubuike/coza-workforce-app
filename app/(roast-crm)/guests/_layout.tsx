import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native';

const GuestsScreensLayout: React.FC = () => {
    return (
        <SafeAreaView className="flex-1">
            <Stack
                screenOptions={{
                    headerBackButtonDisplayMode: 'minimal',
                }}
            >
                <Stack.Screen name="index" options={{ title: 'Guests' }} />
                <Stack.Screen name="profile" options={{ title: 'Guest profile' }} />
            </Stack>
        </SafeAreaView>
    );
};

export default GuestsScreensLayout;
