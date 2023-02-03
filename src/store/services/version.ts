import { Reducer } from '@reduxjs/toolkit';
import { IStore } from '..';

export interface IVersionState {
    lastUpdatedVersionCode: string;
    action: { hasLoggedOut: boolean };
    updatedAt: string;
}

interface IVerisonAction {
    payload: any;
    type:
        | 'SET_LAST_UPDATED_VERSION'
        | 'SET_HAS_LOGGED_OUT_TRUE'
        | 'SET_HAS_LOGGED_OUT_FALSE';
}

export const versionActiontypes = {
    SET_LAST_UPDATED_VERSION: 'SET_LAST_UPDATED_VERSION',
    SET_HAS_LOGGED_OUT_TRUE: 'SET_HAS_LOGGED_OUT_TRUE',
    SET_HAS_LOGGED_OUT_FALSE: 'SET_HAS_LOGGED_OUT_FALSE',
};

const initialState: IVersionState = {
    action: { hasLoggedOut: false },
    lastUpdatedVersionCode: '',
    updatedAt: '',
};

const versionReducer: Reducer<IVersionState, IVerisonAction> = (
    state = initialState as IVersionState,
    action
) => {
    switch (action.type) {
        case versionActiontypes.SET_LAST_UPDATED_VERSION:
            return {
                ...state,
                lastUpdatedVersionCode: action.payload,
                updatedAt: new Date().toUTCString(),
            };
            break;

        case versionActiontypes.SET_HAS_LOGGED_OUT_TRUE:
            return {
                ...state,
                action: { hasLoggedOut: true },
            };
            break;

        case versionActiontypes.SET_HAS_LOGGED_OUT_FALSE:
            return {
                ...state,
                action: { hasLoggedOut: false },
            };

        default:
            return state;
            break;
    }
};

export const selectVersionCode = (store: IStore) =>
    store.version.lastUpdatedVersionCode;

export const selectVersionActionTaken = (store: IStore) => store.version.action;

export default versionReducer;
