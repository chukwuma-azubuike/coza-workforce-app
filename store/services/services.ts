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

    tagTypes: [
        SERVICE_URL,
        'Service',
        'LatestService',
        'ServiceList',
        'CampusServices',
        'PaginatedServices'
    ],

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

            invalidatesTags: (result) => [
                { type: 'Service', id: result?._id },
                { type: 'PaginatedServices', id: 'LIST' },
                'ServiceList',
                'LatestService',
                'CampusServices',
                SERVICE_URL
            ],
        }),

        updateService: endpoint.mutation<void, IUpdateService>({
            query: ({ _id, ...args }) => ({
                url: `${SERVICE_URL}/updateService/${_id}`,
                method: REST_API_VERBS.PATCH,
                body: args,
            }),

            invalidatesTags: (result, error, { _id }) => [
                { type: 'Service', id: _id },
                'ServiceList',
                'LatestService',
                'CampusServices',
                SERVICE_URL
            ],
        }),

        deleteService: endpoint.mutation<void, string>({
            query: _id => ({
                url: `${SERVICE_URL}/deletService/${_id}`,
                method: REST_API_VERBS.DELETE,
            }),

            invalidatesTags: (result, error, _id) => [
                { type: 'Service', id: _id },
                'ServiceList',
                'LatestService',
                'CampusServices',
                SERVICE_URL
            ],
        }),

        getLatestService: endpoint.query<IService, string>({
            query: campusId => `/${SERVICE_URL}/getLatestServiceByCampusId/${campusId}`,

            transformResponse: (response: IGetLatestServiceResponse) => response.data,

            providesTags: (result, error, campusId) => [
                { type: 'Service', id: result?._id },
                { type: 'CampusServices', id: campusId },
                'LatestService',
                SERVICE_URL
            ],
        }),

        getServices: endpoint.query<IService[], IDefaultQueryParams>({
            query: params => ({
                url: `/${SERVICE_URL}/getServices`,
                method: REST_API_VERBS.GET,
                params,
            }),

            providesTags: (result = [], error, arg) => [
                ...result.map(({ _id }) => ({ type: 'Service' as const, id: _id })),
                { type: 'PaginatedServices', id: 'LIST' },
                arg.campusId ? { type: 'CampusServices', id: arg.campusId } : 'ServiceList',
                'ServiceList',
                SERVICE_URL
            ],

            transformResponse: (response: IDefaultResponse<IService[]>) => response.data,
        }),

        getServiceById: endpoint.query<IService, string>({
            query: id => `/${SERVICE_URL}/${id}`,

            providesTags: (result, error, id) => [
                { type: 'Service', id },
                SERVICE_URL
            ],

            transformResponse: (response: IDefaultResponse<IService>) => response.data,
        }),

        // Add your endpoints here
    }),
});

// Use exported hook in relevant components
export const {
    useCreateServiceMutation,
    useUpdateServiceMutation,
    useDeleteServiceMutation,
    useGetLatestServiceQuery,
    useGetServiceByIdQuery,
    useGetServicesQuery,
} = servicesServiceSlice;
