import { useMemo } from 'react';
import { useGetMyGuestsQuery } from '~/store/services/roast-crm';

export interface IGuestName {
    firstName: string;
    lastName: string;
    /** `"Ada Obi"`, or just `"Ada"` when there is no surname on record. */
    fullName: string;
    /**
     * For the Today feed's one-tap Call.
     *
     * A task carries a `guestId` and a composed sentence, never a number — so the same
     * cache read that resolves the name has to resolve this too, or the primary action on
     * a `CALL_DUE` row degrades into "open the profile and look".
     */
    phoneNumber?: string;
}

/**
 * `guestId → name`, resolved from the guests the signed-in worker already has cached.
 *
 * **Why this exists.** The reminders API returns raw documents with no guest populated —
 * `IRoastReminder` carries a `guestId` and nothing else. Every surface that shows a
 * reminder needs a name for it: the row, the edit sheet, and most importantly the local
 * notification body, which is composed on-device and lands on a lock screen with the app
 * closed. A missing name there renders as `undefined` in front of the user.
 *
 * Reads the worker's own guest list, which every Roast screen has already loaded and
 * which `roastCrmApi` holds for 48 hours — so this is a cache read, not a fetch, in every
 * practical case.
 *
 * A guest that is genuinely absent (reassigned away, deleted) resolves to `undefined` and
 * callers fall back to a neutral label rather than rendering an empty string.
 */
const useGuestNameIndex = (): Record<string, IGuestName> => {
    const { data: guests } = useGetMyGuestsQuery();

    return useMemo(() => {
        if (!guests) {
            return {};
        }

        return Object.fromEntries(
            guests.map(guest => {
                const firstName = guest.firstName ?? '';
                const lastName = guest.lastName ?? '';

                return [
                    guest._id,
                    {
                        firstName,
                        lastName,
                        fullName: [firstName, lastName].filter(Boolean).join(' '),
                        phoneNumber: guest.phoneNumber,
                    },
                ];
            })
        );
    }, [guests]);
};

export default useGuestNameIndex;
