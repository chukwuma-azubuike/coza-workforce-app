import { createApi } from '@reduxjs/toolkit/query/react';
import { ICreateService, IDefaultQueryParams, IDefaultResponse, IService, REST_API_VERBS, ICampus } from '../types';
import { fetchUtils } from './fetch-utils';

const SERVICE_URL = 'service';

type IGetLatestServiceResponse = IDefaultResponse<IService>;

export const servicesServiceSlice = createApi({
    reducerPath: SERVICE_URL,

    baseQuery: fetchUtils.baseQuery,

    tagTypes: ['latestService'],

    refetchOnReconnect: true,
    endpoints: endpoint => ({
        createService: endpoint.mutation<IService, ICreateService>({
            query: body => ({
                url: `${SERVICE_URL}/createService`,
                method: REST_API_VERBS.POST,
                body,
            }),
        }),

        updateService: endpoint.mutation<void, ICreateService>({
            query: args => ({
                url: `${SERVICE_URL}/service/updateService${args._id}`,
                method: REST_API_VERBS.PUT,
                body: args,
            }),
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

            transformResponse: (response: IDefaultResponse<IService[]>) => response.data,
        }),

        getServiceById: endpoint.query<void, void>({
            query: id => `/${SERVICE_URL}/${id}`,
        }),

        getServicesByCampusId: endpoint.query<IService[], ICampus['_id'] | undefined>({
            query: campusId => `/${SERVICE_URL}/getServices/${campusId}`,

            transformResponse: (response: IDefaultResponse<IService[]>) => response.data,
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
    useGetServicesByCampusIdQuery,
} = servicesServiceSlice;
