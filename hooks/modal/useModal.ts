import React from 'react';
import { useAppDispatch, useAppSelector } from '~/store/hooks';
import { modalActions, modalSelectors } from '~/store/actions/modal';
import { IModalState } from '~/types/app';

/**
 * Read the alert currently on screen. Only the `NotificationModal` needs this.
 *
 * Kept separate from `useModal` on purpose: `useModal` is called from ~30 screens, and if the
 * setter hook also subscribed to modal state, every one of those screens would re-render on every
 * show/dismiss — and any effect keyed on a re-render would re-dispatch and restart the timer,
 * which is exactly why durations were unreliable.
 */
export const useModalState = () => useAppSelector(modalSelectors.selectCurrentModal);

const useModal = () => {
    const dispatch = useAppDispatch();

    /** Show an alert. Stable across renders, so it is safe in effect dependency arrays. */
    const setModalState = React.useCallback(
        (state: IModalState) => {
            dispatch(modalActions.show(state));
        },
        [dispatch]
    );

    /** Dismiss the visible alert. Pass an id to only dismiss that specific alert. */
    const dismissModal = React.useCallback(
        (id?: number) => {
            dispatch(modalActions.dismiss(id));
        },
        [dispatch]
    );

    /** Drop the visible alert and anything queued behind it. */
    const clearModals = React.useCallback(() => {
        dispatch(modalActions.clear());
    }, [dispatch]);

    return {
        setModalState,
        dismissModal,
        clearModals,
    };
};

export default useModal;
