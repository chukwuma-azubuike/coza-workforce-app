import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native';

import ScreenHeader from '~/components/ScreenHeader';

const PermissionsScreenLayout: React.FC = () => {
    return (
        <SafeAreaView className="flex-1">
            <Stack
                screenOptions={{
                    headerBackButtonDisplayMode: 'minimal',
                    header: props => <ScreenHeader name={props.route.name} />,
                }}
            >
                <Stack.Screen name="index" />
                <Stack.Screen name="(stack)/permissions/permission-details" />
                <Stack.Screen name="(stack)/permissions/request-permission" />
            </Stack>
        </SafeAreaView>
    );
};

export default PermissionsScreenLayout;
