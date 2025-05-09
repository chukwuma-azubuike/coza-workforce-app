import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native';
import { NavButton } from '~/components/NavButton';

const ProfileScreensLayout: React.FC = () => {
    return (
        <SafeAreaView className="flex-1">
            <Stack screenOptions={{ headerLeft: () => <NavButton /> }}>
                <Stack.Screen name="index" options={{ title: 'Profile' }} />
                <Stack.Screen name="edit-profile" options={{ title: 'Edit Profile' }} />
            </Stack>
        </SafeAreaView>
    );
};

export default ProfileScreensLayout;
