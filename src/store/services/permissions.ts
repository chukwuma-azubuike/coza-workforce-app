import { createApi } from '@reduxjs/toolkit/query/react';
import { IDefaultResponse, IPermission, IRequestPermissionPayload, REST_API_VERBS } from '../types';
import { fetchUtils } from './fetch-utils';

const SERVICE_URL = 'permissions';

export const permissionsServiceSlice = createApi({
    reducerPath: SERVICE_URL,

    baseQuery: fetchUtils.baseQuery,

    endpoints: endpoint => ({
        requestPermission: endpoint.mutation<IPermission, IRequestPermissionPayload>({
            query: body => ({
                url: SERVICE_URL,
                method: REST_API_VERBS.POST,
                body,
            }),

            transformResponse: (response: IDefaultResponse<IPermission>) => response.data,
        }),

        updatePermission: endpoint.mutation<IPermission, IPermission>({
            query: args => ({
                url: `${SERVICE_URL}/${args._id}`,
                method: REST_API_VERBS.PUT,
                body: args,
            }),
        }),

        getPermissions: endpoint.query<IPermission[], IPermission[]>({
            query: id => `/${SERVICE_URL}/${id}`,
        }),

        getPermissionById: endpoint.query<IPermission, IPermission>({
            query: id => `/${SERVICE_URL}/${id}`,
        }),

        // Add your endpoints here
    }),
});

// Use exported hook in relevant components
export const {
    useGetPermissionsQuery,
    useGetPermissionByIdQuery,
    useUpdatePermissionMutation,
    useRequestPermissionMutation,
} = permissionsServiceSlice;
