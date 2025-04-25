import React from 'react';
import { Stack } from 'expo-router';
import ScreenHeader from '~/components/ScreenHeader';

const PermissionsScreens: React.FC = () => {
    return (
        <Stack
            screenOptions={{
                headerBackButtonDisplayMode: 'minimal',
                header: props => <ScreenHeader name={props.route.name} />,
            }}
        >
            <Stack.Screen name="index" />
            <Stack.Screen name="user-profile" />
            <Stack.Screen name="user-report" />
            <Stack.Screen name="user-report-details" />
            <Stack.Screen name="workforce-management" />
            <Stack.Screen name="global-workforce" />
            <Stack.Screen name="create-user" />
            <Stack.Screen name="create-campus" />
            <Stack.Screen name="create-department" />
            <Stack.Screen name="campus-workforce" />
        </Stack>
    );
};

export default PermissionsScreens;
