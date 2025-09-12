import { createApi } from '@reduxjs/toolkit/query/react';
import {
    ICreateService,
    IDefaultQueryParams,
    IDefaultResponse,
    ICongress,
    REST_API_VERBS,
    ICongressInstantMessage,
    ICongressInstantMessagePayload,
    ICongressPayload,
    ICongressFeedback,
    ICongressFeedbackPayload,
} from '../types';
import { fetchUtils } from './fetch-utils';

const SERVICE_URL = 'cgwc';

export const congressServiceSlice = createApi({
    reducerPath: SERVICE_URL,

    baseQuery: fetchUtils.baseQuery,

    refetchOnFocus: true,
    refetchOnReconnect: true,
    refetchOnMountOrArgChange: true,

    endpoints: endpoint => ({
        createCongress: endpoint.mutation<ICongress, ICongressPayload>({
            query: body => ({
                url: `/${SERVICE_URL}/createCGWC`,
                method: REST_API_VERBS.POST,
                body,
            }),
        }),

        updateCongress: endpoint.mutation<void, ICreateService & { _id: string }>({
            query: args => ({
                url: `/${SERVICE_URL}/updateCGWC${args._id}`,
                method: REST_API_VERBS.PUT,
                body: args,
            }),
        }),

        getCongressById: endpoint.query<ICongress, string>({
            query: id => ({
                url: `/${SERVICE_URL}/getCGWCByID/${id}`,
                method: REST_API_VERBS.GET,
            }),

            transformResponse: (response: IDefaultResponse<ICongress>) => response.data,
        }),

        getCongresss: endpoint.query<ICongress[], Partial<IDefaultQueryParams>>({
            query: params => ({
                url: `/${SERVICE_URL}/getAllCGWC`,
                method: REST_API_VERBS.GET,
                params,
            }),

            transformResponse: (response: IDefaultResponse<ICongress[]>) => response.data,
        }),

        getCongressInstantMessages: endpoint.query<ICongressInstantMessage[], Partial<IDefaultQueryParams>>({
            query: params => ({
                url: `/${SERVICE_URL}/getInstantMessage`,
                method: REST_API_VERBS.GET,
                params,
            }),

            transformResponse: (response: IDefaultResponse<ICongressInstantMessage[]>) => response.data,
        }),

        createCongressInstantMessages: endpoint.mutation<ICongressInstantMessage, ICongressInstantMessagePayload>({
            query: body => ({
                url: `/${SERVICE_URL}/createInstantMessage`,
                method: REST_API_VERBS.POST,
                body,
            }),

            transformResponse: (response: IDefaultResponse<ICongressInstantMessage>) => response.data,
        }),

        submitCongressFeedback: endpoint.mutation<ICongressFeedback, ICongressFeedbackPayload>({
            query: body => ({
                url: `/${SERVICE_URL}/submitFeedback`,
                method: REST_API_VERBS.POST,
                body,
            }),

            transformResponse: (response: IDefaultResponse<ICongressFeedback>) => response.data,
        }),

        // Add your endpoints here
    }),
});

// Use exported hook in relevant components
export const {
    useGetCongresssQuery,
    useGetCongressByIdQuery,
    useCreateCongressMutation,
    useUpdateCongressMutation,
    useSubmitCongressFeedbackMutation,
    useGetCongressInstantMessagesQuery,
    useCreateCongressInstantMessagesMutation,
} = congressServiceSlice;
