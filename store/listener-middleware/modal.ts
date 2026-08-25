import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { IStore } from '..';
import { modalActions } from '../actions/modal';

export const modalListenerMiddleware = createListenerMiddleware<IStore>();

/**
 * Owns the life of the visible alert: exactly one timer runs for exactly the alert on screen.
 *
 * The previous implementation listened to a single `toast` action and reset the state with that
 * same action, so every dismissal re-armed a 1s timer — an endless dispatch loop that re-rendered
 * every `useModal` consumer and wrote to AsyncStorage once a second for the life of the process.
 */
modalListenerMiddleware.startListening({
    matcher: isAnyOf(modalActions.show, modalActions.dismiss, modalActions.clear),

    effect: async (_action, { getState, getOriginalState, dispatch, delay, cancelActiveListeners }) => {
        const previousId = getOriginalState().modal.current?.id ?? null;
        const current = getState().modal.current;

        // Same alert as before the action (a deduped re-show, or a stale dismissal that was
        // ignored): leave the timer that is already counting down alone.
        if (previousId === (current?.id ?? null)) return;

        // A different alert is on screen now — supersede the timer that belonged to the old one.
        cancelActiveListeners();

        if (!current || !current.durationMs) return;

        await delay(current.durationMs);

        // Scoped to this alert's id, so it is a no-op if something else took the screen meanwhile.
        dispatch(modalActions.dismiss(current.id));
    },
});

export default modalListenerMiddleware;
