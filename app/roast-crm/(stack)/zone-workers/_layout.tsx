import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native';
import { NavButton } from '~/components/NavButton';

const ZoneWorkersScreensLayout: React.FC = () => {
    return (
        <SafeAreaView className="flex-1">
            <Stack screenOptions={{ headerLeft: () => <NavButton /> }}>
                <Stack.Screen name="index" options={{ title: 'Zone workers' }} />
            </Stack>
        </SafeAreaView>
    );
};

export default ZoneWorkersScreensLayout;
