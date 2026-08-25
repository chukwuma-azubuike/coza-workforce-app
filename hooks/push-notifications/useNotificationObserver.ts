import { useCallback, useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useAppSelector } from '~/store/hooks';
import { userSelectors } from '~/store/actions/users';
import { INotificationTarget, parseNotificationData, resolveNotificationTarget } from '~/utils/notification-routing';

/**
 * Takes the user where a tapped notification points.
 *
 * Three delivery paths reach this hook, and they are not mutually exclusive:
 *
 * - **Cold start** — the app was not running. `getLastNotificationResponseAsync()`
 *   returns the tap that launched it.
 * - **Background** — the app was alive but backgrounded. The response listener fires.
 * - **Foreground** — the banner was tapped while the app was open. Same listener.
 *
 * A cold-start tap can surface through *both* the initial read and the listener, which
 * is why every target is keyed on the notification's own identifier before it is acted
 * on. The previous implementation instead called `getLastNotificationResponseAsync()`
 * twice in the same effect and navigated from each, so a cold-start tap reliably pushed
 * the destination onto the stack twice and the back gesture landed on a duplicate.
 */
const useNotificationObserver = () => {
    const user = useAppSelector(userSelectors.selectCurrentUser);
    const isAuthenticated = !!user?.userId;

    /**
     * A target that arrived before there was a signed-in user to show it to.
     *
     * The cold-start read resolves during boot, well before the session has rehydrated
     * and often before the router has a stack — navigating then either lands in the
     * unauthenticated shell or is swallowed entirely. Holding one target and flushing it
     * on sign-in is what makes a tap from the tray survive a launch.
     *
     * Only the most recent is kept: the user tapped one notification, and if a second
     * arrives before the first is flushed it is the newer intent that should win.
     */
    const pending = useRef<INotificationTarget | null>(null);

    /**
     * Identifiers already navigated for, so no tap is honoured twice.
     *
     * Unbounded in principle, bounded in practice — it is per-mount, and a session
     * accumulates one entry per notification the user actually taps.
     */
    const handled = useRef<Set<string>>(new Set());

    /**
     * Mirrors `isAuthenticated` for the listener callbacks.
     *
     * A tap arriving while the app is open sets a ref, which triggers no render — so
     * there is no effect to wake and decide whether to navigate. The callback has to
     * make that call itself, and a stale closure over the state would have it deciding
     * against the previous session.
     */
    const isAuthenticatedRef = useRef(isAuthenticated);

    const flushPending = useCallback(() => {
        const target = pending.current;

        if (!target) {
            return;
        }

        pending.current = null;

        // `push`, never `replace`: the user is being taken somewhere *on top of* where
        // they were, and back must return them to it.
        router.push({ pathname: target.pathname as any, params: target.params });
    }, []);

    const handleResponse = useCallback(
        (response?: Notifications.NotificationResponse | null) => {
            const notification = response?.notification;

            if (!notification) {
                return;
            }

            const identifier = notification.request?.identifier;

            if (identifier) {
                if (handled.current.has(identifier)) {
                    return;
                }

                handled.current.add(identifier);
            }

            pending.current = resolveNotificationTarget(parseNotificationData(notification));

            // Queue first, then move only if there is a session to move within. When there
            // is not — a cold start still rehydrating, or a tap on the sign-in screen — the
            // target waits for the effect below.
            if (isAuthenticatedRef.current) {
                flushPending();
            }
        },
        [flushPending]
    );

    useEffect(() => {
        let isMounted = true;

        (async () => {
            try {
                const lastResponse = await Notifications.getLastNotificationResponseAsync();

                if (!isMounted || !lastResponse) {
                    return;
                }

                handleResponse(lastResponse);

                // Cleared so a later remount — a theme change, a fast refresh, a
                // re-render of the root — does not replay a tap the user made hours ago.
                // Safe to clear before flushing: the target is already held in `pending`.
                await Notifications.clearLastNotificationResponseAsync();
            } catch (error) {
                // A tap we cannot resolve is a navigation the user does not get. It must
                // never be a crash on the launch path.
            }
        })();

        const subscription = Notifications.addNotificationResponseReceivedListener(handleResponse);

        return () => {
            isMounted = false;
            subscription.remove();
        };
    }, [handleResponse]);

    /**
     * The session boundary: flush what is waiting, or discard it.
     *
     * Discarding matters as much as flushing. A notification tapped moments before
     * sign-out must not be replayed into the next person's session on a shared campus
     * handset — permission decisions, ticket details and report contents all live behind
     * these routes.
     */
    useEffect(() => {
        isAuthenticatedRef.current = isAuthenticated;

        if (isAuthenticated) {
            flushPending();
        } else {
            pending.current = null;
        }
    }, [isAuthenticated, flushPending]);
};

export default useNotificationObserver;
