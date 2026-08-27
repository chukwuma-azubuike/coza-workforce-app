import { AppState, AppStateStatus } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { setupListeners } from '@reduxjs/toolkit/query';
import type { IAppDispatch } from './index';

/**
 * Makes `refetchOnFocus` and `refetchOnReconnect` actually do something.
 *
 * Every service in this app declares both flags, and every one of them was inert. The
 * bare `setupListeners(dispatch)` installs RTK Query's **web** handler, which listens for
 * `visibilitychange`, `focus`, `online` and `offline` on `window` — four DOM events React
 * Native never fires. Nothing errors and nothing warns; the flags simply never fire, and
 * a screen re-entered after two hours in the app switcher renders whatever was in the
 * cache when it was last left. The notification service's own comment ("refetching on
 * focus and on reconnect is what stands in for [a realtime channel]") describes an intent
 * the runtime was quietly dropping.
 *
 * `AppState` and NetInfo are this platform's equivalents of those events, so this trades
 * the web handler for one built on them. It belongs to the store rather than to any one
 * feature: every query in the app was affected the same way.
 */
export const setupReactNativeListeners = (dispatch: IAppDispatch) =>
    setupListeners(dispatch, (_, { onFocus, onFocusLost, onOnline, onOffline }) => {
        /**
         * Both flags are seeded to what RTK Query already believes, so the first event
         * only dispatches when it genuinely contradicts that.
         *
         * It assumes `focused: true` (it reads `document.visibilityState`, absent here)
         * and `online: true` (`navigator.onLine`, undefined here). Seeding `isFocused`
         * from `AppState.currentState` instead would look more truthful and be worse:
         * Android reports `null` for it during the cold start that runs this module, and
         * a launch that is already active fires no `change` event to correct it — so the
         * first trip to the background would find `isFocused` false, skip `onFocusLost`,
         * and leave RTK Query polling a bell nobody is looking at for the rest of the
         * session.
         */
        let isFocused = true;
        let isOnline = true;

        /**
         * Focus is dispatched on the *transition* into `active`, never on every event.
         *
         * RTK Query refetches on the action, not on the state change — `onFocus.match` in
         * its middleware fires `refetchOnFocus` whether or not the app was already
         * focused. iOS emits `inactive` for a pulled-down notification shade, an incoming
         * call banner, even the app-switcher preview, so dispatching per event would
         * refetch every subscribed query in the app each time a banner slid past.
         *
         * `inactive` is for that reason not a focus loss; only a real trip to the
         * background is. Coming back from `inactive` is then not a focus *gain* either,
         * which is the half that matters.
         */
        const handleAppState = (status: AppStateStatus) => {
            const nextFocused = status === 'active' ? true : status === 'background' ? false : isFocused;

            if (nextFocused === isFocused) {
                return;
            }

            isFocused = nextFocused;
            dispatch(nextFocused ? onFocus() : onFocusLost());
        };

        /**
         * `isInternetReachable` is `null` until the first reachability probe resolves, and
         * a captive-portal Wi-Fi reports `isConnected: true` while nothing routes. Unknown
         * counts as online: a false "offline" costs the user a refetch they needed, while
         * a false "online" costs one failed request that the next event corrects.
         */
        const handleNetInfo = (isConnected: boolean | null, isReachable: boolean | null) => {
            const nextOnline = isConnected !== false && isReachable !== false;

            if (nextOnline === isOnline) {
                return;
            }

            isOnline = nextOnline;
            dispatch(nextOnline ? onOnline() : onOffline());
        };

        const appStateSubscription = AppState.addEventListener('change', handleAppState);
        const unsubscribeNetInfo = NetInfo.addEventListener(state =>
            handleNetInfo(state.isConnected, state.isInternetReachable)
        );

        return () => {
            appStateSubscription.remove();
            unsubscribeNetInfo();
        };
    });
