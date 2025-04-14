import { createListenerMiddleware } from '@reduxjs/toolkit';
import { IStore } from '..';
import { appActions } from '../actions/app';

export const dismissModalListenerMiddleware = createListenerMiddleware<IStore>();

dismissModalListenerMiddleware.startListening({
    actionCreator: appActions.toast, // This action is dispatched every second
    effect: async (action, { dispatch, delay, cancelActiveListeners }) => {
        cancelActiveListeners();
        const duration = (action.payload?.duration || 3) * 1000;

        await delay(duration);
        dispatch(appActions.toast({}));
    },
});
