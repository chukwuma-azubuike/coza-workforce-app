import * as React from 'react';

import store, { persistor } from '~/store';
import { DarkTheme, DefaultTheme, Theme, ThemeProvider } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { NAV_THEME } from '~/lib/constants';
import { useColorScheme } from '~/lib/useColorScheme';
import { PortalHost } from '@rn-primitives/portal';
import ConnectionStatusBar from '~/components/atoms/status-bar';
import { setAndroidNavigationBar } from '~/lib/android-navigation-bar';
import * as Notifications from 'expo-notifications';

import '~/global.css';
import Routing from '~/components/Routing';
import { PersistGate } from 'redux-persist/integration/react';
import Loading from '~/components/atoms/loading';
import useNotificationObserver from '~/hooks/push-notifications/useNotificationObserver';
import ErrorBoundary from '~/components/composite/error-boundary';
import useExpoUpdate from '~/hooks/expo-update';
import removeBadPersistIfAny from '~/utils/removeBadPersistIfAny';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const LIGHT_THEME: Theme = {
    ...DefaultTheme,
    colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
    ...DarkTheme,
    colors: NAV_THEME.dark,
};

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        priority: Notifications.AndroidNotificationPriority.MAX,
    }),
});

export {
    // Catch any errors thrown by the Layout component.
    ErrorBoundary,
} from 'expo-router';

export default function RootLayout() {
    const hasMounted = React.useRef(false);
    const { colorScheme, isDarkColorScheme } = useColorScheme();
    const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);

    useIsomorphicLayoutEffect(() => {
        (async () => {
            await removeBadPersistIfAny();
        })();

        if (hasMounted.current) {
            return;
        }

        if (Platform.OS === 'web') {
            // Adds the background color to the html element to prevent white background on overscroll.
            document.documentElement.classList.add('bg-background');
        }

        setAndroidNavigationBar(colorScheme);
        setIsColorSchemeLoaded(true);
        hasMounted.current = true;
    }, []);

    useNotificationObserver();
    useExpoUpdate();

    if (!isColorSchemeLoaded) {
        return null;
    }

    return (
        <SafeAreaProvider className="!bg-background">
            <SafeAreaView
                edges={['right', 'left', Platform.OS === 'android' ? 'bottom' : 'top']}
                className="flex-1 !bg-background"
            >
                <ErrorBoundary>
                    <Provider store={store}>
                        <PersistGate loading={<Loading bootUp />} persistor={persistor}>
                            <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
                                <StatusBar style={isDarkColorScheme ? 'light' : 'dark'} />
                                <ConnectionStatusBar />
                                <ErrorBoundary>
                                    <Routing />
                                </ErrorBoundary>
                                <PortalHost />
                            </ThemeProvider>
                        </PersistGate>
                    </Provider>
                </ErrorBoundary>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

const useIsomorphicLayoutEffect =
    Platform.OS === 'web' && typeof window === 'undefined' ? React.useEffect : React.useLayoutEffect;
