import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaView, StyleSheet } from 'react-native';

const GHApprovalsLayout: React.FC = () => {
    return (
        <SafeAreaView style={styles.container}>
            <Stack>
                <Stack.Screen name="index" options={{ title: 'Approvals' }} />
            </Stack>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default GHApprovalsLayout;
