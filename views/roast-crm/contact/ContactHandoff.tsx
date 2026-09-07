import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Linking, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { Text } from '~/components/ui/text';
import { THEME_CONFIG } from '~/config/appConfig';
import { ContactChannel } from '~/store/types';
import { contactChannelLabel, contactUrlFor } from '~/utils/contact-links';

/**
 * The iOS widget's Call / WhatsApp / Text, arriving through the app.
 *
 * ## Why this screen exists at all
 *
 * A widget `Link` does not open the URL it names. WidgetKit hands it to the **containing
 * app**, whatever the scheme — so a `tel:` link on a widget reaches this app's URL handler
 * and dials nothing. Android has no such rule and opens the dialer from the launcher
 * without waking anything, which is why only iOS needs this hop.
 *
 * So the widget links here with the channel and the number, and this fires the real URL
 * from inside the app, where `Linking` has a window to hand it to. One frame of a spinner,
 * then the dialer.
 *
 * ## Why it replaces rather than pushes
 *
 * The worker comes back from the dialer to whatever this left behind, and a handoff screen
 * with nothing on it is a dead end. `replace` puts Today underneath before the dialer even
 * appears, so returning lands on the feed — where the reminder they just called about is
 * still waiting to be ticked off.
 *
 * The number is carried in the link rather than looked up here, matching the notification
 * tray: a cache read on a cold launch is a spinner in the one moment the worker is already
 * holding the phone to their ear.
 */
const ContactHandoff: React.FC = () => {
    const { channel, phone } = useLocalSearchParams<{ channel?: string; phone?: string }>();

    const label = contactChannelLabel(channel as ContactChannel);

    /** Set only when there is nothing to open, so the screen can say so instead of stalling. */
    const [failed, setFailed] = useState(false);

    /**
     * Params can arrive twice — a re-render, or a second delivery of the same URL — and a
     * second `openURL` on a live dialer is a second app switch the worker did not ask for.
     */
    const fired = useRef(false);

    useEffect(() => {
        if (fired.current) {
            return;
        }

        fired.current = true;

        const url = phone ? contactUrlFor(phone, channel as ContactChannel) : null;

        if (!url) {
            setFailed(true);
            return;
        }

        const run = async () => {
            try {
                await Linking.openURL(url);
            } catch {
                // WhatsApp not installed, or a number the dialer will not take. Today is
                // still the right place to land: the guest is one tap away there, with
                // every one of these channels offered again.
            }

            router.replace('/roast-crm/notifications');
        };

        run();
    }, [channel, phone]);

    return (
        <View className="flex-1 items-center justify-center gap-3 p-6">
            {!failed && <ActivityIndicator color={THEME_CONFIG.primary} />}
            <Text className="text-center text-muted-foreground">
                {failed ? 'No number on record.' : `Opening ${label}…`}
            </Text>
            {failed && (
                <Text className="text-center text-primary" onPress={() => router.replace('/roast-crm/notifications')}>
                    Back to Today
                </Text>
            )}
        </View>
    );
};

export default ContactHandoff;
