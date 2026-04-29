import React from 'react';
import { Stack } from 'expo-router';
import { NavButton } from '~/components/NavButton';

const GHApprovalsLayout: React.FC = () => {
    return (
        <Stack screenOptions={{ headerBackButtonDisplayMode: 'minimal' }}>
            <Stack.Screen
                name="index"
                options={{ title: 'Approvals', headerLeft: () => <NavButton /> }}
            />
            <Stack.Screen
                name="report-detail"
                options={{ title: 'Report Detail', headerLeft: () => <NavButton /> }}
            />
        </Stack>
    );
};

export default GHApprovalsLayout;
