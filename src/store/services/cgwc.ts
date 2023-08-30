import { createApi } from '@reduxjs/toolkit/query/react';
import { ICreateService, IDefaultQueryParams, IDefaultResponse, ICGWC, REST_API_VERBS } from '../types';
import { fetchUtils } from './fetch-utils';

const SERVICE_URL = 'cgwc';

type IGetLatestServiceResponse = IDefaultResponse<ICGWC>;

export const cgwcServiceSlice = createApi({
    reducerPath: SERVICE_URL,

    baseQuery: fetchUtils.baseQuery,

    refetchOnReconnect: true,
    endpoints: endpoint => ({
        createCGWC: endpoint.mutation<ICGWC, ICreateService>({
            query: body => ({
                url: `${SERVICE_URL}/createCGWC`,
                method: REST_API_VERBS.POST,
                body,
            }),
        }),

        updateCGWC: endpoint.mutation<void, ICreateService>({
            query: args => ({
                url: `${SERVICE_URL}/updateCGWC${args._id}`,
                method: REST_API_VERBS.PUT,
                body: args,
            }),
        }),

        getCGWCById: endpoint.query<ICGWC, string>({
            query: campusId => `/${SERVICE_URL}/getCGWC/${campusId}`,

            transformResponse: (response: IGetLatestServiceResponse) => response.data,
        }),

        getCGWCs: endpoint.query<ICGWC[], IDefaultQueryParams>({
            query: params => ({
                url: `/${SERVICE_URL}/getCGWC`,
                method: REST_API_VERBS.GET,
                params,
            }),

            transformResponse: (response: IDefaultResponse<ICGWC[]>) => response.data,
        }),

        // Add your endpoints here
    }),
});

// Use exported hook in relevant components
export const { useGetCGWCsQuery, useGetCGWCByIdQuery, useCreateCGWCMutation, useUpdateCGWCMutation } = cgwcServiceSlice;
