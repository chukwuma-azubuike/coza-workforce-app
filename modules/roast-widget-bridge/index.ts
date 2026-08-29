import { Platform } from 'react-native';
import { requireOptionalNativeModule } from 'expo-modules-core';

/**
 * The app's only way to hand data to the iOS widget.
 *
 * A WidgetKit extension is a separate process with its own sandbox. The one thing both it
 * and the app can touch is an **App Group container**, so the snapshot goes into that
 * group's `UserDefaults` and the extension reads it back. There is no other channel: no
 * shared Redux, no AsyncStorage, no network from the widget.
 *
 * `requireOptionalNativeModule` rather than `requireNativeModule` on purpose. This module
 * only exists in a binary built after the widget target was added, and Android has no
 * counterpart at all — so every call site has to tolerate its absence rather than crash a
 * dev client that predates the native work.
 */
interface RoastWidgetBridgeModule {
    /**
     * Writes `json` into the App Group and asks WidgetKit to reload.
     *
     * Returns false when the App Group is not accessible — nearly always a provisioning
     * problem (the entitlement missing from the app, the extension, or both) rather than
     * anything the JS did wrong.
     */
    setSnapshot(appGroup: string, key: string, json: string): boolean;

    /** Reload without rewriting. Used at sign-out, where the write already happened. */
    reloadWidgets(): void;
}

const nativeModule = requireOptionalNativeModule<RoastWidgetBridgeModule>('RoastWidgetBridge');

/** True when this binary can actually reach the iOS widget. */
export const isWidgetBridgeAvailable = Platform.OS === 'ios' && !!nativeModule;

export const setWidgetSnapshot = (appGroup: string, key: string, json: string): boolean => {
    if (!nativeModule) {
        return false;
    }

    try {
        return nativeModule.setSnapshot(appGroup, key, json);
    } catch {
        // A widget that misses one update renders its previous frame, which is the correct
        // degradation. A throw here would take out sign-out, which is not.
        return false;
    }
};

export const reloadWidgets = (): void => {
    try {
        nativeModule?.reloadWidgets();
    } catch {
        // As above.
    }
};

export default nativeModule;
