import { createApi } from '@reduxjs/toolkit/query/react';
import { ITicket, IUser, REST_API_VERBS } from '../types';
import { fetchUtils } from './fetch-utils';

const SERVICE_URL = 'compliance';

export const complianceServiceSlice = createApi({
    reducerPath: SERVICE_URL,

    baseQuery: fetchUtils.baseQuery,

    endpoints: endpoint => ({
        // createTicket: endpoint.mutation<void, ITicket>({
        //     query: body => ({
        //         url: SERVICE_URL,
        //         method: REST_API_VERBS.POST,
        //         body,
        //     }),
        // }),
        // updateTicket: endpoint.mutation<void, ITicket>({
        //     query: args => ({
        //         url: `${SERVICE_URL}/${args.ticketId}`,
        //         method: REST_API_VERBS.PUT,
        //         body: args,
        //     }),
        // }),
        // getTicketList: endpoint.query<void, Pick<IUser, 'userId'>>({
        //     query: id => `/${SERVICE_URL}/${id}`,
        // }),
        // Add your endpoints here
    }),
});

// Use exported hook in relevant components
export const {
    // useCreateTicketMutation,
    // useGetTicketListQuery,
    // useUpdateTicketMutation,
} = complianceServiceSlice;
