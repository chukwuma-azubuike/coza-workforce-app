import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaView, StyleSheet } from 'react-native';
import { NavButton } from '~/components/NavButton';

const GHWorkforceLayout: React.FC = () => {
    return (
        <SafeAreaView style={styles.container}>
            <Stack>
                <Stack.Screen name="index" options={{ title: 'Workforce', headerLeft: () => <NavButton /> }} />
            </Stack>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default GHWorkforceLayout;
