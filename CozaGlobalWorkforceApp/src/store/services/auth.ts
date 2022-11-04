import { createApi } from '@reduxjs/toolkit/query/react';
import { ILogin, IRegister } from '../types';
import { fetchUtils } from './fetch-utils';

const SERVICE_URL = 'auth';

export const authServiceSlice = createApi({
    reducerPath: SERVICE_URL,

    baseQuery: fetchUtils.baseQuery,

    endpoints: endpoint => ({
        login: endpoint.mutation<void, ILogin>({
            query: body => ({
                url: `${SERVICE_URL}/login`,
                method: 'POST',
                body,
            }),
        }),

        register: endpoint.mutation<void, IRegister>({
            query: body => ({
                url: `${SERVICE_URL}/register`,
                method: 'POST',
                body,
            }),
        }),
        // Add your endpoints here
    }),
});

// Use exported hook in relevant components
export const { useLoginMutation, useRegisterMutation } = authServiceSlice;
