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
import useNotificationObserver from '~/hooks/push-notifications/useNotificationObserver';

export { ErrorBoundary } from 'expo-router';

const Routing: React.FC = () => {
    const { logOut } = useAuth();
    const user = useAppSelector(userSelectors.selectCurrentUser);
    const mode = useAppSelector(appSelectors.selectMode);

    const routeToMode = () => {
        if (mode === 'crm') {
            // Today, not My Guests. Roast's question is "what do I do now", and the Task
            // Feed is the only screen that answers it — My Guests answers "who do I have",
            // which is a thing you go looking for rather than a thing you land on.
            router.replace('/roast-crm/notifications');
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

    // Declared after the effect above on purpose. Both run in the same commit when a
    // session appears, and effects fire in declaration order — so `routeToMode`'s
    // `replace` has already been dispatched by the time a queued notification target is
    // pushed on top of it. Reverse them and the replace wipes out the destination the
    // user actually tapped.
    useNotificationObserver();

    return (
        <NotificationsProvider user={user || ({} as any)}>
            <View className={cn('flex-1', Platform.OS === 'android' ? 'pt-3' : 'pt-2')}>
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
