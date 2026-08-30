import { ContactChannel } from '~/store/types';

/**
 * The URL for reaching a number on a given channel.
 *
 * WhatsApp is the one that needs work: `wa.me` accepts digits only, so a number stored the
 * way people actually type them — `+234 801 234 5678` — has to be stripped before it will
 * resolve. `tel:` and `sms:` are happy with the raw string on both platforms.
 *
 * `VISIT` has no URL; there is nothing on the device to open for it.
 *
 * ## Why this is a leaf module rather than part of `views/roast-crm/utils/communication`
 *
 * It is where it started, and `communication.ts` still re-exports it so no call site had
 * to move. But that file also imports `roastCRMActions`, which drags the store's action
 * graph in behind it — and this function is now called from the **Android widget**, whose
 * headless task renders `widgets/RoastWidget.tsx` in a context Android gives a few seconds
 * to live. Pure string arithmetic with one enum import is what belongs on that path.
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

/** The three channels a row can offer, in the order they are rendered. Mirrored on iOS. */
export const WIDGET_CONTACT_CHANNELS = [ContactChannel.CALL, ContactChannel.WHATSAPP, ContactChannel.SMS] as const;

/** The word a screen reader says, and the one the handoff screen shows while it waits. */
export const contactChannelLabel = (type: ContactChannel): string => {
    switch (type) {
        case ContactChannel.CALL:
            return 'Call';
        case ContactChannel.SMS:
            return 'Text';
        case ContactChannel.WHATSAPP:
            return 'WhatsApp';
        default:
            return 'Contact';
    }
};
