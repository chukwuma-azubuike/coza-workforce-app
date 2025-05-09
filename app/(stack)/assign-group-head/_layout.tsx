import React from 'react';
import { Stack } from 'expo-router';

const AssignGroupHeadScreens: React.FC = () => {
    return (
        <Stack
            screenOptions={{
                headerBackButtonDisplayMode: 'minimal',
            }}
        >
            <Stack.Screen name="(stack)/assign-group-head/index" options={{ title: 'Assign group head' }} />
        </Stack>
    );
};

export default AssignGroupHeadScreens;
