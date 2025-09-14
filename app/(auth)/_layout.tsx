import React from 'react';
import { Stack } from 'expo-router';

const AuthScreens: React.FC = () => {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="register" options={{ headerShown: false }} />
            <Stack.Screen name="verify-email" options={{ headerShown: false }} />
            <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
            <Stack.Screen name="forgot-password-otp" options={{ headerShown: false }} />
            <Stack.Screen name="set-new-password" options={{ headerShown: false }} />
        </Stack>
    );
};

export default AuthScreens;
