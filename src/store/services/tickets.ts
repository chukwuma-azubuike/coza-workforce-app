import { createApi } from '@reduxjs/toolkit/dist/query/react';
import {
    ICreateTicketPayload,
    IDefaultResponse,
    IDepartment,
    ITicket,
    IUser,
    REST_API_VERBS,
} from '../types';
import { fetchUtils } from './fetch-utils';

const SERVICE_URL = 'ticket';

type ITicketResponse = IDefaultResponse<ITicket>;

type ITicketListResponse = IDefaultResponse<ITicket[]>;

const ticketServiceSlice = createApi({
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
        }),

        updateTicket: endpoint.mutation<ITicket, ITicket>({
            query: body => ({
                url: `/${SERVICE_URL}/updateTicket/${body.ticketId}`,
                method: REST_API_VERBS.PATCH,
                body,
            }),

            transformResponse: (response: ITicketResponse) => response.data,
        }),

        deleteTicket: endpoint.mutation<ITicket, ITicket['ticketId']>({
            query: ticketId => ({
                url: `/${SERVICE_URL}/updateTicket/${ticketId}`,
                method: REST_API_VERBS.DELETE,
            }),

            transformResponse: (response: ITicketResponse) => response.data,
        }),

        retractTicket: endpoint.mutation<ITicket, ITicket['ticketId']>({
            query: ticketId => ({
                url: `/${SERVICE_URL}/retractTicket/${ticketId}`,
                method: REST_API_VERBS.PATCH,
            }),

            transformResponse: (response: ITicketResponse) => response.data,
        }),

        getUserTickets: endpoint.query<ITicket[], IUser['userId']>({
            query: userId => ({
                url: `/${SERVICE_URL}/getUserTickets/${userId}`,
                method: REST_API_VERBS.GET,
            }),

            transformResponse: (response: ITicketListResponse) => response.data,
        }),

        getDepartmentTickets: endpoint.query<ITicket[], IDepartment['_id']>({
            query: departmentId => ({
                url: `/${SERVICE_URL}/getDepartmentTickets/${departmentId}`,
                method: REST_API_VERBS.GET,
            }),

            transformResponse: (response: ITicketListResponse) => response.data,
        }),
    }),
});

export const {
    useGetUserTicketsQuery,
    useCreateTicketMutation,
    useDeleteTicketMutation,
    useUpdateTicketMutation,
    useRetractTicketMutation,
    useLazyGetUserTicketsQuery,
    useGetDepartmentTicketsQuery,
    useLazyGetDepartmentTicketsQuery,
} = ticketServiceSlice;
