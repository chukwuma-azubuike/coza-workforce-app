import { registerRootComponent } from 'expo';
import { ExpoRoot } from 'expo-router';
import { registerWidgetTaskHandler } from 'react-native-android-widget';

import widgetTaskHandler from './widgets/widget-task-handler';

// https://docs.expo.dev/router/reference/troubleshooting/#expo_router_app_root-not-defined

// Must be exported or Fast Refresh won't update the context
export function App() {
    const ctx = require.context('./app');
    return <ExpoRoot context={ctx} />;
}

registerRootComponent(App);

/**
 * The Android widget's headless entry point.
 *
 * Registered here, beside the root component, and deliberately **not** inside a screen or
 * a provider: Android starts this task with no UI mounted and often with the app not
 * running at all. Anything registered further down the tree simply would not exist by the
 * time the widget is tapped.
 *
 * A no-op on iOS — the library's JS side registers a headless task the platform never
 * calls there.
 */
registerWidgetTaskHandler(widgetTaskHandler);
