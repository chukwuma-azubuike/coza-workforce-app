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
    const isLoggedIn = !!useAppSelector(store => userSelectors.selectCurrentUser(store));

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

    return (
        <View className="flex-1">
            {/* Unauthenticated Screens */}
            {!isLoggedIn ? (
                <Stack>
                    {/* <Stack.Screen name="index" options={{ headerShown: false }} /> */}
                    <Stack.Screen name="(auth)/signin" options={{ headerShown: false }} />
                    <Stack.Screen name="(auth)/signup" options={{ headerShown: false }} />
                    <Stack.Screen name="(auth)/verify" options={{ headerShown: false }} />
                    <Stack.Screen name="(auth)/forgot-password" options={{ headerShown: false }} />
                    <Stack.Screen name="(auth)/forgot-password-otp" options={{ headerShown: false }} />
                    <Stack.Screen name="(auth)/set-new-password" options={{ headerShown: false }} />
                </Stack>
            ) : (
                <Stack>
                    {/* Authenticated Screens */}
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen name="(stack)/pay-bills" options={generalScreenOptions} />
                    <Stack.Screen name="(stack)/electricity" options={generalScreenOptions} />
                    <Stack.Screen name="(stack)/internet" options={generalScreenOptions} />
                    <Stack.Screen name="(stack)/more-payments" options={generalScreenOptions} />
                    <Stack.Screen name="(stack)/transactions" options={generalScreenOptions} />
                    <Stack.Screen name="(stack)/send-money" options={generalScreenOptions} />
                    <Stack.Screen name="(stack)/kyc" options={{ ...generalScreenOptions, headerShown: false }} />
                    <Stack.Screen name="(stack)/successful" options={{ ...generalScreenOptions, headerShown: false }} />
                </Stack>
            )}
        </View>
    );
};

export default Routing;
