import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native';
import ScreenHeader from '~/components/ScreenHeader';
import { StyleSheet } from 'react-native';

const AttendanceScreensLayout: React.FC = () => {
    return (
        <SafeAreaView style={styles.container}>
            <Stack
                screenOptions={{
                    headerBackButtonDisplayMode: 'minimal',
                    header: props => <ScreenHeader name={props.route.name} />,
                }}
            >
                <Stack.Screen name="index" />
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
