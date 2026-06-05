import { IGHSubmittedReportForGSP, IReviewHistoryEntry, IGHRosterMember } from '../types/index';
import type { IGHGroupDepartment, IGHReportListResponse } from '../types/index';
import { createApi } from '@reduxjs/toolkit/query/react';
import { IDefaultResponse, IService, IReportStatus, REST_API_VERBS } from '../types';
import { fetchUtils } from './fetch-utils';
import { ICampusReportSummary } from './reports';

const SERVICE_URL = 'gh';

export interface IGHReportPayload {
    reportId: string;
    reportType: string;
    serviceId: string;
    departmentId: string;
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
// GET /gh/reports/:reportId — returns the real department report document plus the
// review trail and the latest note per stage. `reportData` is the full report doc
// (all data fields + status + reportType + hodId + reviewHistory + comment fields).
export interface IGHReportDetail<TReportData = Record<string, any>> {
    reportId: string;
    reportType: string;
    status: IReportStatus;
    reportData: TReportData;
    reviewHistory: IReviewHistoryEntry[];
    departmentName: string;
    groupId?: string;
    campusName?: string;
    serviceName?: string;
    serviceTime?: number;
    submittedBy?: string;
    // latest note per stage
    ghComment?: string | null;
    pastorComment?: string | null;
    gspComment?: string | null;
}

// ─── Report transition payload (replaces the six old action endpoints) ──────────
export interface IGHTransitionPayload {
    reportId: string;
    reportType?: string; // recommended — single-collection lookup instead of a 12-collection fan-out
    toStatus: IReportStatus;
    comment?: string; // required (≥ 20 chars) for any *_CHANGE_REQUESTED target
    idempotencyKey?: string;
}

export interface IGHTransitionResponse {
    status: IReportStatus;
    reviewHistory: IReviewHistoryEntry[];
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
        getGhReportById: endpoint.query<ICampusReportSummary, { serviceId: IService['_id'] }>({
            query: params => ({
                url: `/${SERVICE_URL}/reports/${params.serviceId}`,
                method: REST_API_VERBS.GET,
            }),
            providesTags: (_, __, { serviceId }) => [{ type: 'GHReport', id: serviceId }, 'GHReport'],
            transformResponse: (res: IDefaultResponse<ICampusReportSummary>) => res?.data,
        }),

        getGhReports: endpoint.query<
            IGHReportListResponse,
            { status?: string; page?: number; limit?: number; serviceId?: string }
        >({
            query: params => ({
                url: `/${SERVICE_URL}/reports`,
                method: REST_API_VERBS.GET,
                params,
            }),
            providesTags: result => [
                ...(result?.reports ?? []).map(r => ({ type: 'GHReport' as const, id: r.reportId ?? r._id })),
                'GHReport',
            ],
            transformResponse: (res: IDefaultResponse<IGHReportListResponse>) => res?.data,
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
        getGhReportDetail: endpoint.query<IGHReportDetail, { reportId: string; reportType?: string }>({
            query: ({ reportId, reportType }) => ({
                url: `/${SERVICE_URL}/reports/${reportId}`,
                method: REST_API_VERBS.GET,
                params: reportType ? { reportType } : undefined,
            }),
            providesTags: (_, __, { reportId }) => [{ type: 'GHReport', id: reportId }, 'GHReport'],
            transformResponse: (res: IDefaultResponse<IGHReportDetail>) => res?.data,
        }),

        // ─── Unified report workflow transition (replaces the six old endpoints) ──
        // The backend derives who-can-do-what from the target status, so the client
        // just sends the desired `toStatus` (+ a comment for *_CHANGE_REQUESTED).
        transitionReport: endpoint.mutation<IGHTransitionResponse, IGHTransitionPayload>({
            query: ({ reportId, reportType, toStatus, comment, idempotencyKey }) => ({
                url: `/${SERVICE_URL}/reports/${reportId}/transition`,
                method: REST_API_VERBS.POST,
                body: { reportType, toStatus, comment },
                headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined,
            }),
            transformResponse: (res: IDefaultResponse<IGHTransitionResponse>) => res?.data,
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

        // ─── Group-scoped KPI stats ────────────────────────────────────
        getGHLeaderAttendanceReport: endpoint.query<
            { totalLeaders: number; present: number; late: number; attended: number; absent: number },
            { serviceId: string; campusId?: string }
        >({
            query: params => ({ url: `/${SERVICE_URL}/group/leader-attendance-report`, params }),
            providesTags: ['GHReport'],
            transformResponse: (res: IDefaultResponse<any>) => res?.data,
        }),

        getGHWorkersAttendanceReport: endpoint.query<
            { totalWorkers: number; present: number; late: number; attended: number; absent: number },
            { serviceId: string; campusId?: string }
        >({
            query: params => ({ url: `/${SERVICE_URL}/group/workers-attendance-report`, params }),
            providesTags: ['GHReport'],
            transformResponse: (res: IDefaultResponse<any>) => res?.data,
        }),

        getGHTicketReport: endpoint.query<
            { tickets: number },
            { serviceId: string; campusId?: string }
        >({
            query: params => ({ url: `/${SERVICE_URL}/group/ticket-report`, params }),
            providesTags: ['GHReport'],
            transformResponse: (res: IDefaultResponse<any>) => res?.data,
        }),

        // ─── Group departments & roster ───────────────────────────────
        getGroupDepartments: endpoint.query<IGHGroupDepartment[], { campusId?: string } | void>({
            query: params => ({
                url: `/${SERVICE_URL}/group/departments`,
                params: params ?? undefined,
                method: REST_API_VERBS.GET,
            }),
            providesTags: ['GHReport'],
            transformResponse: (res: IDefaultResponse<IGHGroupDepartment[]>) => res?.data,
        }),

        getGroupDepartmentRoster: endpoint.query<IGHRosterMember[], { departmentId: string }>({
            query: ({ departmentId }) => ({
                url: `/${SERVICE_URL}/group/department/${departmentId}/roster`,
                method: REST_API_VERBS.GET,
            }),
            providesTags: (_, __, { departmentId }) => [{ type: 'GHReport', id: departmentId }],
            transformResponse: (res: IDefaultResponse<IGHRosterMember[]>) => res?.data,
        }),
    }),
});

// Use exported hook in relevant components
export const {
    useGetGhReportsQuery,
    useGetGhReportByIdQuery,
    useGetGHSubmittedReportsByServiceIdQuery,
    useGetGhReportDetailQuery,
    useTransitionReportMutation,
    useGetGhWordReviewsQuery,
    useAcknowledgeGhWordReviewMutation,
    useSuspendGhWordReviewMutation,
    useGetGroupDepartmentsQuery,
    useGetGroupDepartmentRosterQuery,
    useGetGHLeaderAttendanceReportQuery,
    useGetGHWorkersAttendanceReportQuery,
    useGetGHTicketReportQuery,
} = groupHeadServiceSlice;
