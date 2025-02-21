import { createSelector, Dispatch, Reducer } from '@reduxjs/toolkit';
import { IStore } from '..';
import { IUser } from '../types';

type IUserState = IUser;
interface IUserAction {
    payload: any;
    type: 'SET_USER_DATA' | 'GET_USER_DATA' | 'DELETE_USER_DATA' | 'SET_USER_DATA_FAILED';
}

export const userActionTypes = {
    SET_USER_DATA: 'SET_USER_DATA',
    SET_USER_DATA_FAILED: 'SET_USER_DATA_FAILED',
    GET_USER_DATA: 'GET_USER_DATA',
    DELETE_USER_DATA: 'DELETE_USER_DATA',
};

const initialState = {};

const userReducer: Reducer<IUserState, IUserAction> = (state = initialState as IUser, action) => {
    switch (action.type) {
        case userActionTypes.SET_USER_DATA:
            return action.payload;
            break;

        case userActionTypes.DELETE_USER_DATA:
            return {};
            break;

        default:
            return state;
            break;
    }
};

const selectUserSlice = (store: IStore) => store.users;

export const setUserData = (data: IUser) => (dispatch: Dispatch<IUserAction>) => {
    try {
        dispatch({
            type: 'SET_USER_DATA',
            payload: data,
        });
    } catch (err) {
        dispatch({
            type: 'SET_USER_DATA_FAILED',
            payload: err,
        });
    }
};

export const selectCurrentUser = createSelector(selectUserSlice, userSession => userSession);

export default userReducer;
