import { PayloadAction, asyncThunkCreator, buildCreateSlice } from '@reduxjs/toolkit';
import { stat } from 'react-native-fs';
import { IModalState } from '~/types/app';

export interface IAppState {
    toast: IModalState;
    mode: 'crm' | 'ops';
}

const initialState: IAppState = {
    toast: {
        open: false,
    },
    mode: 'ops',
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
        toggleMode: (state, { payload }: PayloadAction<IAppState['mode']>) => {
            state.mode = payload;
        },
    },

    selectors: {
        selectToast: store => store.toast,
        selectMode: store => store.mode,
    },
});

const { actions, selectors } = appStateSlice;

export const appActions = actions;
export const appSelectors = selectors;

export default appStateSlice;
