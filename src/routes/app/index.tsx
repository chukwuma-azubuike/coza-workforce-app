import * as React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppRoutes, IAppRoute } from '@config/navigation';
import TabBar from '@views/tab-bar';
import { IconButton } from 'native-base';
import { Icon } from '@rneui/themed';
import useAppColorMode from '@hooks/theme/colorMode';
import { THEME_CONFIG } from '@config/appConfig';
import { Route, useNavigation } from '@react-navigation/native';

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
                headerStyle: { height: 90 },
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
                        headerLeft: () => (
                            <IconButton
                                ml={3}
                                fontSize="md"
                                _light={{
                                    _pressed: { backgroundColor: 'gray.200' },
                                }}
                                _dark={{
                                    _pressed: { backgroundColor: 'gray.800' },
                                }}
                                p={1}
                                onPress={handleGoBack}
                                icon={
                                    <Icon
                                        size={24}
                                        name="keyboard-backspace"
                                        type="material-community"
                                        color={isDarkMode ? THEME_CONFIG.lightGray : 'black'}
                                    />
                                }
                            />
                        ),
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
