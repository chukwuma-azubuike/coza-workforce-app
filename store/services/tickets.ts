import { createApi } from '@reduxjs/toolkit/query/react';
import {
    ICampus,
    ICreateTicketPayload,
    IDefaultErrorResponse,
    IDefaultQueryParams,
    IDefaultResponse,
    IDepartment,
    IReportDownloadPayload,
    ITicket,
    ITicketCategory,
    ITicketUpdatePayload,
    IUser,
    REST_API_VERBS,
} from '../types';
import { fetchUtils } from './fetch-utils';

const SERVICE_URL = 'ticket';
type ITicketResponse = IDefaultResponse<ITicket>;
type ITicketListResponse = IDefaultResponse<ITicket[]>;

export const ticketServiceSlice = createApi({
    reducerPath: SERVICE_URL,
    baseQuery: fetchUtils.baseQuery,

    tagTypes: [SERVICE_URL, 'Ticket', 'UserTickets', 'DepartmentTickets', 'CampusTickets', 'TicketCategories'],

    refetchOnFocus: true,
    refetchOnReconnect: true,
    refetchOnMountOrArgChange: true,

    endpoints: endpoint => ({
        createTicket: endpoint.mutation<ITicket, ICreateTicketPayload>({
            query: body => ({
                url: `/${SERVICE_URL}/createTicket`,
                method: REST_API_VERBS.POST,
                body,
            }),

            invalidatesTags: (result, error, { userId, departmentId, campusId }) => [
                { type: 'UserTickets', id: userId },
                { type: 'DepartmentTickets', id: departmentId },
                { type: 'CampusTickets', id: campusId },
                'Ticket',
                SERVICE_URL,
            ],

            transformResponse: (response: ITicketResponse) => response.data,
            transformErrorResponse: (response: IDefaultErrorResponse) => response.message,
        }),

        updateTicket: endpoint.mutation<ITicket, ICreateTicketPayload>({
            query: body => ({
                url: `/${SERVICE_URL}/updateTicket/${body._id}`,
                method: REST_API_VERBS.PATCH,
                body,
            }),

            invalidatesTags: (result, error, { _id, userId, departmentId, campusId }) => [
                { type: 'Ticket', id: _id },
                { type: 'UserTickets', id: userId },
                { type: 'DepartmentTickets', id: departmentId },
                { type: 'CampusTickets', id: campusId },
                SERVICE_URL,
            ],

            transformResponse: (response: ITicketResponse) => response.data,
        }),

        contestTicket: endpoint.mutation<ITicket, ITicketUpdatePayload>({
            query: payload => ({
                url: `/${SERVICE_URL}/replyTicketByUser/${payload._id}`,
                method: REST_API_VERBS.PATCH,
                body: { userId: payload.userId, comment: payload.comment },
            }),

            invalidatesTags: (result, error, { _id }) => [{ type: 'Ticket', id: _id }, SERVICE_URL],

            transformResponse: (response: IDefaultResponse<ITicket>) => response.data,
        }),

        replyContestTicket: endpoint.mutation<ITicket, ITicketUpdatePayload>({
            query: payload => ({
                url: `/${SERVICE_URL}/replyTicketByQCTeam/${payload._id}`,
                method: REST_API_VERBS.PATCH,
                body: { userId: payload.userId, comment: payload.comment },
            }),

            invalidatesTags: (result, error, { _id }) => [{ type: 'Ticket', id: _id }, SERVICE_URL],

            transformResponse: (response: IDefaultResponse<ITicket>) => response.data,
        }),

        deleteTicket: endpoint.mutation<ITicket, ITicket['_id']>({
            query: ticketId => ({
                url: `/${SERVICE_URL}/updateTicket/${ticketId}`,
                method: REST_API_VERBS.DELETE,
            }),

            invalidatesTags: result => [
                { type: 'Ticket', id: result?._id },
                'UserTickets',
                'DepartmentTickets',
                'CampusTickets',
                SERVICE_URL,
            ],

            transformResponse: (response: ITicketResponse) => response.data,
        }),

        retractTicket: endpoint.mutation<ITicket, ITicket['_id']>({
            query: ticketId => ({
                url: `/${SERVICE_URL}/retractTicket/${ticketId}`,
                method: REST_API_VERBS.PATCH,
            }),

            invalidatesTags: result => [
                { type: 'Ticket', id: result?._id },
                'UserTickets',
                'DepartmentTickets',
                'CampusTickets',
                SERVICE_URL,
            ],

            transformResponse: (response: ITicketResponse) => response.data,
        }),

        getTickets: endpoint.query<ITicket[], IDefaultQueryParams>({
            query: params => ({
                url: `/${SERVICE_URL}/filter`,
                method: REST_API_VERBS.GET,
                params,
            }),

            providesTags: (result = [], error, arg) => [
                ...result.map(({ _id }) => ({ type: 'Ticket' as const, id: _id })),
                arg.userId ? { type: 'UserTickets', id: arg.userId } : 'Ticket',
                arg.departmentId ? { type: 'DepartmentTickets', id: arg.departmentId } : 'Ticket',
                arg.campusId ? { type: 'CampusTickets', id: arg.campusId } : 'Ticket',
                SERVICE_URL,
            ],

            transformResponse: (response: ITicketListResponse) => response.data,
        }),

        getUserTickets: endpoint.query<ITicket[], IUser['userId']>({
            query: userId => ({
                url: `/${SERVICE_URL}/getUserTickets/${userId}`,
                method: REST_API_VERBS.GET,
            }),

            providesTags: (result = []) => [
                ...result.map(({ _id }) => ({ type: 'Ticket' as const, id: _id })),
                { type: 'UserTickets', id: result[0]?.user?._id },
                SERVICE_URL,
            ],

            transformResponse: (response: ITicketListResponse) => response.data,
        }),

        getTicketById: endpoint.query<ITicket, ITicket['_id']>({
            query: ticketId => ({
                url: `/${SERVICE_URL}/getTicket/${ticketId}`,
                method: REST_API_VERBS.GET,
            }),

            providesTags: result => [{ type: 'Ticket', id: result?._id }, SERVICE_URL],

            transformResponse: (response: IDefaultResponse<ITicket>) => response.data,
        }),

        getDepartmentTickets: endpoint.query<ITicket[], IDepartment['_id']>({
            query: departmentId => ({
                url: `/${SERVICE_URL}/getDepartmentTickets/${departmentId}`,
                method: REST_API_VERBS.GET,
            }),

            providesTags: (result = []) => [
                ...result.map(({ _id }) => ({ type: 'Ticket' as const, id: _id })),
                { type: 'DepartmentTickets', id: result[0]?.department?._id },
                SERVICE_URL,
            ],

            transformResponse: (response: ITicketListResponse) => response.data,
        }),

        getCampusTickets: endpoint.query<ITicket[], ICampus['_id']>({
            query: campusId => ({
                url: `/${SERVICE_URL}/getCampusTickets/${campusId}`,
                method: REST_API_VERBS.GET,
            }),

            providesTags: (result = []) => [
                ...result.map(({ _id }) => ({ type: 'Ticket' as const, id: _id })),
                { type: 'CampusTickets', id: result[0]?.campus?._id },
                SERVICE_URL,
            ],

            transformResponse: (response: ITicketListResponse) => response.data,
        }),

        getCampusTicketReport: endpoint.query<number, { serviceId: string; campusId: string }>({
            query: ({ campusId, serviceId }) => ({
                url: `/${SERVICE_URL}/getCampusTicketReport/${serviceId}/${campusId}`,
                method: REST_API_VERBS.GET,
            }),

            providesTags: (result, error, { campusId }) => [{ type: 'CampusTickets', id: campusId }, SERVICE_URL],

            transformResponse: (response: IDefaultResponse<number>) => response.data,
        }),

        getTicketCategories: endpoint.query<ITicketCategory[], void>({
            query: () => ({
                url: `/${SERVICE_URL}/category/getCategories`,
                method: REST_API_VERBS.GET,
            }),

            providesTags: ['TicketCategories', SERVICE_URL],

            transformResponse: (response: IDefaultResponse<ITicketCategory[]>) => response.data,
        }),

        getTicketsReportForDownload: endpoint.query<any[], IReportDownloadPayload>({
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

export const {
    useGetTicketsQuery,
    useLazyGetTicketsQuery,
    useGetTicketByIdQuery,
    useGetUserTicketsQuery,
    useCreateTicketMutation,
    useDeleteTicketMutation,
    useUpdateTicketMutation,
    useRetractTicketMutation,
    useGetCampusTicketsQuery,
    useContestTicketMutation,
    useLazyGetUserTicketsQuery,
    useGetTicketCategoriesQuery,
    useGetDepartmentTicketsQuery,
    useReplyContestTicketMutation,
    useGetCampusTicketReportQuery,
    useLazyGetDepartmentTicketsQuery,
    useGetTicketsReportForDownloadQuery,
    useLazyGetTicketsReportForDownloadQuery,
} = ticketServiceSlice;
