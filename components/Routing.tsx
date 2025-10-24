import * as React from 'react';
import { router, Stack } from 'expo-router';
import { View } from 'react-native';
import NotificationModal from '~/components/composite/notification-modal';

import { useAppSelector } from '~/store/hooks';
import { userSelectors } from '~/store/actions/users';
import { NotificationsProvider } from './NotificationsProvider';
import inAppUpdates from '~/utils/in-app-updates';
import { useAuth } from '~/hooks/auth';

export { ErrorBoundary } from 'expo-router';

const Routing: React.FC = () => {
    const user = useAppSelector(userSelectors.selectCurrentUser);
    const { logOut } = useAuth();

    React.useEffect(() => {
        const run = async () => {
            if (user?.userId) {
                router.replace('/(tabs)');
            } else {
                await logOut();
            }
        };

        const update = async () => {
            await inAppUpdates();
        };

        run();
        update();
    }, [user?.userId]);

    return (
        <NotificationsProvider user={user || ({} as any)}>
            <View className="flex-1">
                <NotificationModal />
                <Stack>
                    <Stack.Screen name="index" options={{ headerShown: false }} />
                    <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                    <Stack.Screen name="(stack)" options={{ headerShown: false }} />
                    <Stack.Screen name="(tabs)" options={{ headerShown: false, gestureEnabled: false }} />
                </Stack>
            </View>
        </NotificationsProvider>
    );
};

export default Routing;
