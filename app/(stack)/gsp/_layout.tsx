import React from 'react';
import { Stack } from 'expo-router';
import { NavButton } from '~/components/NavButton';

const GSPScreens: React.FC = () => {
    return (
        <Stack screenOptions={{ headerLeft: () => <NavButton /> }}>
            <Stack.Screen name="campus" options={{ title: 'Campus' }} />
            <Stack.Screen name="metric" options={{ title: 'Metric' }} />
            <Stack.Screen name="services" options={{ title: 'Services' }} />
            <Stack.Screen name="completeness" options={{ title: 'Completeness' }} />
            <Stack.Screen name="service-report" options={{ title: 'Service Report' }} />
            <Stack.Screen name="approvals" options={{ title: 'Approvals' }} />
            <Stack.Screen name="campus-review" options={{ title: 'Campus Report' }} />
            <Stack.Screen name="workforce-departments" options={{ title: 'Departments' }} />
            <Stack.Screen name="workforce-workers" options={{ title: 'Workers' }} />
            <Stack.Screen name="worker" options={{ title: 'Worker' }} />
        </Stack>
    );
};

export default GSPScreens;
