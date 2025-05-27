import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native';
import { NavButton } from '~/components/NavButton';

const PermissionsScreenLayout: React.FC = () => {
    return (
        <SafeAreaView className="flex-1">
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
        </SafeAreaView>
    );
};

export default PermissionsScreenLayout;
