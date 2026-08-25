import { createApi } from '@reduxjs/toolkit/query/react';
import { IDefaultResponse, IGroup, IGroupAuditEntry, IGroupSummary, REST_API_VERBS } from '../types';
import type { IGroupListItem, IGroupsListResponse } from '../types';
import { fetchUtils } from './fetch-utils';

const SERVICE_URL = 'group';

export interface ICreateGroupPayload {
    name: string;
    description?: string;
    groupHeads?: string[];
    departments?: string[];
}

export interface IUpdateGroupPayload {
    name?: string;
    description?: string;
    isActive?: boolean;
}

export interface ICreateGroupResponse {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    isActive?: boolean;
    groupHeadsAssigned: { userId: string; name: string }[];
    groupHeadsSkipped: { userId: string; reason: string }[];
    departmentsAssigned: { departmentId: string; name: string }[];
    departmentsSkipped: { departmentId: string; reason: string }[];
}

export interface IAssignGroupHeadPayload {
    userId: string;
}

export interface IAssignDepartmentPayload {
    departmentId: string;
}

export interface IReassignDepartmentPreview {
    affectedWorkers: number;
    inFlightReports: number;
    pendingPermissions: number;
}

export const groupServiceSlice = createApi({
    reducerPath: SERVICE_URL,

    baseQuery: fetchUtils.baseQueryWithTokenRefresh,

    refetchOnFocus: true,
    refetchOnReconnect: true,
    refetchOnMountOrArgChange: true,

    tagTypes: ['Group', 'GroupSummary'],

    endpoints: endpoint => ({
        // ─── Admin: list & CRUD ───────────────────────────────────────
        getGroups: endpoint.query<IGroupListItem[], { q?: string; isActive?: boolean; page?: number; pageSize?: number }>({
            query: params => ({ url: `/${SERVICE_URL}`, params }),
            transformResponse: (res: IDefaultResponse<IGroupsListResponse>) => res?.data?.groups ?? [],
            providesTags: ['Group'],
        }),

        getGroupById: endpoint.query<IGroup, string>({
            query: id => ({ url: `/${SERVICE_URL}/${id}` }),
            transformResponse: (res: IDefaultResponse<IGroup>) => res?.data,
            providesTags: (_result, _err, id) => [{ type: 'Group', id }],
        }),

        createGroup: endpoint.mutation<ICreateGroupResponse, ICreateGroupPayload>({
            query: body => ({ url: `/${SERVICE_URL}`, method: REST_API_VERBS.POST, body }),
            transformResponse: (res: IDefaultResponse<ICreateGroupResponse>) => res?.data,
            invalidatesTags: ['Group'],
        }),

        updateGroup: endpoint.mutation<IGroup, { id: string } & IUpdateGroupPayload>({
            query: ({ id, ...body }) => ({
                url: `/${SERVICE_URL}/${id}`,
                method: REST_API_VERBS.PUT,
                body,
            }),
            transformResponse: (res: IDefaultResponse<IGroup>) => res?.data,
            invalidatesTags: (_result, _err, { id }) => [{ type: 'Group', id }, 'Group'],
        }),

        deactivateGroup: endpoint.mutation<void, string>({
            query: id => ({ url: `/${SERVICE_URL}/${id}`, method: REST_API_VERBS.DELETE }),
            invalidatesTags: ['Group'],
        }),

        // ─── GH's own Group ───────────────────────────────────────────
        getGroupForCurrentUser: endpoint.query<IGroup, void>({
            query: () => ({ url: `/${SERVICE_URL}/me` }),
            transformResponse: (res: IDefaultResponse<IGroup>) => res?.data,
            providesTags: ['GroupSummary'],
        }),

        getGroupSummary: endpoint.query<IGroupSummary, void>({
            query: () => ({ url: `/gh/group/summary` }),
            transformResponse: (res: IDefaultResponse<IGroupSummary>) => res?.data,
            providesTags: ['GroupSummary'],
        }),

        // ─── Group Head assignment ────────────────────────────────────
        assignGroupHead: endpoint.mutation<void, { groupId: string } & IAssignGroupHeadPayload>({
            query: ({ groupId, ...body }) => ({
                url: `/${SERVICE_URL}/${groupId}/heads`,
                method: REST_API_VERBS.POST,
                body,
            }),
            invalidatesTags: (_result, _err, { groupId }) => [{ type: 'Group', id: groupId }],
        }),

        removeGroupHead: endpoint.mutation<void, { groupId: string; userId: string }>({
            query: ({ groupId, userId }) => ({
                url: `/${SERVICE_URL}/${groupId}/heads/${userId}`,
                method: REST_API_VERBS.DELETE,
            }),
            invalidatesTags: (_result, _err, { groupId }) => [{ type: 'Group', id: groupId }],
        }),

        // ─── Department assignment ────────────────────────────────────
        assignDepartment: endpoint.mutation<void, { groupId: string } & IAssignDepartmentPayload>({
            query: ({ groupId, ...body }) => ({
                url: `/${SERVICE_URL}/${groupId}/departments`,
                method: REST_API_VERBS.POST,
                body,
            }),
            invalidatesTags: (_result, _err, { groupId }) => [{ type: 'Group', id: groupId }],
        }),

        removeDepartment: endpoint.mutation<void, { groupId: string; departmentId: string }>({
            query: ({ groupId, departmentId }) => ({
                url: `/${SERVICE_URL}/${groupId}/departments/${departmentId}`,
                method: REST_API_VERBS.DELETE,
            }),
            invalidatesTags: (_result, _err, { groupId }) => [{ type: 'Group', id: groupId }],
        }),

        reassignDepartmentPreview: endpoint.mutation<
            IReassignDepartmentPreview,
            { groupId: string; departmentId: string }
        >({
            query: ({ groupId, departmentId }) => ({
                url: `/${SERVICE_URL}/${groupId}/departments/${departmentId}/reassign-preview`,
                method: REST_API_VERBS.POST,
            }),
            transformResponse: (res: IDefaultResponse<IReassignDepartmentPreview>) => res?.data,
        }),

        // ─── Audit log ────────────────────────────────────────────────
        getGroupAuditLog: endpoint.query<IGroupAuditEntry[], string>({
            query: groupId => ({ url: `/${SERVICE_URL}/${groupId}/audit` }),
            transformResponse: (res: IDefaultResponse<IGroupAuditEntry[]>) => res?.data,
        }),
    }),
});

export const {
    useGetGroupsQuery,
    useGetGroupByIdQuery,
    useCreateGroupMutation,
    useUpdateGroupMutation,
    useDeactivateGroupMutation,
    useGetGroupForCurrentUserQuery,
    useGetGroupSummaryQuery,
    useAssignGroupHeadMutation,
    useRemoveGroupHeadMutation,
    useAssignDepartmentMutation,
    useRemoveDepartmentMutation,
    useReassignDepartmentPreviewMutation,
    useGetGroupAuditLogQuery,
} = groupServiceSlice;
