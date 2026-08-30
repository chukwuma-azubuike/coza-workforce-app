import { Linking } from 'react-native';
import { ContactChannel, Guest } from '~/store/types';
import type { Dispatch } from '@reduxjs/toolkit';
import { roastCRMActions } from '~/store/actions/roast-crm';

/**
 * The URL for reaching a number on a given channel.
 *
 * WhatsApp is the one that needs work: `wa.me` accepts digits only, so a number stored the
 * way people actually type them — `+234 801 234 5678` — has to be stripped before it will
 * resolve. `tel:` and `sms:` are happy with the raw string on both platforms.
 *
 * `VISIT` has no URL; there is nothing on the device to open for it.
 */
export const contactUrlFor = (phoneNumber: string, type: ContactChannel): string | null => {
    switch (type) {
        case ContactChannel.CALL:
            return `tel:${phoneNumber}`;
        case ContactChannel.SMS:
            return `sms:${phoneNumber}`;
        case ContactChannel.WHATSAPP:
            return `https://wa.me/${phoneNumber.replace(/\D/g, '')}`;
        default:
            return null;
    }
};

// Unlike openPhoneAndPersist below, contacting a worker isn't a guest-assimilation event, so
// there's nothing to persist to the guest-contact timeline - this just opens the dialer/WhatsApp.
export const openPhoneNumber = (phoneNumber: string | undefined | null, type: ContactChannel) => async () => {
    if (!phoneNumber) return;

    const url = contactUrlFor(phoneNumber, type);
    if (!url) return;

    const can = await Linking.canOpenURL(url);
    if (!can) return;

    await Linking.openURL(url);
};

export const openPhoneAndPersist =
    (guest: Guest, type: ContactChannel, dispatch: Dispatch) =>
    async (): Promise<{ id: string; startedAt: string }> => {
        // create record and persist immediately
        const id = guest._id;
        const startedAt = new Date().toISOString();

        // open dialer
        const url = type === ContactChannel.CALL ? `tel:${guest.phoneNumber}` : `https://wa.me/${guest.phoneNumber}`;
        const can = await Linking.canOpenURL(url);

        if (!can) {
            // If device can't open, remove record immediately:
            // (or leave it and handle on startup — design choice)
            throw new Error('Device cannot open tel: URL');
        }

        const opened = await Linking.openURL(url);

        if (opened) {
            dispatch(
                roastCRMActions.pushOutgoingCall({
                    id,
                    type,
                    guest,
                    startedAt,
                })
            );
        }

        return { id, startedAt };
    };
