import { Linking } from 'react-native';
import { ContactChannel, Guest } from '~/store/types';
import type { Dispatch } from '@reduxjs/toolkit';
import { roastCRMActions } from '~/store/actions/roast-crm';
export const openPhoneAndPersist =
    (guest: Guest, type: ContactChannel, dispatch: Dispatch) =>
    async (): Promise<{ id: string; startedAt: string }> => {
        // create record and persist immediately
        const id = guest._id;
        const startedAt = new Date().toISOString();

        dispatch(
            roastCRMActions.pushOutgoingCall({
                id,
                type,
                guest,
                startedAt,
            })
        );

        // open dialer
        const url = type === ContactChannel.CALL ? `tel:${guest.phoneNumber}` : `https://wa.me/${guest.phoneNumber}`;
        const can = await Linking.canOpenURL(url);

        if (!can) {
            // If device can't open, remove record immediately:
            // (or leave it and handle on startup — design choice)
            throw new Error('Device cannot open tel: URL');
        }

        await Linking.openURL(url);
        return { id, startedAt };
    };
