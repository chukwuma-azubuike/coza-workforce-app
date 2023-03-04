import { createApi } from '@reduxjs/toolkit/query/react';
import {
    ICampus,
    ICreateTicketPayload,
    IDefaultErrorResponse,
    IDefaultQueryParams,
    IDefaultResponse,
    IDepartment,
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

    refetchOnReconnect: true,

    endpoints: endpoint => ({
        createTicket: endpoint.mutation<ITicket, ICreateTicketPayload>({
            query: body => ({
                url: `/${SERVICE_URL}/createTicket`,
                method: REST_API_VERBS.POST,
                body,
            }),

            transformResponse: (response: ITicketResponse) => response.data,

            transformErrorResponse: (response: IDefaultErrorResponse) => response.message,
        }),

        updateTicket: endpoint.mutation<ITicket, ICreateTicketPayload>({
            query: body => ({
                url: `/${SERVICE_URL}/updateTicket/${body._id}`,
                method: REST_API_VERBS.PATCH,
                body,
            }),

            transformResponse: (response: ITicketResponse) => response.data,
        }),

        contestTicket: endpoint.mutation<ITicket, ITicketUpdatePayload>({
            query: payload => ({
                url: `/${SERVICE_URL}/replyTicketByUser/${payload._id}`,
                method: REST_API_VERBS.PATCH,
                body: { userId: payload.userId, comment: payload.comment },
            }),

            transformResponse: (response: IDefaultResponse<ITicket>) => response.data,
        }),

        replyContestTicket: endpoint.mutation<ITicket, ITicketUpdatePayload>({
            query: payload => ({
                url: `/${SERVICE_URL}/replyTicketByQCTeam/${payload._id}`,
                method: REST_API_VERBS.PATCH,
                body: { userId: payload.userId, comment: payload.comment },
            }),

            transformResponse: (response: IDefaultResponse<ITicket>) => response.data,
        }),

        deleteTicket: endpoint.mutation<ITicket, ITicket['_id']>({
            query: ticketId => ({
                url: `/${SERVICE_URL}/updateTicket/${ticketId}`,
                method: REST_API_VERBS.DELETE,
            }),

            transformResponse: (response: ITicketResponse) => response.data,
        }),

        retractTicket: endpoint.mutation<ITicket, ITicket['_id']>({
            query: ticketId => ({
                url: `/${SERVICE_URL}/retractTicket/${ticketId}`,
                method: REST_API_VERBS.PATCH,
            }),

            transformResponse: (response: ITicketResponse) => response.data,
        }),

        getTickets: endpoint.query<ITicket[], IDefaultQueryParams>({
            query: params => ({
                url: `/${SERVICE_URL}/filter/`,
                method: REST_API_VERBS.GET,
                params,
            }),

            transformResponse: (response: ITicketListResponse) => response.data,
        }),

        getUserTickets: endpoint.query<ITicket[], IUser['userId']>({
            query: userId => ({
                url: `/${SERVICE_URL}/getUserTickets/${userId}`,
                method: REST_API_VERBS.GET,
            }),

            transformResponse: (response: ITicketListResponse) => response.data,
        }),

        getTicketById: endpoint.query<ITicket, ITicket['_id']>({
            query: ticketId => ({
                url: `/${SERVICE_URL}/getTicket/${ticketId}`,
                method: REST_API_VERBS.GET,
            }),

            transformResponse: (response: IDefaultResponse<ITicket>) => response.data,
        }),

        getDepartmentTickets: endpoint.query<ITicket[], IDepartment['_id']>({
            query: departmentId => ({
                url: `/${SERVICE_URL}/getDepartmentTickets/${departmentId}`,
                method: REST_API_VERBS.GET,
            }),

            transformResponse: (response: ITicketListResponse) => response.data,
        }),

        getCampusTickets: endpoint.query<ITicket[], ICampus['_id']>({
            query: campusId => ({
                url: `/${SERVICE_URL}/getCampusTickets/${campusId}`,
                method: REST_API_VERBS.GET,
            }),

            transformResponse: (response: ITicketListResponse) => response.data,
        }),

        getTicketCategories: endpoint.query<ITicketCategory[], void>({
            query: () => ({
                url: `/${SERVICE_URL}/category/getCategories`,
                method: REST_API_VERBS.GET,
            }),

            transformResponse: (response: IDefaultResponse<ITicketCategory[]>) => response.data,
        }),
    }),
});

export const {
    useGetTicketsQuery,
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
    useLazyGetDepartmentTicketsQuery,
} = ticketServiceSlice;
