import React from 'react';
import { Stack } from 'expo-router';
import { NavButton } from '~/components/NavButton';

const GroupHeadCampusLayout: React.FC = () => {
    return (
        <Stack screenOptions={{ headerBackButtonDisplayMode: 'minimal' }}>
            <Stack.Screen
                name="index"
                options={{ title: 'Group Head Report History', headerLeft: () => <NavButton /> }}
            />
        </Stack>
    );
};

export default GroupHeadCampusLayout;
