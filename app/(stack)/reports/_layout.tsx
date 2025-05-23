import React from 'react';
import { Stack } from 'expo-router';
import { NavButton } from '~/components/NavButton';

const ReportsLayout: React.FC = () => {
    return (
        <Stack
            screenOptions={{
                headerBackButtonDisplayMode: 'minimal',
                headerLeft: () => <NavButton />,
            }}
        >
            <Stack.Screen name="index" options={{ title: 'Reports' }} />
            <Stack.Screen name="attendance-report" options={{ title: 'Attendance reports' }} />
            <Stack.Screen name="campus-report" options={{ title: 'Campus report' }} />
            <Stack.Screen name="childcare-report" options={{ title: 'Childcare report' }} />
            <Stack.Screen name="guest-report" options={{ title: 'Guest report' }} />
            <Stack.Screen name="incident-report" options={{ title: 'Incident report' }} />
            <Stack.Screen name="security-report" options={{ title: 'Security report' }} />
            <Stack.Screen name="service-report" options={{ title: 'Service report' }} />
            <Stack.Screen name="transfer-report" options={{ title: 'Transfer report' }} />
        </Stack>
    );
};

export default ReportsLayout;
