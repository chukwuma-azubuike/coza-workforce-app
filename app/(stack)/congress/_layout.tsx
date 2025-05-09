import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native';
import { NavButton } from '~/components/NavButton';

const CongressScreensLayout: React.FC = () => {
    return (
        <SafeAreaView className="flex-1">
            <Stack screenOptions={{ headerBackButtonDisplayMode: 'minimal' }}>
                <Stack.Screen name="index" options={{ title: 'Congress', headerLeft: () => <NavButton /> }} />
                <Stack.Screen name="congress-attendance" options={{ title: 'Congress attendance' }} />
                <Stack.Screen name="congress-details" options={{ title: 'Congress details' }} />
                <Stack.Screen name="congress-feedback" options={{ title: 'Congress feedback' }} />
                <Stack.Screen name="congress-report" options={{ title: 'Congress report' }} />
                <Stack.Screen name="congress-resources" options={{ title: 'Congress resources' }} />
                <Stack.Screen name="create-congress" options={{ title: 'Create congress' }} />
                <Stack.Screen name="create-instant-message" options={{ title: 'Create instant message' }} />
            </Stack>
        </SafeAreaView>
    );
};

export default CongressScreensLayout;
