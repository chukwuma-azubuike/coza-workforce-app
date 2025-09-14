import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native';

const MoreScreenLayout: React.FC = () => {
    return (
        <SafeAreaView className="flex-1">
            <Stack>
                <Stack.Screen name="index" options={{ title: 'More' }} />
            </Stack>
        </SafeAreaView>
    );
};

export default MoreScreenLayout;
