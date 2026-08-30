import { useEffect, useMemo } from 'react';
import { useAppSelector } from '~/store/hooks';
import { userSelectors } from '~/store/actions/users';
import { roastEngagementSelectors } from '~/store/actions/roast-engagement';
import { useGetNotificationPreferencesQuery } from '~/store/services/roast-engagement';
import { buildWidgetSnapshot, writeWidgetSnapshot } from '~/utils/widget-bridge';
import useGuestNameIndex from '~/views/roast-crm/hooks/use-guest-name-index';

/**
 * Keeps the home-screen widget's snapshot current.
 *
 * A widget is not a screen. It has no network, no session and no Redux, and the OS rations
 * how often it may wake at all — so it can only render a file the app left behind. This
 * hook is the app leaving it: every time the cached feed, the streak or the privacy
 * preference changes, the whole snapshot is rebuilt and written.
 *
 * **Driven off `cachedFeed` rather than the live query** on purpose. The cache is what
 * survives a cold start and an offline morning, and the widget's whole job is to be right
 * at 7am before anybody has opened anything. Writing from the query would leave the widget
 * blank in exactly the conditions it exists for.
 *
 * Mounted once, from `useRoastEngagement`. It must stay the only writer besides the logout
 * teardown, so that clearing guest names off a shared handset has exactly one thing to
 * undo.
 */
const useWidgetSnapshot = () => {
    const user = useAppSelector(userSelectors.selectCurrentUser);
    const isSignedIn = !!(user?.userId ?? user?._id);

    const cachedFeed = useAppSelector(roastEngagementSelectors.selectCachedFeed);
    const streak = useAppSelector(roastEngagementSelectors.selectStreak);

    // Already in the cache whenever the settings screen has been opened; the widget simply
    // renders un-redacted until it is known, which matches the server-side default.
    const { data: prefs } = useGetNotificationPreferencesQuery(undefined, { skip: !isSignedIn });

    /**
     * `guestId → number`, for the row's Call / WhatsApp / Text.
     *
     * A cache read in every practical case — every Roast screen has already loaded the
     * worker's guests — but it does **resolve after the feed does** on a cold start, which
     * is why it belongs in the dependency list below rather than being read once. The
     * first write of the morning carries no numbers and the strip is simply absent; the
     * write that follows a few hundred milliseconds later carries them and the strip
     * appears. The same late resolution that the notification scheduler's `contentKey`
     * exists to survive.
     */
    const guests = useGuestNameIndex();

    const guestPhoneNumbers = useMemo(
        () => Object.fromEntries(Object.entries(guests).map(([id, guest]) => [id, guest.phoneNumber])),
        [guests]
    );

    useEffect(() => {
        // Sign-out is handled by the teardown in `hooks/auth`, which writes the signed-out
        // snapshot. Writing one here too would race it.
        if (!isSignedIn || !cachedFeed) {
            return;
        }

        writeWidgetSnapshot(
            buildWidgetSnapshot({
                tasks: cachedFeed.tasks,
                counts: cachedFeed.counts,
                streak,
                isSignedIn: true,
                guestPhoneNumbers,
                hideGuestNames: !!prefs?.hideGuestNames,
                generatedAt: cachedFeed.generatedAt,
            })
        );
    }, [cachedFeed, guestPhoneNumbers, isSignedIn, prefs?.hideGuestNames, streak]);
};

export default useWidgetSnapshot;
