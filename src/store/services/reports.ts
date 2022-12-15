import { createApi } from '@reduxjs/toolkit/query/react';
import { IChildCareReportPayload } from '../types';
import { fetchUtils } from './fetch-utils';

const SERVICE_URL = 'reports';

export const reportsServiceSlice = createApi({
    reducerPath: SERVICE_URL,

    baseQuery: fetchUtils.baseQuery,

    endpoints: endpoint => ({
        createChildCareReport: endpoint.mutation<void, IChildCareReportPayload>(
            {
                query: body => ({
                    url: SERVICE_URL,
                    method: 'POST',
                    body,
                }),
            }
        ),

        // Add your endpoints here
    }),
});

// Use exported hook in relevant components
export const {} = reportsServiceSlice;
