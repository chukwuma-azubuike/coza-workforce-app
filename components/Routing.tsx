import * as React from 'react';
import { router, Stack } from 'expo-router';
import { SafeAreaProvider, SafeAreaView as RNCSafeAreaView } from 'react-native-safe-area-context';
import { View, SafeAreaView as RNSafeAreaView, Platform } from 'react-native';
import NotificationModal from '~/components/composite/notification-modal';

import { useAppSelector } from '~/store/hooks';
import { userSelectors } from '~/store/actions/users';
import { NotificationsProvider } from './NotificationsProvider';
import inAppUpdates from '~/utils/in-app-updates';

export { ErrorBoundary } from 'expo-router';

const Routing: React.FC = () => {
    const user = useAppSelector(userSelectors.selectCurrentUser);

    React.useEffect(() => {
        if (user?.userId) {
            router.replace('/(tabs)');
        } else {
            router.replace('/');
        }

        const update = async () => {
            await inAppUpdates();
        };

        update();
    }, [user?.userId]);

    const SafeAreaView = Platform.OS === 'android' ? RNSafeAreaView : RNCSafeAreaView;

    return (
        <NotificationsProvider user={user || ({} as any)}>
            <SafeAreaProvider>
                <SafeAreaView className="flex-1">
                    <View className="flex-1">
                        <NotificationModal />
                        <Stack>
                            <Stack.Screen name="index" options={{ headerShown: false }} />
                            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                            <Stack.Screen name="(stack)" options={{ headerShown: false }} />
                            <Stack.Screen name="(tabs)" options={{ headerShown: false, gestureEnabled: false }} />
                        </Stack>
                    </View>
                </SafeAreaView>
            </SafeAreaProvider>
        </NotificationsProvider>
    );
};

export default Routing;
