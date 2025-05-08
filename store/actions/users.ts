import { asyncThunkCreator, buildCreateSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { router } from 'expo-router';
import { ILoginResponse } from '../services/account';
import Utils from '~/utils';
import { IUser } from '../types';

export interface UserStoreState {
    currentUser: ILoginResponse['data'] | null;
}

const initialState: UserStoreState = {
    currentUser: null,
};

export const createUserSlice = buildCreateSlice({
    creators: { asyncThunk: asyncThunkCreator },
});

// Async thunk to store user session
export const storeSession = createAsyncThunk(
    'user_state/storeSession',
    async (userSession: ILoginResponse['data'], { fulfillWithValue, rejectWithValue }) => {
        try {
            await Utils.storeUserSession(userSession);
            return fulfillWithValue(userSession);
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

const userStateSlice = createUserSlice({
    name: 'user_state',
    initialState,
    reducers: create => ({
        clearSession: create.asyncThunk(
            async () => {
                await Utils.clearCurrentUserStorage();
                await Utils.removeUserSession();
            },
            {
                fulfilled: state => {
                    state.currentUser = null;
                    router.replace('/(auth)/login');
                },
            }
        ),

        updateSession: create.reducer((state, { payload }: PayloadAction<IUser>) => {
            if (state.currentUser) {
                state.currentUser.profile = payload;
            }
        }),
    }),

    extraReducers: builder => {
        builder.addCase(storeSession.fulfilled, (state, action) => {
            state.currentUser = action.payload;
            router.replace('/(tabs)');
        });
    },

    selectors: {
        selectCurrentUser: store => store.currentUser?.profile,
        selectToken: store => store.currentUser?.token,
    },
});

export default userStateSlice;

export const userActions = userStateSlice.actions;
export const userSelectors = userStateSlice.selectors;
