import * as React from 'react';
import { router, Stack } from 'expo-router';
import { View } from 'react-native';
import NotificationModal from '~/components/composite/notification-modal';

import { useAppSelector } from '~/store/hooks';
import { userSelectors } from '~/store/actions/users';
import { NotificationsProvider } from './NotificationsProvider';
import inAppUpdates from '~/utils/in-app-updates';
import { useAuth } from '~/hooks/auth';
import { cn } from '~/lib/utils';
import { Platform } from 'react-native';
import { appSelectors } from '~/store/actions/app';

export { ErrorBoundary } from 'expo-router';

const Routing: React.FC = () => {
    const { logOut } = useAuth();
    const user = useAppSelector(userSelectors.selectCurrentUser);
    const mode = useAppSelector(appSelectors.selectMode);

    const routeToMode = () => {
        if (mode === 'crm') {
            router.replace('/roast-crm/my-guests');
        } else {
            router.replace('/(tabs)');
        }
    };

    React.useEffect(() => {
        const run = async () => {
            if (user?.userId) {
                routeToMode();
            } else {
                await logOut();
            }
        };

        const update = async () => {
            await inAppUpdates();
        };

        run();
        update();
    }, [user?.userId, mode]);

    return (
        <NotificationsProvider user={user || ({} as any)}>
            <View className={cn('flex-1', Platform.OS === 'android' && 'pt-6')}>
                <NotificationModal />
                <Stack>
                    <Stack.Screen name="index" options={{ headerShown: false }} />
                    <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                    <Stack.Screen name="(stack)" options={{ headerShown: false }} />
                    <Stack.Screen name="(tabs)" options={{ headerShown: false, gestureEnabled: false }} />
                    <Stack.Screen name="roast-crm" options={{ headerShown: false, gestureEnabled: false }} />
                </Stack>
            </View>
        </NotificationsProvider>
    );
};

export default Routing;
