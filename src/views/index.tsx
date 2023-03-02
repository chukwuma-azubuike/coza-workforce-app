import * as React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import AppRoute from '../routes/app';
import { useColorScheme } from 'react-native';
import { THEME_CONFIG } from '../config/appConfig';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthRoute from '../routes/auth';
import NotificationModal from '../components/composite/notification-modal';
import useModal from '../hooks/modal/useModal';
import inAppUpdates from '../utils/in-app-updates';
import { versionActiontypes } from '../store/services/version';
import DeviceInfo from 'react-native-device-info';
import { Appearance } from 'react-native';
import { useColorMode } from 'native-base';
import { useAppDispatch } from '../store/hooks';

const colorScheme = Appearance.getColorScheme();
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
    const appVersion = DeviceInfo.getVersion();
    const { modalState, setModalState } = useModal();

    const dispatch = useAppDispatch();
    const { setColorMode } = useColorMode();

    React.useEffect(() => {
        setColorMode(colorScheme);

        const versionLogic = async () => {
            inAppUpdates();

            dispatch({
                type: versionActiontypes.SET_LAST_UPDATED_VERSION,
                payload: appVersion,
            });
        };

        versionLogic();
    }, []);

    return (
        <>
            <NotificationModal modalState={modalState} setModalState={setModalState} />
            <NavigationContainer theme={scheme === 'dark' ? DarkTheme : theme}>
                <RootStack.Navigator screenOptions={{ headerShown: false }}>
                    {isLoggedIn ? (
                        <RootStack.Screen name="App" component={AppRoute} />
                    ) : (
                        <RootStack.Screen name="Auth" component={AuthRoute} />
                    )}
                </RootStack.Navigator>
            </NavigationContainer>
        </>
    );
};

export default Views;
