import { PayloadAction, asyncThunkCreator, buildCreateSlice, createSlice } from '@reduxjs/toolkit';
import { IModalState } from '~/types/app';

export interface IAppState {
    toast: IModalState;
}

const initialState: IAppState = {
    toast: {
        open: false,
    },
};

export const createAppSlice = buildCreateSlice({
    creators: { asyncThunk: asyncThunkCreator },
});

const appStateSlice = createAppSlice({
    name: 'app_state',

    initialState,

    reducers: {
        toast: (state, { payload }: PayloadAction<IAppState['toast']>) => {
            state.toast = payload;
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
