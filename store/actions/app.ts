import { PayloadAction, asyncThunkCreator, buildCreateSlice } from '@reduxjs/toolkit';

export interface IAppState {
    mode: 'crm' | 'ops';
}

const initialState: IAppState = {
    mode: 'ops',
};

export const createAppSlice = buildCreateSlice({
    creators: { asyncThunk: asyncThunkCreator },
});

const appStateSlice = createAppSlice({
    name: 'app_state',

    initialState,

    reducers: {
        toggleMode: (state, { payload }: PayloadAction<IAppState['mode']>) => {
            state.mode = payload;
        },
    },

    selectors: {
        selectMode: store => store.mode,
    },
});

const { actions, selectors } = appStateSlice;

export const appActions = actions;
export const appSelectors = selectors;

export default appStateSlice;
