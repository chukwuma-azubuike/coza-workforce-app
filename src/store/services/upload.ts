import { UPLOAD_URL } from '@env';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { IStore } from '..';
import { ICampus, IDefaultResponse, REST_API_VERBS } from '../types';

export interface ICreateCampusPayload {
    campusName: string;
    description: string;
    address: string;
    LGA: string;
    state: string;
    country: string;
    location: {
        coordinates: {};
    };
    dateOfBirth: string;
}

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
        createCampus: endpoint.mutation<ICampus, ICreateCampusPayload>({
            query: body => ({
                url: '',
                method: REST_API_VERBS.POST,
                body,
            }),

            transformResponse: (response: IDefaultResponse<ICampus>) => response.data,
        }),

        // Add your endpoints here
    }),
});

// Use exported hook in relevant components
export const {} = uploadServiceSlice;
