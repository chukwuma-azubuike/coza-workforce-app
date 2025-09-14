import React from 'react';
import { Stack } from 'expo-router';
import { NavButton } from '~/components/NavButton';

const AssignGroupHeadScreens: React.FC = () => {
    return (
        <Stack
            screenOptions={{
                headerBackButtonDisplayMode: 'minimal',
            }}
        >
            <Stack.Screen name="index" options={{ title: 'Assign group head', headerLeft: () => <NavButton /> }} />
        </Stack>
    );
};

export default AssignGroupHeadScreens;
