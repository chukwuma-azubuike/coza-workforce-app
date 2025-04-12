import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { IModalState } from '~/types/app';

export interface IAppState {
    toast: IModalState;
}

const initialState: IAppState = {
    toast: {
        open: false,
    },
};

const appStateSlice = createSlice({
    name: 'app_state',

    initialState,

    reducers: {
        toast: (state, { payload }: PayloadAction<IAppState['toast']>) => {
            state.toast = payload;

            console.log({ payload });

            setTimeout(
                () => {
                    state.toast.open = false;
                },
                payload.duration ? payload.duration * 1000 : 3000 // Modal timeout
            );
        },
    },

    selectors: {
        selectToast: store => store.toast,
    },
});

const { actions, selectors } = appStateSlice;

export const appActions = actions;
export const appSelectors = selectors;

export default appStateSlice;
