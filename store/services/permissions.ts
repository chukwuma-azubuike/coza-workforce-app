import { createApi } from '@reduxjs/toolkit/query/react';
import {
    IDefaultQueryParams,
    IDefaultResponse,
    IPermission,
    IPermissionCategory,
    IReportDownloadPayload,
    IRequestPermissionPayload,
    IUser,
    REST_API_VERBS,
} from '../types';
import { fetchUtils } from './fetch-utils';

const SERVICE_URL = 'permissions';

interface IDeclinePermission {
    permissionId: IPermission['_id'];
    declinerId: IUser['userId'];
    comment: string;
}
interface IApprovePermission {
    permissionId: IPermission['_id'];
    approverId: IUser['userId'];
    comment: string;
}

interface IPermissionReportPayload extends IReportDownloadPayload {
    startDate?: number;
    endDate?: number;
}

export const permissionsServiceSlice = createApi({
    reducerPath: SERVICE_URL,

    baseQuery: fetchUtils.baseQuery,

    tagTypes: [SERVICE_URL],

    endpoints: endpoint => ({
        requestPermission: endpoint.mutation<IPermission, IRequestPermissionPayload>({
            query: body => ({
                url: `/${SERVICE_URL}/createPermission`,
                method: REST_API_VERBS.POST,
                body,
            }),

            transformResponse: (response: IDefaultResponse<IPermission>) => response.data,
        }),

        approvePermission: endpoint.mutation<IPermission, IApprovePermission>({
            query: ({ permissionId, approverId, ...patch }) => ({
                url: `/${SERVICE_URL}/approve/${permissionId}/${approverId}`,
                method: REST_API_VERBS.PATCH,
                body: patch,
            }),

            invalidatesTags: [SERVICE_URL],

            transformResponse: (response: IDefaultResponse<IPermission>) => response.data,
        }),

        declinePermission: endpoint.mutation<IPermission, IDeclinePermission>({
            query: ({ permissionId, declinerId, comment }) => ({
                url: `/${SERVICE_URL}/reject/${permissionId}/${declinerId}`,
                method: REST_API_VERBS.PATCH,
                body: { comment },
            }),

            invalidatesTags: [SERVICE_URL],

            transformResponse: (response: IDefaultResponse<IPermission>) => response.data,
        }),

        getPermissions: endpoint.query<IPermission[], Omit<IDefaultQueryParams, 'userId'>>({
            query: params => ({ url: `/${SERVICE_URL}/filter`, method: REST_API_VERBS.GET, params }),

            transformResponse: (response: IDefaultResponse<IPermission[]>) => response.data,
        }),

        getPermissionById: endpoint.query<IPermission, IPermission['_id']>({
            query: id => ({ url: `/${SERVICE_URL}/${id}`, method: REST_API_VERBS.GET }),

            transformResponse: (response: IDefaultResponse<IPermission>) => response.data,
        }),

        getPermissionCategories: endpoint.query<IPermissionCategory[], void>({
            query: () => ({ url: `/permission-categories`, method: REST_API_VERBS.GET }),

            transformResponse: (response: IDefaultResponse<IPermissionCategory[]>) => response.data,
        }),

        getPermissionsReportForDownload: endpoint.query<any[], IPermissionReportPayload>({
            query: params => ({
                url: `${SERVICE_URL}/download`,
                method: REST_API_VERBS.GET,
                params,
            }),

            transformResponse: (res: IDefaultResponse<any[]>) => res.data,
        }),

        // Add your endpoints here
    }),
});

// Use exported hook in relevant components
export const {
    useGetPermissionsQuery,
    useGetPermissionByIdQuery,
    useRequestPermissionMutation,
    useApprovePermissionMutation,
    useDeclinePermissionMutation,
    useGetPermissionCategoriesQuery,
    useGetPermissionsReportForDownloadQuery,
} = permissionsServiceSlice;
