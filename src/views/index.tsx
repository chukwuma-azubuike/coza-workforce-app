import * as React from 'react';
import { AppRoutes, AuthRoutes } from '../config/navigation';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

const Views: React.FC = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator>
                {/* Auth Routing */}
                <Stack.Group>
                    {AuthRoutes.map((route, index) => (
                        <Stack.Screen
                            key={index}
                            name={route.name}
                            options={route.options}
                            component={route.component}
                        />
                    ))}
                </Stack.Group>
                {/* In App Routing */}
                <Stack.Group>
                    {AppRoutes.map((route, index) => (
                        <Stack.Screen
                            key={index}
                            name={route.name}
                            options={route.options}
                            component={route.component}
                        />
                    ))}
                </Stack.Group>
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default Views;
