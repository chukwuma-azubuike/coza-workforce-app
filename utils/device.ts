import { Platform } from 'react-native';
import * as Application from 'expo-application';

/**
 * Stable-ish per-install device identifier, used as the upsert key for the push
 * device row alongside `userId`, and as the fallback delete key at logout.
 *
 * Returns `null` rather than throwing or lying with a cast: `getIosIdForVendorAsync`
 * genuinely resolves to `null` early in the app lifecycle on iOS (notably on first
 * launch after install, before the vendor id is assigned), and callers must be able
 * to fall back to the push token instead of losing the call entirely.
 *
 * ⚠️ Stability differs by platform. Android's is stable until factory reset and is
 * scoped per signing key; iOS's resets when the last app from the vendor is
 * uninstalled, so a reinstall yields both a new `deviceId` and a new push token. The
 * backend prunes the orphaned row on the first `DeviceNotRegistered` receipt, so the
 * tail of inactive rows is harmless — do not try to defeat it client-side.
 */
export const getDeviceId = async (): Promise<string | null> => {
    try {
        if (Platform.OS === 'android') {
            return Application.getAndroidId() || null;
        }

        return (await Application.getIosIdForVendorAsync()) || null;
    } catch (error) {
        return null;
    }
};
