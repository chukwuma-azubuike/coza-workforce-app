import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native';
import ScreenHeader from '~/components/ScreenHeader';

const CongressScreensLayout: React.FC = () => {
    return (
        <SafeAreaView className="flex-1">
            <Stack screenOptions={{ header: props => <ScreenHeader name={props.route.name} /> }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="/congress-attendance" />
                <Stack.Screen name="/congress-details" />
                <Stack.Screen name="/congress-feedback" />
                <Stack.Screen name="/congress-report" />
                <Stack.Screen name="/congress-resources" />
                <Stack.Screen name="/create-congress" />
                <Stack.Screen name="/create-instant-message" />
            </Stack>
        </SafeAreaView>
    );
};

export default CongressScreensLayout;
