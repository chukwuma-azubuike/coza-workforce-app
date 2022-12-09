import { createApi } from '@reduxjs/toolkit/query/react';
import { fetchUtils } from './fetch-utils';

const SERVICE_URL = 'services';

export const servicesServiceSlice = createApi({
    reducerPath: SERVICE_URL,

    baseQuery: fetchUtils.baseQuery,

    refetchOnReconnect: true,
    endpoints: endpoint => ({
        createService: endpoint.mutation<'', ''>({
            query: body => ({
                url: SERVICE_URL,
                method: 'POST',
                body,
            }),
        }),

        updateService: endpoint.mutation<'', ''>({
            query: args => ({
                url: `${SERVICE_URL}/${args}`,
                method: 'PUT',
                body: args,
            }),
        }),

        getLatestService: endpoint.query<''[], ''>({
            query: campusId => `/${SERVICE_URL}/${campusId}`,
        }),

        getServiceList: endpoint.query<''[], ''[]>({
            query: id => `/${SERVICE_URL}/${id}`,
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
    useGetServiceListQuery,
} = servicesServiceSlice;
