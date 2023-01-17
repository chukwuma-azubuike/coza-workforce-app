import * as React from 'react';
import SplashScreen from 'react-native-splash-screen';
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
import NotificationModal from '../components/composite/notification-modal';
import useModal from '../hooks/modal/useModal';
import inAppUpdates, { needsLogoutList } from '../utils/in-app-updates';
import Utils from '../utils';
import { AppStateContext } from '../../App';
import { useDispatch, useSelector } from 'react-redux';
import {
    selectVersionActionTaken,
    versionActiontypes,
} from '../store/services/version';
import { IStore } from '../store';
import DeviceInfo from 'react-native-device-info';
import { Appearance } from 'react-native';
import { useColorMode } from 'native-base';

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

    const needsLogOut = needsLogoutList.includes(appVersion);

    const { modalState, setModalState } = useModal();

    const { setIsLoggedIn } = React.useContext(AppStateContext);

    const dispatch = useDispatch();

    const hasTakenLogoutAction = useSelector((store: IStore) =>
        selectVersionActionTaken(store)
    ).hasLoggedOut;

    const { toggleColorMode, setColorMode, colorMode } = useColorMode();

    React.useEffect(() => {
        setColorMode(colorScheme);

        SplashScreen.hide();

        const versionLogic = async () => {
            const response = await inAppUpdates();

            if (response.needsLogout && hasTakenLogoutAction === false) {
                // Logout
                Utils.clearCurrentUserStorage().then(res => {
                    Utils.clearStorage().then(res => {
                        setIsLoggedIn && setIsLoggedIn(false);
                        dispatch({
                            type: versionActiontypes.SET_HAS_LOGGED_OUT_TRUE,
                        });
                    });
                });
            }
            dispatch({
                type: versionActiontypes.SET_LAST_UPDATED_VERSION,
                payload: appVersion,
            });
        };

        versionLogic();
    }, []);

    return (
        <>
            <NotificationModal
                modalState={modalState}
                setModalState={setModalState}
            />
            <NavigationContainer theme={scheme === 'dark' ? DarkTheme : theme}>
                <RootStack.Navigator screenOptions={{ headerShown: false }}>
                    {isLoggedIn &&
                    (needsLogOut ? hasTakenLogoutAction : true) ? (
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
