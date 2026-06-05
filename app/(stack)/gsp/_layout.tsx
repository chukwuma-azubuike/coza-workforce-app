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
            <Stack.Screen name="approval-detail" options={{ title: 'Report Detail' }} />
        </Stack>
    );
};

export default GSPScreens;
