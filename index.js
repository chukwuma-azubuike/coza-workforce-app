import { registerRootComponent } from 'expo';
import { ExpoRoot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

// https://docs.expo.dev/router/reference/troubleshooting/#expo_router_app_root-not-defined

// Must be exported or Fast Refresh won't update the context
export function App() {
    const ctx = require.context('./app');

    const [ready, setReady] = useState(false);

    useEffect(() => {
        async function prepare() {
            // e.g., load fonts, restore state, etc.
            await doMySetupWork();
            setReady(true);
            await SplashScreen.hideAsync();
        }
        prepare();
    }, []);

    if (!ready) {
        return null; // nothing rendered until ready
    }

    return <ExpoRoot context={ctx} />;
}

registerRootComponent(App);
