import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native';
import { NavButton } from '~/components/NavButton';

const WorkerProfileScreensLayout: React.FC = () => {
    return (
        <SafeAreaView className="flex-1">
            <Stack screenOptions={{ headerLeft: () => <NavButton /> }}>
                <Stack.Screen name="index" options={{ title: 'Worker profile' }} />
            </Stack>
        </SafeAreaView>
    );
};

export default WorkerProfileScreensLayout;
