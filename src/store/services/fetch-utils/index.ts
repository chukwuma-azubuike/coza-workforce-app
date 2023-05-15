import { IStore } from '../..';
import APP_ENV from '../../../config/envConfig';
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const { API_BASE_URL } = APP_ENV();
export class fetchUtils {
    static baseQuery = fetchBaseQuery({
        baseUrl: API_BASE_URL,

        prepareHeaders: async (headers, { getState }) => {
            const token = (getState() as IStore).account;

            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }

            return headers;
        },

        // timeout: 60000,
    });
}
