import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native';
import ScreenHeader from '~/components/ScreenHeader';

const ProfileScreensLayout: React.FC = () => {
    return (
        <SafeAreaView className="flex-1">
            <Stack screenOptions={{ header: props => <ScreenHeader name={props.route.name} /> }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="/edit-profile" />
            </Stack>
        </SafeAreaView>
    );
};

export default ProfileScreensLayout;
