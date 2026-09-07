import { Linking, Share } from 'react-native';
import * as Haptics from 'expo-haptics';
import * as WebBrowser from 'expo-web-browser';

import { normalizeUrl } from './utils';

/**
 * Leaves the app for the link's own handler — the native Instagram/YouTube app
 * when it's installed, otherwise the system browser. `Linking.openURL` is what
 * hands the URL to the OS; `expo-web-browser` is only a last resort for the
 * rare case where no handler claims it (some Android OEM builds).
 */
export const openLinkExternally = async (url?: string): Promise<boolean> => {
    const href = normalizeUrl(url);
    if (!href) return false;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => null);

    try {
        await Linking.openURL(href);
        return true;
    } catch {
        try {
            await WebBrowser.openBrowserAsync(href);
            return true;
        } catch {
            return false;
        }
    }
};

export const shareLink = async (url?: string, title?: string): Promise<void> => {
    const href = normalizeUrl(url);
    if (!href) return;

    try {
        await Share.share({ url: href, message: title ? `${title}\n${href}` : href }, { subject: title });
    } catch {
        // User dismissed the share sheet — nothing to recover from.
    }
};
