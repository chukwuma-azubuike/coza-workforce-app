import React from 'react';
import { Stack } from 'expo-router';
import { NavButton } from '~/components/NavButton';

const PermissionsScreenLayout: React.FC = () => {
    return (
        <Stack
            screenOptions={{
                headerLeft: () => <NavButton />,
                headerBackButtonDisplayMode: 'minimal',
            }}
        >
            <Stack.Screen name="index" options={{ title: 'Permissions' }} />
            <Stack.Screen name="permission-details" options={{ title: 'Permission details' }} />
            <Stack.Screen name="request-permission" options={{ title: 'Request permission' }} />
        </Stack>
    );
};

export default PermissionsScreenLayout;
