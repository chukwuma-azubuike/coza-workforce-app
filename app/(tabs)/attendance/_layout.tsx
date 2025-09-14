import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native';
import { StyleSheet } from 'react-native';

const AttendanceScreensLayout: React.FC = () => {
    return (
        <SafeAreaView style={styles.container}>
            <Stack>
                <Stack.Screen name="index" options={{ title: 'Attendance' }} />
            </Stack>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default AttendanceScreensLayout;
