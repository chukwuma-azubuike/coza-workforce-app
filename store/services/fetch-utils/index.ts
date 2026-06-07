import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
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

    /**
     * Same as `baseQuery`, but additionally captures a rotated access token returned
     * by the backend in the `Authorization` response header (silent refresh) and
     * persists it back into the secure session so subsequent requests stay authed.
     *
     * Scoped to the GSP dashboard service for now; can be promoted app-wide later.
     */
    static baseQueryWithTokenRefresh: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
        args,
        api,
        extraOptions
    ) => {
        const result = await fetchUtils.baseQuery(args, api, extraOptions);

        try {
            const header = (result.meta?.response as Response | undefined)?.headers?.get('authorization');
            const refreshed = header?.replace(/^Bearer\s+/i, '').trim();

            if (refreshed) {
                const raw = (await Utils.retrieveUserSession()) || '';
                const session = raw ? JSON.parse(raw) : null;

                if (session?.token?.token && session.token.token !== refreshed) {
                    await Utils.storeUserSession({
                        ...session,
                        token: { ...session.token, token: refreshed },
                    });
                }
            }
        } catch {
            // Never let token-capture bookkeeping break the actual request result.
        }

        return result;
    };
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
