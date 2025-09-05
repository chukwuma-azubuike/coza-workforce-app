import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native';
import { NavButton } from '~/components/NavButton';

const GroupHeadCampusLayout: React.FC = () => {
    return (
        <SafeAreaView className="flex-1">
            <Stack screenOptions={{ headerBackButtonDisplayMode: 'minimal' }}>
                <Stack.Screen
                    name="index"
                    options={{ title: 'Group Head Report History', headerLeft: () => <NavButton /> }}
                />
            </Stack>
        </SafeAreaView>
    );
};

export default GroupHeadCampusLayout;
