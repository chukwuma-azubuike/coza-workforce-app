import React from 'react';
import { Stack } from 'expo-router';
import { NavButton } from '~/components/NavButton';

const NotificationsLayout: React.FC = () => {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ title: 'Notifications', headerLeft: () => <NavButton /> }} />
        </Stack>
    );
};

export default NotificationsLayout;
