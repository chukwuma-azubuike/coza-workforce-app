import React from 'react';
import { Stack } from 'expo-router';
import { NavButton } from '~/components/NavButton';

const ExportDataScreens: React.FC = () => {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ title: 'Export Data', headerLeft: () => <NavButton /> }} />
        </Stack>
    );
};

export default ExportDataScreens;
