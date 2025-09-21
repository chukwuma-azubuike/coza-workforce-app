import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { FetchCache, GuestFormData } from '../types';

export interface IUploadState {
    fetchCache: {
        [key: string]: FetchCache;
    } | null;
}

const initialState: IUploadState = {
    fetchCache: {},
};

const roastCRMState = createSlice({
    name: 'roast-crm-state',

    initialState,

    reducers: {
        addFetchCache(state, { payload }: PayloadAction<FetchCache<GuestFormData>>) {
            if (typeof payload.fn === 'function' && payload.payload) {
                const cacheKey = payload.cacheKey;
                const cacheStore = state.fetchCache;

                // If store is empty or null
                if (!cacheStore) {
                    state.fetchCache = { [cacheKey]: payload };
                    return;
                }

                // If store is not empty and cache key is free
                if (cacheStore && !cacheStore.hasOwnProperty(cacheKey)) {
                    cacheStore[cacheKey] = payload;
                }
            }
        },
        removeFetchCache(state, { payload }: PayloadAction<string>) {
            if (typeof payload === 'string' && state.fetchCache) {
                delete state.fetchCache[payload];
            }
        },
    },
    selectors: {
        selectFetchCache: (store): FetchCache<any, any>[] | undefined => {
            if (store.fetchCache) {
                const fetchCacheArray = Object.entries(store.fetchCache)?.map(([_, value]) => value);

                return fetchCacheArray;
            }
        },
    },
});

const { actions, selectors } = roastCRMState;
export const roastCRMActions = actions;
export const roastCRMSelectors = selectors;
export default roastCRMState;
