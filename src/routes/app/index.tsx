import * as React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppRoutes } from '../../config/navigation';
import TabBar from '../../views/tab-bar';

const Tab = createBottomTabNavigator();
const AppStack = createNativeStackNavigator();

const TabRoutes: React.FC = () => {
    return (
        <Tab.Navigator
            tabBar={props => <TabBar {...props} />}
            screenOptions={{ headerShown: false }}
        >
            {/* In App Routing */}
            {AppRoutes.map((route, index) => (
                <Tab.Screen
                    key={index}
                    name={route.name}
                    component={route.component}
                />
            ))}
        </Tab.Navigator>
    );
};

const AppRoute: React.FC = () => (
    <AppStack.Navigator screenOptions={{ headerShown: false }}>
        <AppStack.Screen name="TabRoutes" component={TabRoutes} />
    </AppStack.Navigator>
);

export default AppRoute;
