import React from 'react';
import { Stack } from 'expo-router';
import { NavButton } from '~/components/NavButton';

const ProfileScreensLayout: React.FC = () => {
    return (
        <Stack screenOptions={{ headerLeft: () => <NavButton /> }}>
            <Stack.Screen name="index" options={{ title: 'Profile' }} />
            <Stack.Screen name="edit-profile" options={{ title: 'Edit Profile' }} />
        </Stack>
    );
};

export default ProfileScreensLayout;
