import * as React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthRoutes } from '@config/navigation';
const AuthStack = createNativeStackNavigator();

const AuthRoute: React.FC = () => {
    return (
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
            {/* Auth Routes */}
            <AuthStack.Group>
                {AuthRoutes.map((route, index) => (
                    <AuthStack.Screen
                        key={index}
                        name={route.name}
                        options={route.options}
                        component={route.component}
                    />
                ))}
            </AuthStack.Group>
        </AuthStack.Navigator>
    );
};

export default AuthRoute;
