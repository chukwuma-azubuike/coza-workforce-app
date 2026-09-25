import React from 'react';
import { Stack } from 'expo-router';
import { NavButton } from '~/components/NavButton';

const ServiceManagementScreens: React.FC = () => {
    return (
        <Stack screenOptions={{ headerLeft: () => <NavButton /> }}>
            <Stack.Screen name="index" options={{ title: 'Service management' }} />
            <Stack.Screen name="create-congress-session" options={{ title: 'New session' }} />
            <Stack.Screen name="create-service" options={{ title: 'New service' }} />
            <Stack.Screen name="update-service" options={{ title: 'Edit service' }} />
        </Stack>
    );
};

export default ServiceManagementScreens;
