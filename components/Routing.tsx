import * as React from 'react';
import { router, Stack, usePathname } from 'expo-router';
import { View } from 'react-native';
import { useColorScheme } from '~/lib/useColorScheme';
import { Colors } from '~/constants/Colors';
import NotificationModal from '~/components/composite/notification-modal';

import { useAppSelector } from '~/store/hooks';
import { userSelectors } from '~/store/actions/users';
import { AppRoutes, IAppRoute } from '~/config/navigation';
// import { usePushNotifications } from '~/hooks/push-notifications';
import { IUser } from '~/store/types';
import { capitalize } from 'lodash';

export { ErrorBoundary } from 'expo-router';

const flattenNestedRoutes = (routes: IAppRoute[]) => {
    const allRoutes: IAppRoute[] = [];

    routes.forEach(route => {
        allRoutes.push(route);
        if (route.submenus.length) {
            // Apply recursion for nested submenu routes.
            allRoutes.push(...flattenNestedRoutes(route.submenus));
        }
    });

    return allRoutes;
};

const Routing: React.FC = () => {
    const { isDarkColorScheme } = useColorScheme();
    const isLoggedIn = useAppSelector(store => userSelectors.selectCurrentUser(store));

    const flattenedRoutes = React.useMemo(
        () =>
            flattenNestedRoutes(
                AppRoutes.map(route => {
                    if (
                        (route.href as string).lastIndexOf('/') === (route.href as string).indexOf('/') &&
                        route.href !== '(tabs)'
                    ) {
                        return { ...route, href: `${route.href}/index` }; // Append index to apex routes
                    }
                    return route;
                })
            ),
        [AppRoutes]
    );

    const pathname = usePathname();

    const formatTitle = React.useCallback((href: string) => {
        const splitRouteArray = href.split('/');
        const formatted = splitRouteArray[splitRouteArray.length - 1].replaceAll('-', ' ');
        const capitalised = capitalize(formatted);

        return capitalised === '(tabs)' ? 'Home' : capitalised;
    }, []);

    const generalScreenOptions = React.useMemo(() => {
        return {
            headerTitle: formatTitle(pathname),
            headerBackButtonDisplayMode: 'minimal',
            headerStyle: {
                backgroundColor: isDarkColorScheme ? Colors.dark.background : Colors.light.background,
            },
        };
    }, [isDarkColorScheme, pathname]);

    React.useEffect(() => {
        if (isLoggedIn) {
            router.replace('/(tabs)');
        } else {
            router.replace('/');
        }
    }, [isLoggedIn]);

    // usePushNotifications(isLoggedIn as IUser);

    return (
        <View className="flex-1">
            <NotificationModal />
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
                    {flattenedRoutes.map(route => (
                        <Stack.Screen
                            key={route.href}
                            name={route.href}
                            options={
                                {
                                    gestureEnabled: true,
                                    title: formatTitle(route.href as string),
                                    ...(route.href.includes('(stack)') ? generalScreenOptions : { headerShown: false }),
                                } as any
                            }
                        />
                    ))}
                </Stack>
            )}
        </View>
    );
};

export default Routing;
