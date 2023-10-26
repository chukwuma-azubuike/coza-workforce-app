import { createApi } from '@reduxjs/toolkit/query/react';
import { IDefaultResponse, REST_API_VERBS, IScoreMapping, IDefaultQueryParams } from '../types';
import { fetchUtils } from './fetch-utils';

const SERVICE_URL = 'scoreMapping';

export const scoreMappingServiceSlice = createApi({
    reducerPath: SERVICE_URL,

    baseQuery: fetchUtils.baseQuery,

    endpoints: endpoint => ({
        getCummulativeScores: endpoint.query<IScoreMapping[], IDefaultQueryParams>({
            query: params => ({
                url: `/${SERVICE_URL}/getCummulativeScores`,
                method: REST_API_VERBS.GET,
                params,
            }),

            transformResponse: (response: IDefaultResponse<IScoreMapping[]>) => response.data,
        }),

        // Add your endpoints here
    }),
});

// Use exported hook in relevant components
export const { useGetCummulativeScoresQuery } = scoreMappingServiceSlice;
