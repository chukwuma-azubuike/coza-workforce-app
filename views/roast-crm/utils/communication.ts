import { Linking } from 'react-native';
import { ContactChannel, Guest } from '~/store/types';
import { contactUrlFor } from '~/utils/contact-links';
import type { Dispatch } from '@reduxjs/toolkit';
import { roastCRMActions } from '~/store/actions/roast-crm';

/**
 * Re-exported so every existing call site keeps its import.
 *
 * The function itself moved to `~/utils/contact-links` when the home-screen widget started
 * calling it: this module also imports `roastCRMActions`, and the widget's headless task
 * cannot afford to pull the store's action graph in behind one string builder.
 */
export { contactUrlFor } from '~/utils/contact-links';

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
