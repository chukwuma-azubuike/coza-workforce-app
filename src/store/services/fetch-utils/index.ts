import APP_ENV from '@config/envConfig';
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import Utils from '@utils/index';

const { API_BASE_URL } = APP_ENV();
export class fetchUtils {
    static baseQuery = fetchBaseQuery({
        baseUrl: API_BASE_URL,

        prepareHeaders: async headers => {
            const userSession = (await Utils.retrieveUserSession()) || '';
            const token = JSON.parse(userSession)?.token.token;

            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }

            return headers;
        },
    });
}
