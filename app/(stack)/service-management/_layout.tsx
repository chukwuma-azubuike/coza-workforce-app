import React from 'react';
import { Stack } from 'expo-router';
import { NavButton } from '~/components/NavButton';

const ServiceManagementScreens: React.FC = () => {
    return (
        <Stack screenOptions={{ headerLeft: () => <NavButton /> }}>
            <Stack.Screen name="index" options={{ title: 'Service management' }} />
            <Stack.Screen name="create-congress-session" options={{ title: 'Create congress session' }} />
            <Stack.Screen name="create-service" options={{ title: 'Create service' }} />
        </Stack>
    );
};

export default ServiceManagementScreens;
