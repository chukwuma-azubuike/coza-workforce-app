import { IStore } from '../..';
import { API_BASE_URL } from '@env';
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export class fetchUtils {
    static baseQuery = fetchBaseQuery({
        baseUrl: API_BASE_URL,

        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as IStore).auth;

            if (token) headers.set('authorization', `Bearer ${token}`);

            return headers;
        },
    });
}
