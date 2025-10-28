import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { ContactChannel, FetchCache, Guest, GuestFormData } from '../types';

export interface OutgoingCall {
    id: string;
    type: ContactChannel;
    startedAt: string; // ISO
    guest: Guest | null; // optional structured metadata
}
export interface IUploadState {
    fetchCache: {
        [key: string]: FetchCache;
    } | null;
    queue: OutgoingCall[]; // oldest at index 0, newest at end
}

const initialState: IUploadState = {
    fetchCache: {},
    queue: [],
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

        // Outgoing Calls
        pushOutgoingCall(state, action: PayloadAction<OutgoingCall>) {
            const exists = state.queue.find(record => record.id === action.payload.guest?._id);

            if (!exists) {
                state.queue.push(action.payload);
            }

            if (!!exists) {
                state.queue = state.queue.filter(record => record.id !== action.payload.guest?._id);
                state.queue.push(action.payload);
            }
        },
        popOutgoingCall(state) {
            // pop the most-recent (LIFO) — change as needed; here we pop end
            state.queue.pop();
        },
        setCallQueue(state, action: PayloadAction<OutgoingCall[]>) {
            state.queue = action.payload;
        },
        clearCallQueue(state) {
            state.queue = [];
        },
    },
    selectors: {
        selectFetchCache: (store): FetchCache<any, any>[] | undefined => {
            if (store.fetchCache) {
                const fetchCacheArray = Object.entries(store.fetchCache)?.map(([_, value]) => value);

                return fetchCacheArray;
            }

            return undefined;
        },

        selectCallQueue: (store): OutgoingCall[] => store.queue,
    },
});

const { actions, selectors } = roastCRMState;
export const roastCRMActions = actions;
export const roastCRMSelectors = selectors;
export default roastCRMState;
