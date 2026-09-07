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
import { useFonts } from 'expo-font';

import '~/global.css';
import Routing from '~/components/Routing';
import { PersistGate } from 'redux-persist/integration/react';
import ErrorBoundary from '~/components/composite/error-boundary';
import { parseNotificationData } from '~/utils/notification-routing';
import { getNotificationBehaviour } from '~/utils/notification-presentation';
import useExpoUpdate from '~/hooks/expo-update';
import removeBadPersistIfAny from '~/utils/removeBadPersistIfAny';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import BootScreen from '~/components/atoms/loading/boot-screen';

const LIGHT_THEME: Theme = {
    ...DefaultTheme,
    colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
    ...DarkTheme,
    colors: NAV_THEME.dark,
};

/**
 * Registered at module scope, before any component mounts: a notification can arrive
 * during the very first frame, and a handler installed inside an effect would miss it.
 */
Notifications.setNotificationHandler({
    handleNotification: async notification => getNotificationBehaviour(parseNotificationData(notification).priority),
});

export {
    // Catch any errors thrown by the Layout component.
    ErrorBoundary,
} from 'expo-router';

export default function RootLayout() {
    const hasMounted = React.useRef(false);
    const { colorScheme, isDarkColorScheme } = useColorScheme();
    const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);

    const [loaded, error] = useFonts({
        Angelos: require('../assets/fonts/Angelos.ttf'),
    });

    useIsomorphicLayoutEffect(() => {
        (async () => {
            await removeBadPersistIfAny();
        })();

        if (hasMounted.current && !loaded) {
            return;
        }

        if (Platform.OS === 'web') {
            // Adds the background color to the html element to prevent white background on overscroll.
            // document.documentElement.classList.add('bg-background');
        }

        setAndroidNavigationBar(colorScheme);
        setIsColorSchemeLoaded(true);
        hasMounted.current = true;
    }, []);

    // `useNotificationObserver` used to run here. It now lives inside `Routing`, which is
    // the first component under the Redux `Provider` — it has to read the signed-in user
    // to know whether a cold-start target may be navigated to yet.
    useExpoUpdate();

    if (!isColorSchemeLoaded || (!loaded && !error)) {
        return <BootScreen isDark={true} />;
    }

    return (
        <SafeAreaProvider className="!bg-background">
            <SafeAreaView
                edges={['right', 'left', Platform.OS == 'android' ? 'bottom' : 'top']}
                className="flex-1 !bg-background"
            >
                <ErrorBoundary>
                    <Provider store={store}>
                        <PersistGate loading={<BootScreen animated={false} isDark={true} />} persistor={persistor}>
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
    // Platform.OS === 'web' && typeof window === 'undefined' ? React.useEffect :
    React.useLayoutEffect;
