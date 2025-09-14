import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native';

const TicketsScreensLayout: React.FC = () => {
    return (
        <SafeAreaView className="flex-1">
            <Stack
                screenOptions={{
                    headerBackButtonDisplayMode: 'minimal',
                }}
            >
                <Stack.Screen name="index" options={{ title: 'Tickets' }} />
                <Stack.Screen name="ticket-details" options={{ title: 'Ticket details' }} />
                <Stack.Screen name="issue-ticket" options={{ title: 'Issue ticket' }} />
            </Stack>
        </SafeAreaView>
    );
};

export default TicketsScreensLayout;
