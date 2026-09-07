import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';

/**
 * Runs `onForeground` when the app genuinely returns to the front.
 *
 * The distinction this makes is the same one `store/rn-listeners.ts` makes for RTK
 * Query's focus events, and for the same reason: iOS emits `inactive` for a pulled-down
 * notification shade, an incoming call banner, even the app-switcher preview. Treating
 * those as a return to the foreground would re-run the reconcile and the engagement ping
 * every time a banner slid past.
 *
 * So only `background → active` counts. Coming back from `inactive` is not a return,
 * because going to `inactive` was never a departure.
 *
 * `runOnMount` covers the cold start, which fires no transition at all.
 */
const useAppForeground = (onForeground: () => void, { runOnMount = true }: { runOnMount?: boolean } = {}) => {
    // Held in a ref so a caller passing an inline closure does not re-subscribe on every
    // render — the listener would otherwise be torn down and rebuilt continuously, and a
    // transition arriving in that gap would be missed.
    const callback = useRef(onForeground);
    callback.current = onForeground;

    useEffect(() => {
        let previous: AppStateStatus | null = AppState.currentState;

        if (runOnMount) {
            callback.current();
        }

        const subscription = AppState.addEventListener('change', next => {
            if (previous === 'background' && next === 'active') {
                callback.current();
            }

            previous = next;
        });

        return () => subscription.remove();
    }, [runOnMount]);
};

export default useAppForeground;
