import { createApi } from '@reduxjs/toolkit/query/react';
import {
    ICreateService,
    IDefaultQueryParams,
    IDefaultResponse,
    ICGWC,
    REST_API_VERBS,
    ICGWCInstantMessage,
    ICGWCInstantMessagePayload,
    ICGWCPayload,
} from '../types';
import { fetchUtils } from './fetch-utils';

const SERVICE_URL = 'cgwc';

type IGetLatestSessionResponse = IDefaultResponse<ICGWC>;

export const cgwcServiceSlice = createApi({
    reducerPath: SERVICE_URL,

    baseQuery: fetchUtils.baseQuery,

    refetchOnReconnect: true,
    endpoints: endpoint => ({
        createCGWC: endpoint.mutation<ICGWC, ICGWCPayload>({
            query: body => ({
                url: `/${SERVICE_URL}/createCGWC`,
                method: REST_API_VERBS.POST,
                body,
            }),
        }),

        updateCGWC: endpoint.mutation<void, ICreateService>({
            query: args => ({
                url: `/${SERVICE_URL}/updateCGWC${args._id}`,
                method: REST_API_VERBS.PUT,
                body: args,
            }),
        }),

        getCGWCById: endpoint.query<ICGWC, string>({
            query: id => ({
                url: `/${SERVICE_URL}/getCGWCByID/${id}`,
                method: REST_API_VERBS.GET,
            }),

            transformResponse: (response: IDefaultResponse<ICGWC>) => response.data,
        }),

        getCGWCs: endpoint.query<ICGWC[], Partial<IDefaultQueryParams>>({
            query: params => ({
                url: `/${SERVICE_URL}/getAllCGWC`,
                method: REST_API_VERBS.GET,
                params,
            }),

            transformResponse: (response: IDefaultResponse<ICGWC[]>) => response.data,
        }),

        getCGWCInstantMessages: endpoint.query<ICGWCInstantMessage[], Partial<IDefaultQueryParams>>({
            query: params => ({
                url: `/${SERVICE_URL}/getInstantMessage`,
                method: REST_API_VERBS.GET,
                params,
            }),

            transformResponse: (response: IDefaultResponse<ICGWCInstantMessage[]>) => response.data,
        }),

        createCGWCInstantMessages: endpoint.mutation<ICGWCInstantMessage, ICGWCInstantMessagePayload>({
            query: body => ({
                url: `/${SERVICE_URL}/createInstantMessage`,
                method: REST_API_VERBS.POST,
                body,
            }),

            transformResponse: (response: IDefaultResponse<ICGWCInstantMessage>) => response.data,
        }),

        // Add your endpoints here
    }),
});

// Use exported hook in relevant components
export const {
    useGetCGWCsQuery,
    useGetCGWCByIdQuery,
    useCreateCGWCMutation,
    useUpdateCGWCMutation,
    useGetCGWCInstantMessagesQuery,
    useCreateCGWCInstantMessagesMutation,
} = cgwcServiceSlice;
