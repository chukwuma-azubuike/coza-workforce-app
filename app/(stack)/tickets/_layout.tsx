import React from 'react';
import { Stack } from 'expo-router';
import { NavButton } from '~/components/NavButton';

const TicketsScreensLayout: React.FC = () => {
    return (
        <Stack
            screenOptions={{
                headerLeft: () => <NavButton />,
                headerBackButtonDisplayMode: 'minimal',
            }}
        >
            <Stack.Screen name="index" options={{ title: 'Tickets' }} />
            <Stack.Screen name="ticket-details" options={{ title: 'Ticket details' }} />
            <Stack.Screen name="issue-ticket" options={{ title: 'Issue ticket' }} />
        </Stack>
    );
};

export default TicketsScreensLayout;
