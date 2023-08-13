import { createApi } from '@reduxjs/toolkit/query/react';
import { ICampus, IDefaultResponse, IGHCampus, REST_API_VERBS } from '../types';
import { fetchUtils } from './fetch-utils';

const SERVICE_URL = 'campus';

export interface ICreateCampusPayload {
    campusName: string;
    description: string;
    address: string;
    LGA: string;
    state: string;
    country: string;
    location: {
        coordinates: {};
    };
    dateOfBirth: string;
}

export const campusServiceSlice = createApi({
    reducerPath: SERVICE_URL,

    baseQuery: fetchUtils.baseQuery,

    endpoints: endpoint => ({
        createCampus: endpoint.mutation<ICampus, ICreateCampusPayload>({
            query: body => ({
                url: `${SERVICE_URL}/createCampus`,
                method: REST_API_VERBS.POST,
                body,
            }),

            transformResponse: (response: IDefaultResponse<ICampus>) => response.data,
        }),

        updateCampus: endpoint.mutation<ICampus, ICampus>({
            query: campus => ({
                url: `${SERVICE_URL}/updateCampus/${campus._id}`,
                method: REST_API_VERBS.PUT,
                body: campus,
            }),

            transformResponse: (response: IDefaultResponse<ICampus>) => response.data,
        }),

        getCampuses: endpoint.query<ICampus[], void>({
            query: () => `/${SERVICE_URL}/getCampuses`,

            transformResponse: (response: IDefaultResponse<ICampus[]>) => response.data,
        }),

        getCampusById: endpoint.query<ICampus, ICampus['_id']>({
            query: id => `/${SERVICE_URL}/getCampus/${id}`,

            transformResponse: (response: IDefaultResponse<ICampus>) => response.data,
        }),

        getGHCampusById: endpoint.query<IGHCampus, ICampus['_id']>({
            query: id => `/users/ghCampuses/${id}`,

            transformResponse: (response: IDefaultResponse<IGHCampus>) => response.data,
        }),

        // Add your endpoints here
    }),
});

// Use exported hook in relevant components
export const {
    useGetCampusesQuery,
    useGetCampusByIdQuery,
    useGetGHCampusByIdQuery,
    useUpdateCampusMutation,
    useCreateCampusMutation,
} = campusServiceSlice;
