import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { BaseQueryFn, FetchArgs, FetchBaseQueryError, FetchBaseQueryMeta } from '@reduxjs/toolkit/query/react';
import APP_VARIANT from '@config/envConfig';
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import Utils from '@utils/index';

const { API_BASE_URL, CRM_API_BASE_URL } = APP_VARIANT;

/**
 * Module-private on purpose. Every service on the main API must go through
 * `fetchUtils.baseQueryWithTokenRefresh` instead — a service wired to a bare
 * `fetchBaseQuery` silently discards rotated tokens (see below), and the failure is
 * invisible until users start getting signed out. Keeping this unexported means a new
 * service cannot regress by copy-paste.
 */
const rawBaseQuery = fetchBaseQuery({
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
 * Serialises session writes. Sixteen services share this base query and RTK Query
 * fires requests concurrently, so without a queue two responses carrying rotated
 * tokens can interleave their read-modify-write of the session and persist the older
 * of the two — leaving the app authenticating with a token the backend has already
 * replaced.
 */
let sessionWriteQueue: Promise<void> = Promise.resolve();

const persistRotatedToken = (refreshed: string): Promise<void> => {
    sessionWriteQueue = sessionWriteQueue
        .then(async () => {
            // Re-read inside the critical section rather than closing over an earlier
            // read. This is also what makes a concurrent sign-out safe: if logout has
            // already deleted the session, there is nothing to spread onto and the
            // guard below drops the write instead of resurrecting a dead session.
            const raw = (await Utils.retrieveUserSession()) || '';
            const session = raw ? JSON.parse(raw) : null;

            if (session?.token?.token && session.token.token !== refreshed) {
                await Utils.storeUserSession({
                    ...session,
                    token: { ...session.token, token: refreshed },
                });
            }
        })
        .catch(() => {
            // Never let token-capture bookkeeping break the actual request result, and
            // never let one failed write poison the queue for subsequent ones.
        });

    return sessionWriteQueue;
};

export class fetchUtils {
    /**
     * The default base query for every service on the main API.
     *
     * Captures a rotated access token returned by the backend in the `Authorization`
     * response header and persists it back into the secure session, so subsequent
     * requests present the new token rather than the expired one.
     *
     * The refresh is implicit middleware on every authenticated request — there is no
     * endpoint to call, and the response header is the only signal. A service wired to
     * a plain `fetchBaseQuery` therefore discards the rotated token and keeps
     * presenting the old one until it expires, signing the user out roughly one
     * token-lifetime after login regardless of activity, with nothing in the server
     * logs because from the backend's point of view the refresh succeeded.
     */
    static baseQueryWithTokenRefresh: BaseQueryFn<
        string | FetchArgs,
        unknown,
        FetchBaseQueryError,
        {},
        FetchBaseQueryMeta
    > = async (args, api, extraOptions) => {
        const result = await rawBaseQuery(args, api, extraOptions);

        const header = result.meta?.response?.headers?.get('authorization');
        const refreshed = header?.replace(/^Bearer\s+/i, '').trim();

        if (refreshed) {
            // Awaited so the next request reads the rotated token rather than racing
            // the write. `persistRotatedToken` never rejects.
            await persistRotatedToken(refreshed);
        }

        return result;
    };
}

/**
 * The base query for every service on the **Roast CRM API**.
 *
 * A second base URL, the same bearer token: Roast authenticates with the Workforce
 * session, so the header is read from exactly the same place. Shared rather than copied
 * because two services now sit on this URL — `roastCrmApi` and `roastEngagementApi` — and
 * a second inline `prepareHeaders` is a second place for the session shape to go stale.
 *
 * Deliberately *not* wrapped in the token-refresh logic above: the rotated-token header
 * is issued by the Workforce API, and capturing one from a Roast response would persist a
 * token this session never minted.
 */
export const roastBaseQuery = fetchBaseQuery({
    baseUrl: CRM_API_BASE_URL,

    prepareHeaders: async headers => {
        const userSession = (await Utils.retrieveUserSession()) || '';
        const token = !!userSession && JSON.parse(userSession)?.token.token;

        if (token) {
            headers.set('authorization', `Bearer ${token}`);
        }

        return headers;
    },
});

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
