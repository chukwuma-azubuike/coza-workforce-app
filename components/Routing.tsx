import * as React from 'react';
import { router, Stack } from 'expo-router';
import { View } from 'react-native';
import NotificationModal from '~/components/composite/notification-modal';

import { useAppSelector } from '~/store/hooks';
import { userSelectors } from '~/store/actions/users';
import { NotificationsProvider } from './NotificationsProvider';
import inAppUpdates from '~/utils/in-app-updates';
import { appSelectors } from '~/store/actions/app';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export { ErrorBoundary } from 'expo-router';

const Routing: React.FC = () => {
    const user = useAppSelector(store => userSelectors.selectCurrentUser(store));
    const mode = useAppSelector(store => appSelectors.selectMode(store));

    const routeToMode = () => {
        if (mode === 'crm') {
            router.replace('/roast-crm/my-guests');
        } else {
            router.replace('/(tabs)');
        }
    };

    React.useEffect(() => {
        if (user?.userId) {
            routeToMode();
        } else {
            router.replace('/');
        }

        const update = async () => {
            await inAppUpdates();
        };

        update();
    }, [user?.userId, mode]);

    return (
        <NotificationsProvider user={user || ({} as any)}>
            <SafeAreaProvider>
                <SafeAreaView className="flex-1 bg-background">
                    <View className="flex-1">
                        <NotificationModal />
                        <Stack>
                            <Stack.Screen name="index" options={{ headerShown: false }} />
                            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                            <Stack.Screen name="(stack)" options={{ headerShown: false }} />
                            <Stack.Screen name="(tabs)" options={{ headerShown: false, gestureEnabled: false }} />
                            <Stack.Screen
                                name="roast-crm/(tabs)"
                                options={{ headerShown: false, gestureEnabled: false }}
                            />
                            <Stack.Screen name="roast-crm/(stack)" options={{ headerShown: false }} />
                        </Stack>
                    </View>
                </SafeAreaView>
            </SafeAreaProvider>
        </NotificationsProvider>
    );
};

export default Routing;
