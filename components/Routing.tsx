import * as React from 'react';
import { router, Stack } from 'expo-router';
import { View } from 'react-native';
import NotificationModal from '~/components/composite/notification-modal';

import { useAppSelector } from '~/store/hooks';
import { userSelectors } from '~/store/actions/users';
// import useMoreRoutes from '~/hooks/more-routes';
// import { usePushNotifications } from '~/hooks/push-notifications';
// import { IUser } from '~/store/types';

export { ErrorBoundary } from 'expo-router';

const Routing: React.FC = () => {
    const isLoggedIn = useAppSelector(store => userSelectors.selectCurrentUser(store));
    // const filteredRoutes = useMoreRoutes();

    React.useEffect(() => {
        if (isLoggedIn?.userId) {
            router.replace('/(tabs)');
        } else {
            router.replace('/');
        }
    }, [isLoggedIn?.userId]);

    // usePushNotifications(isLoggedIn as IUser);

    return (
        <View className="flex-1">
            <NotificationModal />
            <Stack>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="(stack)" options={{ headerShown: false }} />
                {/* <Stack.Screen name="(stack)/profile" options={{ headerShown: false }} /> */}
                {/* {filteredRoutes.map(route => (
                    <Stack.Screen key={route.href} options={{ headerShown: false }} name={route.href} />
                ))} */}
            </Stack>
        </View>
    );
};

export default Routing;
