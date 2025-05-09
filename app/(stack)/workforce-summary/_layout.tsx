import React from 'react';
import { Stack } from 'expo-router';
import { NavButton } from '~/components/NavButton';

const PermissionsScreens: React.FC = () => {
    return (
        <Stack screenOptions={{ headerLeft: () => <NavButton /> }}>
            <Stack.Screen name="index" options={{ title: 'index' }} />
            <Stack.Screen name="user-profile" options={{ title: 'User profile' }} />
            <Stack.Screen name="user-report" options={{ title: 'User report' }} />
            <Stack.Screen name="user-report-details" options={{ title: 'User report details' }} />
            <Stack.Screen name="workforce-management" options={{ title: 'Workforce management' }} />
            <Stack.Screen name="global-workforce" options={{ title: 'Global workforce' }} />
            <Stack.Screen name="create-user" options={{ title: 'Create user' }} />
            <Stack.Screen name="create-campus" options={{ title: 'Create campus' }} />
            <Stack.Screen name="create-department" options={{ title: 'Create department' }} />
            <Stack.Screen name="campus-workforce" options={{ title: 'Campus workforce' }} />
        </Stack>
    );
};

export default PermissionsScreens;
