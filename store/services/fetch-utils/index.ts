import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { BaseQueryFn } from '@reduxjs/toolkit/query/react';
import APP_VARIANT from '@config/envConfig';
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import Utils from '@utils/index';

const { API_BASE_URL } = APP_VARIANT;
export class fetchUtils {
    static baseQuery = fetchBaseQuery({
        baseUrl: API_BASE_URL,

        prepareHeaders: async headers => {
            const userSession = (await Utils.retrieveUserSession()) || '';
            const token = !!userSession && JSON.parse(userSession)?.token.token;

            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }

            return headers;
        },
    });
}

const axiosInstance = axios.create();

export const axiosBaseQueryFn =
    (): BaseQueryFn<AxiosRequestConfig, unknown, unknown> =>
    async ({ url, baseURL, ...args }) => {
        try {
            const result = await axiosInstance({
                url: (baseURL || '') + url,
                ...args,
            });

            return { data: result.data };
        } catch (axiosError) {
            const err = axiosError as AxiosError;

            return {
                error: {
                    status: err.response?.status,
                    data: err.response?.data || err.message,
                },
            };
        }
    };

export const axiosBaseQuery = axiosBaseQueryFn();
