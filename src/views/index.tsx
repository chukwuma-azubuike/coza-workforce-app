import * as React from 'react';
import {
    NavigationContainer,
    DefaultTheme,
    DarkTheme,
} from '@react-navigation/native';
import AppRoute from '../routes/app';
import { useColorScheme } from 'react-native';
import { THEME_CONFIG } from '../config/appConfig';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthRoute from '../routes/auth';
const RootStack = createNativeStackNavigator();

const theme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        primary: THEME_CONFIG.primary,
    },
};

interface IAppState {
    isLoggedIn: boolean;
}

const Views: React.FC<IAppState> = ({ isLoggedIn }) => {
    const scheme = useColorScheme();

    return (
        <NavigationContainer theme={scheme === 'dark' ? DarkTheme : theme}>
            <RootStack.Navigator screenOptions={{ headerShown: false }}>
                {/* <RootStack.Screen name="Auth" component={AuthRoute} /> */}
                <RootStack.Screen name="App" component={AppRoute} />
            </RootStack.Navigator>
        </NavigationContainer>
    );
};

export default Views;
