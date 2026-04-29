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

// ─── Approvals report enrichment ─────────────────────────────────────────────
// Backend should add these fields to the departmentalReport items returned by
// GET /gh/reports/:serviceId so the approvals screen can render submitter info,
// preview text, and attachment count without extra round-trips.
export interface IGHApprovalReportExtra {
    submittedBy?: {
        firstName: string;
        lastName: string;
        pictureUrl?: string;
    };
    submittedAt?: string;
    preview?: string;
    attachmentCount?: number;
    serviceName?: string;
}

export type IGHApprovalReportSummary = ICampusReportSummary<IGHApprovalReportExtra>;

// ─── Report detail ────────────────────────────────────────────────────────────
// New endpoint: GET /gh/reportDetail/:reportId
// Returns full detail for a single department report for the GH review flow.
export interface IGHReportDetail {
    _id: string;
    departmentName: string;
    serviceName: string;
    status: IReportStatus;
    submittedBy: {
        firstName: string;
        lastName: string;
        pictureUrl?: string;
    };
    submittedAt: string;
    attendance: {
        present: number;
        late: number;
        absent: number;
        total: number;
    };
    narrative: string;
    highlights: string[];
    attachments: { name: string; size: string }[];
}

// ─── Word / weekly reflection reviews ────────────────────────────────────────
// New endpoint: GET /gh/wordReviews/:serviceId
// Returns HOD/AHOD weekly word submissions pending GH acknowledgement.
export interface IGHWordReview {
    _id: string;
    firstName: string;
    lastName: string;
    pictureUrl?: string;
    role: 'HOD' | 'AHOD';
    departmentName: string;
    weekEnding: string;
    wordCount: number;
    preview: string;
    status: 'PENDING' | 'ACKNOWLEDGED' | 'SUSPENDED';
    isLate: boolean;
    submittedAt: string;
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

        // ─── Report detail ────────────────────────────────────────────
        getGhReportDetail: endpoint.query<IGHReportDetail, { reportId: string }>({
            query: ({ reportId }) => ({
                url: `/${SERVICE_URL}/reportDetail/${reportId}`,
                method: REST_API_VERBS.GET,
            }),
            transformResponse: (res: IDefaultResponse<IGHReportDetail>) => res?.data,
        }),

        // ─── Forward a department report to GSP ───────────────────────
        forwardReportToGsp: endpoint.mutation<void, { reportId: string; serviceId: string }>({
            query: ({ reportId, serviceId }) => ({
                url: `/${SERVICE_URL}/forwardReport/${reportId}/${serviceId}`,
                method: REST_API_VERBS.POST,
            }),
        }),

        // ─── Word / weekly reflection reviews ─────────────────────────
        getGhWordReviews: endpoint.query<IGHWordReview[], { serviceId: string }>({
            query: ({ serviceId }) => ({
                url: `/${SERVICE_URL}/wordReviews/${serviceId}`,
                method: REST_API_VERBS.GET,
            }),
            transformResponse: (res: IDefaultResponse<IGHWordReview[]>) => res?.data,
        }),

        acknowledgeGhWordReview: endpoint.mutation<void, { reviewId: string }>({
            query: ({ reviewId }) => ({
                url: `/${SERVICE_URL}/wordReviews/${reviewId}/acknowledge`,
                method: REST_API_VERBS.PATCH,
            }),
        }),

        suspendGhWordReview: endpoint.mutation<void, { reviewId: string }>({
            query: ({ reviewId }) => ({
                url: `/${SERVICE_URL}/wordReviews/${reviewId}/suspend`,
                method: REST_API_VERBS.PATCH,
            }),
        }),
    }),
});

// Use exported hook in relevant components
export const {
    useSubmitGhReportMutation,
    useGetGhReportsQuery,
    useGetGhReportByIdQuery,
    useGetGHSubmittedReportsByServiceIdQuery,
    useGetGhReportDetailQuery,
    useForwardReportToGspMutation,
    useGetGhWordReviewsQuery,
    useAcknowledgeGhWordReviewMutation,
    useSuspendGhWordReviewMutation,
} = groupHeadServiceSlice;
