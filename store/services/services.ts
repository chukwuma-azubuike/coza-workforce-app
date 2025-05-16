import { createApi } from '@reduxjs/toolkit/query/react';
import {
    ICreateService,
    IDefaultQueryParams,
    IDefaultResponse,
    IService,
    IUpdateService,
    REST_API_VERBS,
} from '../types';
import { fetchUtils } from './fetch-utils';

const SERVICE_URL = 'service';

type IGetLatestServiceResponse = IDefaultResponse<IService>;

export const servicesServiceSlice = createApi({
    reducerPath: SERVICE_URL,

    baseQuery: fetchUtils.baseQuery,

    tagTypes: ['latestService', 'service-list'],

    refetchOnFocus: true,
    refetchOnReconnect: true,
    refetchOnMountOrArgChange: true,

    endpoints: endpoint => ({
        createService: endpoint.mutation<IService, ICreateService>({
            query: body => ({
                url: `${SERVICE_URL}/createService`,
                method: REST_API_VERBS.POST,
                body,
            }),

            invalidatesTags: ['service-list'],
        }),

        updateService: endpoint.mutation<void, IUpdateService>({
            query: ({ _id, ...args }) => ({
                url: `${SERVICE_URL}/updateService/${_id}`,
                method: REST_API_VERBS.PATCH,
                body: args,
            }),

            invalidatesTags: ['service-list'],
        }),

        getLatestService: endpoint.query<IService, string>({
            query: campusId => `/${SERVICE_URL}/getLatestServiceByCampusId/${campusId}`,

            transformResponse: (response: IGetLatestServiceResponse) => response.data,

            providesTags: ['latestService'],
        }),

        getServices: endpoint.query<IService[], IDefaultQueryParams>({
            query: params => ({
                url: `/${SERVICE_URL}/getServices`,
                method: REST_API_VERBS.GET,
                params,
            }),

            providesTags: ['service-list'],

            transformResponse: (response: IDefaultResponse<IService[]>) => response.data,
        }),

        getServiceById: endpoint.query<void, void>({
            query: id => `/${SERVICE_URL}/${id}`,
        }),

        // Add your endpoints here
    }),
});

// Use exported hook in relevant components
export const {
    useCreateServiceMutation,
    useUpdateServiceMutation,
    useGetLatestServiceQuery,
    useGetServiceByIdQuery,
    useGetServicesQuery,
} = servicesServiceSlice;
