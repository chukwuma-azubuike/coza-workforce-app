import { createApi } from '@reduxjs/toolkit/query/react';
import {
    IDefaultQueryParams,
    IDefaultResponse,
    IPermission,
    IRequestPermissionPayload,
    IUpdatePermissionPayload,
    IUser,
    REST_API_VERBS,
} from '../types';
import { fetchUtils } from './fetch-utils';

const SERVICE_URL = 'permissions';

interface IRejectPermission {
    permissionId: IPermission['_id'];
    approverId: IUser['userId'];
}

export const permissionsServiceSlice = createApi({
    reducerPath: SERVICE_URL,

    baseQuery: fetchUtils.baseQuery,

    endpoints: endpoint => ({
        requestPermission: endpoint.mutation<IPermission, IRequestPermissionPayload>({
            query: body => ({
                url: `${SERVICE_URL}/createPermission`,
                method: REST_API_VERBS.POST,
                body,
            }),

            transformResponse: (response: IDefaultResponse<IPermission>) => response.data,
        }),

        updatePermission: endpoint.mutation<IPermission, IUpdatePermissionPayload>({
            query: body => ({
                url: `${SERVICE_URL}/updatePermission/${body._id}`,
                method: REST_API_VERBS.PUT,
                body,
            }),
        }),

        approvePermission: endpoint.mutation<IPermission, IRejectPermission>({
            query: body => ({
                url: `permission/approve/${body.permissionId}/${body.approverId}`,
                method: REST_API_VERBS.PATCH,
                body,
            }),
        }),

        getPermissions: endpoint.query<IPermission[], Omit<IDefaultQueryParams, 'userId'>>({
            query: params => ({ url: `/${SERVICE_URL}/filter`, method: REST_API_VERBS.GET, params }),

            transformResponse: (response: IDefaultResponse<IPermission[]>) => response.data,
        }),

        getPermissionById: endpoint.query<IPermission, IPermission['_id']>({
            query: id => ({ url: `/permission/${id}`, method: REST_API_VERBS.GET }),

            transformResponse: (response: IDefaultResponse<IPermission>) => response.data,
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
