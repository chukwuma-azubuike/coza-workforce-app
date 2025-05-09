import React from 'react';
import { Stack } from 'expo-router';

const ExportDataScreens: React.FC = () => {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    title: 'Export Data',
                    headerBackVisible: true,
                }}
            />
        </Stack>
    );
};

export default ExportDataScreens;
