import * as React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppRoutes, IAppRoute } from '@config/navigation';
import TabBar from '@views/tab-bar';
import useAppColorMode from '@hooks/theme/colorMode';
import { Route, useNavigation } from '@react-navigation/native';
import { NavigationBackButton } from '@components/atoms/button';

const Tab = createBottomTabNavigator();
const AppStack = createNativeStackNavigator();

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

const TabRoutes: React.FC = () => {
    const { isDarkMode } = useAppColorMode();
    const { goBack, navigate } = useNavigation();

    const handleGoBack = () => {
        goBack();
    };

    const hiddenHeaders = ['Home', 'CGWC Details'];

    // TODO: Restore when IOS notification is fixed
    // const { initialRoute, tabKey } = useDeepLinkNavigation();

    // React.useEffect(() => {
    //     if (!!initialRoute) {
    //         navigate(initialRoute as unknown as never, { tabKey } as any);
    //     }
    // }, [initialRoute, tabKey]);

    return (
        <Tab.Navigator
            tabBar={props => <TabBar {...props} />}
            screenOptions={{
                headerTitleAlign: 'center',
                headerStyle: {},
            }}
            backBehavior="history"
        >
            {/* In App Routing */}
            {flattenNestedRoutes(AppRoutes).map((route, index) => (
                <Tab.Screen
                    key={index}
                    name={route.name}
                    component={route.component}
                    options={{
                        headerShown: !hiddenHeaders.includes(route.name),
                        headerBackgroundContainerStyle: {
                            justifyContent: 'center',
                            alignContent: 'center',
                        },
                        headerLeft: () => <NavigationBackButton onPress={handleGoBack} />,
                    }}
                />
            ))}
        </Tab.Navigator>
    );
};

const AppRoute: React.FC = () => (
    <AppStack.Navigator screenOptions={{ headerShown: false }}>
        <AppStack.Screen
            name="TabRoutes"
            component={TabRoutes}
            options={({ route }: { route: Route<string, any> }) => ({ title: route?.params?.headerTitle })}
        />
    </AppStack.Navigator>
);

export default AppRoute;
