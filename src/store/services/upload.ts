import { UPLOAD_URL } from '@env';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { IStore } from '..';
import { IDefaultResponse, REST_API_VERBS } from '../types';

const SERVICE_URL = 'upload';

export const uploadServiceSlice = createApi({
    reducerPath: SERVICE_URL,

    baseQuery: fetchBaseQuery({
        baseUrl: UPLOAD_URL,

        prepareHeaders: async (headers, { getState }) => {
            const token = (getState() as IStore).account;

            if (token) headers.set('authorization', `Bearer ${token}`);

            return headers;
        },

        // timeout: 60000,
    }),

    endpoints: endpoint => ({
        // Add your endpoints here
    }),
});

// Use exported hook in relevant components
export const {} = uploadServiceSlice;
