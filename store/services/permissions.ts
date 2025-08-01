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

    tagTypes: [
        SERVICE_URL,
        'Permission',
        'UserPermissions',
        'TeamPermissions',
        'CampusPermissions',
        'LeaderPermissions',
    ],

    refetchOnFocus: true,
    refetchOnReconnect: true,
    refetchOnMountOrArgChange: true,

    endpoints: endpoint => ({
        requestPermission: endpoint.mutation<IPermission, IRequestPermissionPayload>({
            query: body => ({
                url: `/${SERVICE_URL}/createPermission`,
                method: REST_API_VERBS.POST,
                body,
            }),

            invalidatesTags: (result, error, { requestor, campusId }) => [
                { type: 'UserPermissions', id: requestor },
                { type: 'CampusPermissions', id: campusId },
                'TeamPermissions',
                'LeaderPermissions',
                'Permission',
                SERVICE_URL,
            ],

            transformResponse: (response: IDefaultResponse<IPermission>) => response.data,
        }),

        approvePermission: endpoint.mutation<IPermission, IApprovePermission>({
            query: ({ permissionId, approverId, ...patch }) => ({
                url: `/${SERVICE_URL}/approve/${permissionId}/${approverId}`,
                method: REST_API_VERBS.PATCH,
                body: patch,
            }),

            invalidatesTags: result => [
                { type: 'Permission', id: result?._id },
                'TeamPermissions',
                'CampusPermissions',
                'LeaderPermissions',
                SERVICE_URL,
            ],

            transformResponse: (response: IDefaultResponse<IPermission>) => response.data,
        }),

        declinePermission: endpoint.mutation<IPermission, IDeclinePermission>({
            query: ({ permissionId, declinerId, comment }) => ({
                url: `/${SERVICE_URL}/reject/${permissionId}/${declinerId}`,
                method: REST_API_VERBS.PATCH,
                body: { comment },
            }),

            invalidatesTags: result => [
                { type: 'Permission', id: result?._id },
                'TeamPermissions',
                'CampusPermissions',
                'LeaderPermissions',
                SERVICE_URL,
            ],

            transformResponse: (response: IDefaultResponse<IPermission>) => response.data,
        }),

        getPermissions: endpoint.query<IPermission[], Omit<IDefaultQueryParams, 'userId'>>({
            query: params => ({
                url: `/${SERVICE_URL}/filter`,
                method: REST_API_VERBS.GET,
                params,
            }),

            providesTags: (result = [], error, arg) => [
                ...result.map(({ _id }) => ({ type: 'Permission' as const, id: _id })),
                arg.requestor ? { type: 'UserPermissions', id: arg.requestor } : 'Permission',
                arg.departmentId ? 'TeamPermissions' : 'Permission',
                arg.campusId ? 'CampusPermissions' : 'Permission',
                arg.roleId ? 'LeaderPermissions' : 'Permission',
                SERVICE_URL,
            ],

            transformResponse: (response: IDefaultResponse<IPermission[]>) => response.data,
        }),

        getPermissionById: endpoint.query<IPermission, IPermission['_id']>({
            query: id => ({
                url: `/${SERVICE_URL}/${id}`,
                method: REST_API_VERBS.GET,
            }),

            providesTags: (result, error, id) => [{ type: 'Permission', id }, SERVICE_URL],

            transformResponse: (response: IDefaultResponse<IPermission>) => response.data,
        }),

        getPermissionCategories: endpoint.query<IPermissionCategory[], void>({
            query: () => ({
                url: `/permission-categories`,
                method: REST_API_VERBS.GET,
            }),

            providesTags: [SERVICE_URL],

            transformResponse: (response: IDefaultResponse<IPermissionCategory[]>) => response.data,
        }),

        getPermissionsReportForDownload: endpoint.query<any[], IPermissionReportPayload>({
            query: params => ({
                url: `${SERVICE_URL}/download`,
                method: REST_API_VERBS.GET,
                params,
            }),

            providesTags: [SERVICE_URL],

            transformResponse: (res: IDefaultResponse<any[]>) => res.data,
        }),
    }),
});

// Use exported hook in relevant components
export const {
    useGetPermissionsQuery,
    useLazyGetPermissionsQuery,
    useGetPermissionByIdQuery,
    useRequestPermissionMutation,
    useApprovePermissionMutation,
    useDeclinePermissionMutation,
    useGetPermissionCategoriesQuery,
    useGetPermissionsReportForDownloadQuery,
} = permissionsServiceSlice;
