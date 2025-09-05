import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native';
import { NavButton } from '~/components/NavButton';

const GroupHeadCampusLayout: React.FC = () => {
    return (
        <SafeAreaView className="flex-1">
            <Stack screenOptions={{ headerBackButtonDisplayMode: 'minimal' }}>
                <Stack.Screen name="index" options={{ title: 'Group Head Campus', headerLeft: () => <NavButton /> }} />
                <Stack.Screen name="group-head-campuses" options={{ title: 'Group Head campuses ' }} />
                <Stack.Screen name="group-head-departments" options={{ title: 'Group Head departments ' }} />
                <Stack.Screen
                    name="group-head-department-activies"
                    options={{ title: 'Group Head department Activies' }}
                />
            </Stack>
        </SafeAreaView>
    );
};

export default GroupHeadCampusLayout;
