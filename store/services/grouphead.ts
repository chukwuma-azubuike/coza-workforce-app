import { IDefaultQueryParams, IGHSubmittedReportForGSP, IReportHistoryEntry } from '../types/index';
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
    history: IReportHistoryEntry[];
}

// ─── Report action payloads ───────────────────────────────────────────────────
export interface IGHApproveReportPayload {
    reportId: string;
    serviceId: string;
    comment?: string;
    idempotencyKey?: string;
}

export interface IGHRequestChangesPayload {
    reportId: string;
    comment: string;
    idempotencyKey?: string;
}

export interface IGHPushBackToHodPayload {
    reportId: string;
    comment: string;
    idempotencyKey?: string;
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

    tagTypes: ['GHReport', 'GHWordReview'],

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
            invalidatesTags: ['GHReport'],
        }),

        getGhReportById: endpoint.query<ICampusReportSummary, { serviceId: IService['_id'] }>({
            query: params => ({
                url: `/${SERVICE_URL}/reports/${params.serviceId}`,
                method: REST_API_VERBS.GET,
            }),
            providesTags: (_, __, { serviceId }) => [{ type: 'GHReport', id: serviceId }, 'GHReport'],
            transformResponse: (res: IDefaultResponse<ICampusReportSummary>) => res?.data,
        }),

        getGhReports: endpoint.query<IGHSubmittedReport[], IDefaultQueryParams>({
            query: params => ({
                url: `/${SERVICE_URL}/reports`,
                method: REST_API_VERBS.GET,
                params,
            }),
            providesTags: ['GHReport'],
            transformResponse: (res: IDefaultResponse<IGHSubmittedReport[]>) => res?.data,
        }),

        getGHSubmittedReportsByServiceId: endpoint.query<Array<IGHSubmittedReportForGSP>, string>({
            query: serviceId => ({
                url: `/${SERVICE_URL}/gsp/${serviceId}`,
                method: REST_API_VERBS.GET,
            }),
            providesTags: (_, __, serviceId) => [{ type: 'GHReport', id: serviceId }, 'GHReport'],
            transformResponse: (res: IDefaultResponse<Array<IGHSubmittedReportForGSP>>) => res.data,
        }),

        // ─── Report detail ────────────────────────────────────────────
        getGhReportDetail: endpoint.query<IGHReportDetail, { reportId: string }>({
            query: ({ reportId }) => ({
                url: `/${SERVICE_URL}/reportDetail/${reportId}`,
                method: REST_API_VERBS.GET,
            }),
            providesTags: (_, __, { reportId }) => [{ type: 'GHReport', id: reportId }, 'GHReport'],
            transformResponse: (res: IDefaultResponse<IGHReportDetail>) => res?.data,
        }),

        // ─── Report state transitions (v2) ────────────────────────────
        approveReport: endpoint.mutation<void, IGHApproveReportPayload>({
            query: ({ reportId, comment, idempotencyKey }) => ({
                url: `/${SERVICE_URL}/reports/${reportId}/approve`,
                method: REST_API_VERBS.POST,
                body: { comment },
                headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined,
            }),
            invalidatesTags: (_, __, { reportId, serviceId }) => [
                { type: 'GHReport', id: reportId },
                { type: 'GHReport', id: serviceId },
                'GHReport',
            ],
        }),

        requestReportChanges: endpoint.mutation<void, IGHRequestChangesPayload>({
            query: ({ reportId, comment, idempotencyKey }) => ({
                url: `/${SERVICE_URL}/reports/${reportId}/request-changes`,
                method: REST_API_VERBS.POST,
                body: { comment },
                headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined,
            }),
            invalidatesTags: (_, __, { reportId }) => [{ type: 'GHReport', id: reportId }, 'GHReport'],
        }),

        pushReportBackToHod: endpoint.mutation<void, IGHPushBackToHodPayload>({
            query: ({ reportId, comment, idempotencyKey }) => ({
                url: `/${SERVICE_URL}/reports/${reportId}/push-back-to-hod`,
                method: REST_API_VERBS.POST,
                body: { comment },
                headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined,
            }),
            invalidatesTags: (_, __, { reportId }) => [{ type: 'GHReport', id: reportId }, 'GHReport'],
        }),

        // ─── Word / weekly reflection reviews ─────────────────────────
        getGhWordReviews: endpoint.query<IGHWordReview[], { serviceId: string }>({
            query: ({ serviceId }) => ({
                url: `/${SERVICE_URL}/wordReviews/${serviceId}`,
                method: REST_API_VERBS.GET,
            }),
            providesTags: (_, __, { serviceId }) => [{ type: 'GHWordReview', id: serviceId }, 'GHWordReview'],
            transformResponse: (res: IDefaultResponse<IGHWordReview[]>) => res?.data,
        }),

        acknowledgeGhWordReview: endpoint.mutation<void, { reviewId: string }>({
            query: ({ reviewId }) => ({
                url: `/${SERVICE_URL}/wordReviews/${reviewId}/acknowledge`,
                method: REST_API_VERBS.PATCH,
            }),
            invalidatesTags: (_, __, { reviewId }) => [{ type: 'GHWordReview', id: reviewId }, 'GHWordReview'],
        }),

        suspendGhWordReview: endpoint.mutation<void, { reviewId: string; comment: string }>({
            query: ({ reviewId, comment }) => ({
                url: `/${SERVICE_URL}/wordReviews/${reviewId}/suspend`,
                method: REST_API_VERBS.PATCH,
                body: { comment },
            }),
            invalidatesTags: (_, __, { reviewId }) => [{ type: 'GHWordReview', id: reviewId }, 'GHWordReview'],
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
    useApproveReportMutation,
    useRequestReportChangesMutation,
    usePushReportBackToHodMutation,
    useGetGhWordReviewsQuery,
    useAcknowledgeGhWordReviewMutation,
    useSuspendGhWordReviewMutation,
} = groupHeadServiceSlice;
