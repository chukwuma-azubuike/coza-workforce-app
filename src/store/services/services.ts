import { createApi } from '@reduxjs/toolkit/query/react';
import { ICreateService, IDefaultResponse, IService, REST_API_VERBS } from '../types';
import { fetchUtils } from './fetch-utils';

const SERVICE_URL = 'service';

type IGetLatestServiceResponse = IDefaultResponse<IService>;

export const servicesServiceSlice = createApi({
    reducerPath: SERVICE_URL,

    baseQuery: fetchUtils.baseQuery,

    tagTypes: ['latestService'],

    refetchOnReconnect: true,
    endpoints: endpoint => ({
        createService: endpoint.mutation<void, ICreateService>({
            query: body => ({
                url: `${SERVICE_URL}/createService`,
                method: REST_API_VERBS.POST,
                body,
            }),
        }),

        updateService: endpoint.mutation<'', ''>({
            query: args => ({
                url: `${SERVICE_URL}/${args}`,
                method: REST_API_VERBS.PUT,
                body: args,
            }),
        }),

        getLatestService: endpoint.query<IService, string>({
            query: campusId => `/${SERVICE_URL}/getLatestServiceByCampusId/${campusId}`,

            transformResponse: (response: IGetLatestServiceResponse) => response.data,

            providesTags: ['latestService'],
        }),

        getServices: endpoint.query<IService[], void>({
            query: () => `/${SERVICE_URL}/getServices`,

            transformResponse: (response: IDefaultResponse<IService[]>) => response.data,
        }),

        getServiceById: endpoint.query<'', ''>({
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
