import React from 'react';
import { Stack } from 'expo-router';
import { NavButton } from '~/components/NavButton';

const AdminGroupScreens: React.FC = () => {
    return (
        <Stack
            screenOptions={{
                headerBackButtonDisplayMode: 'minimal',
            }}
        >
            <Stack.Screen name="index" options={{ title: 'Groups', headerLeft: () => <NavButton /> }} />
            <Stack.Screen name="group-detail" options={{ title: 'Group Detail', headerLeft: () => <NavButton /> }} />
            <Stack.Screen name="create-group" options={{ title: 'Create Group', headerLeft: () => <NavButton /> }} />
        </Stack>
    );
};

export default AdminGroupScreens;
