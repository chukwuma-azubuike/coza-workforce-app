import React from 'react';
import { Stack } from 'expo-router';
import ScreenHeader from '~/components/ScreenHeader';

const ReportsLayout: React.FC = () => {
    return (
        <Stack
            screenOptions={{
                headerBackButtonDisplayMode: 'minimal',
                header: props => <ScreenHeader name={props.route.name} />,
            }}
        >
            <Stack.Screen name="index" />
            <Stack.Screen name="attendance-report" />
            <Stack.Screen name="campus-report" />
            <Stack.Screen name="childcare-report" />
            <Stack.Screen name="guest-report" />
            <Stack.Screen name="incident-report" />
            <Stack.Screen name="security-report" />
            <Stack.Screen name="service-report" />
            <Stack.Screen name="transfer-report" />
        </Stack>
    );
};

export default ReportsLayout;
