import { createApi } from '@reduxjs/toolkit/query/react';
import { IDefaultResponse, IScore, IUser, REST_API_VERBS } from '../types';
import { fetchUtils } from './fetch-utils';

const SERVICE_URL = 'score';

export const scoreServiceSlice = createApi({
    reducerPath: SERVICE_URL,

    baseQuery: fetchUtils.baseQuery,

    endpoints: endpoint => ({
        getUserScore: endpoint.query<IScore, IUser['_id']>({
            query: userId => ({
                url: `${SERVICE_URL}/getScoreByUserId/${userId}`,
                method: REST_API_VERBS.GET,
            }),

            transformResponse: (response: IDefaultResponse<IScore>) => response.data,
        }),
        // Add your endpoints here
    }),
});

// Use exported hook in relevant components
export const { useGetUserScoreQuery } = scoreServiceSlice;
