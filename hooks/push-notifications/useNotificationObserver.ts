import { useCallback, useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { router, useGlobalSearchParams, usePathname } from 'expo-router';
import { useAppSelector } from '~/store/hooks';
import { useMarkNotificationsReadMutation } from '~/store/services/notification';
import { userSelectors } from '~/store/actions/users';
import { INotificationTarget, parseNotificationData, resolveNotificationTarget } from '~/utils/notification-routing';
import { stripRouteGroups } from '~/constants/notification-routes';

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
    const [markRead] = useMarkNotificationsReadMutation();

    /**
     * Where the user is standing right now.
     *
     * Only the foreground path can be standing anywhere — a cold start has no screen yet
     * and a background tap resumes onto whatever was last open — which is why this exists
     * at all: a push about the ticket you are *currently reading* is common, and pushing
     * its route again stacks a second identical screen whose back gesture lands on a
     * stale twin of itself. The notification centre already refuses to do this to itself
     * (`views/app/notifications`); this extends the same refusal to every route.
     *
     * Held in a ref because the listener callbacks run outside the render cycle and would
     * otherwise close over the route the user was on when the listener was registered.
     */
    const pathname = usePathname();
    const routeParams = useGlobalSearchParams();
    const currentRoute = useRef({ pathname, params: routeParams });
    currentRoute.current = { pathname, params: routeParams };

    /**
     * The signed-in user, readable from the listener callbacks for the same reason as
     * `isAuthenticatedRef` below — they run outside the render cycle.
     */
    const userIdRef = useRef<string | undefined>((user?.userId ?? user?._id) as string | undefined);

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

    /**
     * True when the target is the screen already on top, params and all.
     *
     * Deliberately strict: every param the notification carries must match, so a push
     * about ticket B while ticket A is open still navigates. The failure this guards
     * against is a duplicate; the failure it could *cause* is a tap that appears to do
     * nothing, so it only fires when the user is provably looking at the exact thing the
     * notification points at — where a duplicate is strictly the worse outcome.
     */
    const isAlreadyOpen = useCallback((target: INotificationTarget) => {
        const current = currentRoute.current;

        if (stripRouteGroups(current.pathname) !== stripRouteGroups(target.pathname)) {
            return false;
        }

        // Compared as strings because that is what the router stores: every param is
        // serialised on the way into a route, so a numeric id arrives back as `'42'`.
        return Object.entries(target.params).every(
            ([key, value]) => String(current.params[key] ?? '') === String(value)
        );
    }, []);

    const flushPending = useCallback(() => {
        const target = pending.current;

        if (!target) {
            return;
        }

        pending.current = null;

        // Reading it in the tray *is* reading it. Leaving the row unread would make the
        // bell contradict what the user just did, and the inbox is the durable record —
        // fire-and-forget, because a failed read receipt must not cost the navigation.
        if (target.notificationId && userIdRef.current) {
            markRead({ userId: userIdRef.current, notificationIds: [target.notificationId] })
                .unwrap()
                .catch(() => {});
        }

        // Checked after the read receipt, not before: the user acted on the notification
        // either way, and the row must stop being unread whether or not there is anywhere
        // new to go.
        if (isAlreadyOpen(target)) {
            return;
        }

        // `push`, never `replace`: the user is being taken somewhere *on top of* where
        // they were, and back must return them to it.
        router.push({ pathname: target.pathname as any, params: target.params });
    }, [markRead, isAlreadyOpen]);

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
        userIdRef.current = (user?.userId ?? user?._id) as string | undefined;

        if (isAuthenticated) {
            flushPending();
        } else {
            pending.current = null;
        }
    }, [isAuthenticated, user, flushPending]);
};

export default useNotificationObserver;
