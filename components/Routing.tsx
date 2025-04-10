import * as React from 'react';
import { router, Stack } from 'expo-router';
import { SafeAreaView, View } from 'react-native';
import { useColorScheme } from '~/lib/useColorScheme';
import { Colors } from '~/constants/Colors';

import * as Haptics from 'expo-haptics';
import { useAppSelector } from '~/store/hooks';
import { userSelectors } from '~/store/actions/users';
import { NavButton } from './NavButton';

export { ErrorBoundary } from 'expo-router';

const Routing: React.FC = () => {
    const { isDarkColorScheme } = useColorScheme();
    const isLoggedIn = useAppSelector(store => userSelectors.selectCurrentUser(store));

    const handleGoBack = () => {
        if (router.canGoBack()) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

            router.back();
        }
    };

    const generalScreenOptions = {
        headerTitle: '',
        headerStyle: {
            backgroundColor: isDarkColorScheme ? Colors.dark.background : Colors.light.background,
        },
        header: () => (
            <SafeAreaView className="mx-6">
                <NavButton onBack={handleGoBack} />
            </SafeAreaView>
        ),
    };

    React.useEffect(() => {
        if (isLoggedIn) {
            router.replace('/(tabs)');
        } else {
            router.replace('/');
        }
    }, [isLoggedIn]);

    return (
        <View className="flex-1">
            {/* Unauthenticated Screens */}
            {!isLoggedIn ? (
                <Stack>
                    <Stack.Screen name="index" options={{ headerShown: false }} />
                    <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
                    <Stack.Screen name="(auth)/register" options={{ headerShown: false }} />
                    <Stack.Screen name="(auth)/verify-email" options={{ headerShown: false }} />
                    <Stack.Screen name="(auth)/forgot-password" options={{ headerShown: false }} />
                    <Stack.Screen name="(auth)/forgot-password-otp" options={{ headerShown: false }} />
                    <Stack.Screen name="(auth)/set-new-password" options={{ headerShown: false }} />
                </Stack>
            ) : (
                <Stack>
                    {/* Authenticated Screens */}
                    <Stack.Screen name="(tabs)" options={{ headerShown: false, gestureEnabled: false }} />
                    <Stack.Screen name="(tabs)/attendance" options={{ headerShown: false }} />

                    <Stack.Screen name="(stack)/profile" options={{ headerShown: false }} />
                </Stack>
            )}
        </View>
    );
};

export default Routing;
