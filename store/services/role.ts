import { createApi } from '@reduxjs/toolkit/query/react';
import { IRole, IDefaultResponse } from '../types';
import { fetchUtils } from './fetch-utils';

const SERVICE_URL = 'role';

export const roleServiceSlice = createApi({
    reducerPath: SERVICE_URL,

    baseQuery: fetchUtils.baseQuery,

    refetchOnFocus: true,
    refetchOnReconnect: true,
    refetchOnMountOrArgChange: true,

    endpoints: endpoint => ({
        getRoles: endpoint.query<IRole[], void>({
            query: () => `/${SERVICE_URL}/getRoles`,

            transformResponse: (response: IDefaultResponse<IRole[]>) => response.data,
        }),

        getRoleById: endpoint.query<IRole, IRole['_id']>({
            query: id => `/${SERVICE_URL}/getRoles/${id}`,

            transformResponse: (response: IDefaultResponse<IRole>) => response.data,
        }),

        // Add your endpoints here
    }),
});

// Use exported hook in relevant components
export const { useGetRolesQuery, useGetRoleByIdQuery } = roleServiceSlice;
