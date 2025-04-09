import { IDefaultQueryParams, IGHSubmittedReportForGSP } from '../types/index';
import { createApi } from '@reduxjs/toolkit/query/react';
import { IDefaultResponse, IService, IReportStatus, REST_API_VERBS } from '../types';
import { fetchUtils } from './fetch-utils';
import { ICampusReportSummary } from './reports';

const SERVICE_URL = 'gh';

export interface IGHReportPayload {
    departmentReports: string[];
    incidentReports: string[];
    submittedReport: string;
    serviceId: string;
}

export interface IGHSubmittedReport {
    serviceId: string;
    serviceName: string;
    status: IReportStatus;
    createdAt: number;
}

export const groupHeadServiceSlice = createApi({
    reducerPath: SERVICE_URL,

    baseQuery: fetchUtils.baseQuery,

    refetchOnFocus: true,
    refetchOnReconnect: true,
    refetchOnMountOrArgChange: true,

    endpoints: endpoint => ({
        submitGhReport: endpoint.mutation<any, IGHReportPayload>({
            query: body => ({
                url: `/${SERVICE_URL}/submitReport`,
                method: REST_API_VERBS.POST,
                body,
            }),
        }),

        getGhReportById: endpoint.query<ICampusReportSummary, { serviceId: IService['_id'] }>({
            query: params => ({
                url: `/${SERVICE_URL}/reports/${params.serviceId}`,
                method: REST_API_VERBS.GET,
            }),

            transformResponse: (res: IDefaultResponse<ICampusReportSummary>) => res?.data,
        }),

        getGhReports: endpoint.query<IGHSubmittedReport[], IDefaultQueryParams>({
            query: params => ({
                url: `/${SERVICE_URL}/reports`,
                method: REST_API_VERBS.GET,
                params,
            }),

            transformResponse: (res: IDefaultResponse<IGHSubmittedReport[]>) => res?.data,
        }),

        getGHSubmittedReportsByServiceId: endpoint.query<Array<IGHSubmittedReportForGSP>, string>({
            query: serviceId => ({
                url: `/${SERVICE_URL}/gsp/${serviceId}`,
                method: REST_API_VERBS.GET,
            }),

            transformResponse: (res: IDefaultResponse<Array<IGHSubmittedReportForGSP>>) => res.data,
        }),

        // Add your endpoints here
    }),
});

// Use exported hook in relevant components
export const {
    useSubmitGhReportMutation,
    useGetGhReportsQuery,
    useGetGhReportByIdQuery,
    useGetGHSubmittedReportsByServiceIdQuery,
} = groupHeadServiceSlice;
