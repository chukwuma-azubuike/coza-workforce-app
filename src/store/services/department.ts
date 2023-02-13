import { createApi } from '@reduxjs/toolkit/query/react';
import {
    ICampus,
    IDefaultResponse,
    IDepartment,
    IRequestDepartmentPayload,
    REST_API_VERBS,
} from '../types';
import { fetchUtils } from './fetch-utils';

const SERVICE_URL = 'department';

export const departmentServiceSlice = createApi({
    reducerPath: SERVICE_URL,

    baseQuery: fetchUtils.baseQuery,

    endpoints: endpoint => ({
        createDepartment: endpoint.mutation<
            IDepartment,
            IRequestDepartmentPayload
        >({
            query: body => ({
                url: `${SERVICE_URL}/createDepartment`,
                method: REST_API_VERBS.POST,
                body,
            }),

            transformResponse: (response: IDefaultResponse<IDepartment>) =>
                response.data,
        }),

        updateDepartment: endpoint.mutation<IDepartment, IDepartment>({
            query: args => ({
                url: `${SERVICE_URL}/updateDepartment/${args._id}`,
                method: REST_API_VERBS.PUT,
                body: args,
            }),

            transformResponse: (response: IDefaultResponse<IDepartment>) =>
                response.data,
        }),

        getDepartmentsByCampusId: endpoint.query<IDepartment[], ICampus['id']>({
            query: id => `/${SERVICE_URL}/getDepartmentByCampus/${id}`,

            transformResponse: (response: IDefaultResponse<IDepartment[]>) =>
                response.data,
        }),

        getDepartments: endpoint.query<IDepartment[], void>({
            query: id => `/${SERVICE_URL}/getDepartments/${id}`,

            transformResponse: (response: IDefaultResponse<IDepartment[]>) =>
                response.data,
        }),

        getDepartmentById: endpoint.query<IDepartment, IDepartment['_id']>({
            query: id => `/${SERVICE_URL}/getDepartment/${id}`,

            transformResponse: (response: IDefaultResponse<IDepartment>) =>
                response.data,
        }),

        // Add your endpoints here
    }),
});

// Use exported hook in relevant components
export const {
    useGetDepartmentsQuery,
    useGetDepartmentByIdQuery,
    useUpdateDepartmentMutation,
    useCreateDepartmentMutation,
    useGetDepartmentsByCampusIdQuery,
} = departmentServiceSlice;
