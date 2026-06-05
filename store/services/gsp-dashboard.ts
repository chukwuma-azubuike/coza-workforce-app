import { createApi } from '@reduxjs/toolkit/query/react';
import { IDefaultResponse, IReportStatus, REST_API_VERBS } from '../types';
import { fetchUtils } from './fetch-utils';

const SERVICE_URL = 'gsp/dashboard';

/* ────────────────────────────────────────────────────────────────────────────
 * Metric catalogue (server-defined; may grow — treat unknown keys gracefully).
 * ──────────────────────────────────────────────────────────────────────────── */
// Metric keys accepted by `/metric/:metricKey` (single-source + server-resolved
// composites). Workforce/attendance figures are NOT in this set — read those from
// `/workforce/overview` and `/workforce/trend` instead.
export type IGspMetricKey =
    | 'churchAttendanceTotal'
    | 'churchAttendanceAdults'
    | 'men'
    | 'women'
    | 'infants'
    | 'childrenAttendance'
    | 'firstTimers'
    | 'newConverts'
    | 'maleGuests'
    | 'femaleGuests'
    | 'totalGuests'
    | 'cars'
    | 'transferAdults'
    | 'transferMinors'
    | 'totalTransferred'
    | 'classMemberCount'
    | 'convertsCompletedClass'
    | 'medicalSupport'
    | 'aidRequests'
    | 'aidTreated'
    | 'onlineConverts'
    | 'onlineFirstTimers'
    | 'enquiries'
    | 'vehicleDedications'
    | 'missingItems'
    | 'praiseReports'
    | 'incidents'
    | 'specialGuests';

export interface IGspMetricMeta {
    key: IGspMetricKey;
    label: string;
    /** `count` renders raw integers, `rate` renders a 0..1 fraction as a percentage. */
    format: 'count' | 'rate';
}

export const GSP_METRIC_CATALOGUE: IGspMetricMeta[] = [
    { key: 'churchAttendanceTotal', label: 'Church Attendance', format: 'count' },
    { key: 'churchAttendanceAdults', label: 'Adult Attendance', format: 'count' },
    { key: 'men', label: 'Men', format: 'count' },
    { key: 'women', label: 'Women', format: 'count' },
    { key: 'infants', label: 'Infants', format: 'count' },
    { key: 'childrenAttendance', label: 'Children', format: 'count' },
    { key: 'firstTimers', label: 'First Timers', format: 'count' },
    { key: 'newConverts', label: 'New Converts', format: 'count' },
    { key: 'maleGuests', label: 'Male Guests', format: 'count' },
    { key: 'femaleGuests', label: 'Female Guests', format: 'count' },
    { key: 'totalGuests', label: 'Total Guests', format: 'count' },
    { key: 'cars', label: 'Cars', format: 'count' },
    { key: 'transferAdults', label: 'Transfer (Adults)', format: 'count' },
    { key: 'transferMinors', label: 'Transfer (Minors)', format: 'count' },
    { key: 'totalTransferred', label: 'Guests Transferred', format: 'count' },
    { key: 'classMemberCount', label: 'Class Members', format: 'count' },
    { key: 'convertsCompletedClass', label: 'Converts Completed Class', format: 'count' },
    { key: 'medicalSupport', label: 'Medical Support', format: 'count' },
    { key: 'aidRequests', label: 'Aid Requests', format: 'count' },
    { key: 'aidTreated', label: 'Aid Treated', format: 'count' },
    { key: 'onlineConverts', label: 'Online Converts', format: 'count' },
    { key: 'onlineFirstTimers', label: 'Online First Timers', format: 'count' },
    { key: 'enquiries', label: 'Enquiries', format: 'count' },
    { key: 'vehicleDedications', label: 'Vehicle Dedications', format: 'count' },
    { key: 'missingItems', label: 'Missing Items', format: 'count' },
    { key: 'praiseReports', label: 'Praise Reports', format: 'count' },
    { key: 'incidents', label: 'Incidents', format: 'count' },
    { key: 'specialGuests', label: 'Special Guests', format: 'count' },
];

export const getMetricMeta = (key: string): IGspMetricMeta =>
    GSP_METRIC_CATALOGUE.find(m => m.key === key) ?? { key: key as IGspMetricKey, label: key, format: 'count' };

/**
 * Unwraps the standard `{ ..., data }` response envelope. Tolerant by design:
 * if the backend ever returns the payload unwrapped (no `data` key), fall back to
 * the raw response so the dashboard still renders instead of showing empty zeros.
 */
const unwrap = <T>(res: IDefaultResponse<T> | T): T => {
    if (res && typeof res === 'object' && 'data' in (res as object)) {
        return (res as IDefaultResponse<T>).data;
    }
    return res as T;
};

/* ────────────────────────────────────────────────────────────────────────────
 * Shared query params
 * ──────────────────────────────────────────────────────────────────────────── */
export type IGspGroupBy = 'campus' | 'service' | 'month';

export interface IGspBaseParams {
    /** Window start in epoch SECONDS (not ms). */
    startDate?: number;
    /** Window end in epoch SECONDS. */
    endDate?: number;
    /** Omit for the global (all-campuses) accumulation. */
    campusId?: string;
    serviceId?: string;
    groupBy?: IGspGroupBy;
    metric?: IGspMetricKey | string;
    /** Pass `previous` to receive period-over-period deltas. */
    compareTo?: 'previous';
    /** Defaults to GSP_APPROVED server-side; override to preview in-flight data. */
    status?: IReportStatus;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Response payloads (contents of `data`)
 * ──────────────────────────────────────────────────────────────────────────── */
export interface IGspKpiValue {
    value: number;
    /** Signed fraction, e.g. 0.062 = +6.2%. Present only when compareTo=previous. */
    delta?: number;
}

export interface IGspOverview {
    window: { start: number; end: number; label: string };
    kpis: {
        churchAttendanceTotal: IGspKpiValue & { adults?: number; children?: number };
        workforceTotal: { value: number; active: number; inactive?: number; dormant?: number; blacklisted?: number };
        workforceAttendance: { rate: number; present: number; late: number; absent: number; delta?: number };
        firstTimers: IGspKpiValue;
        newConverts: IGspKpiValue;
        totalGuestsTransferred: { value: number };
        totalCars: { value: number };
        campusesReporting: { value: number; of: number };
    };
    completeness: { reportsApproved: number; expected: number; rate: number };
}

export interface IGspCampusAttendanceRow {
    campusId: string;
    campusName: string;
    total: number;
    men: number;
    women: number;
    children: number;
    /** Fraction of the global total — good for donut/share. */
    share: number;
}

export interface IGspAttendanceByCampus {
    total: number;
    breakdown: IGspCampusAttendanceRow[];
}

export interface IGspSeriesPoint {
    key: string;
    label: string;
    value: number;
    /** Present only when groupBy=service (epoch seconds). */
    serviceTime?: number;
}

export interface IGspTrend {
    groupBy: IGspGroupBy;
    metric: string;
    series: IGspSeriesPoint[];
}

/** Workforce trend points expose present/late/total — not a generic `value`. */
export interface IGspWorkforceTrendPoint {
    key: string;
    label: string;
    present: number;
    late: number;
    total: number;
    serviceTime?: number;
}

export interface IGspWorkforceTrend {
    groupBy: IGspGroupBy;
    metric: string;
    series: IGspWorkforceTrendPoint[];
}

export interface IGspWorkforceCampusRow {
    campusId: string;
    campusName: string;
    total: number;
    active: number;
    present: number;
    late: number;
    absent: number;
    rate: number;
}

export interface IGspWorkforceOverview {
    roster: { total: number; active: number; inactive: number; dormant: number; blacklisted: number };
    attendance: { present: number; late: number; absent: number; rate: number };
    gender: { male: number; female: number };
    byCampus: IGspWorkforceCampusRow[];
}

export interface IGspGuestsCampusRow {
    campusId: string;
    campusName: string;
    firstTimers: number;
    newConverts: number;
}

export interface IGspGuestsTrendPoint {
    key: string;
    label: string;
    firstTimers: number;
    newConverts: number;
    /** Present only when groupBy=service (epoch seconds). */
    serviceTime?: number;
}

export interface IGspGuests {
    totals: { firstTimers: number; newConverts: number; totalGuests: number };
    byCampus: IGspGuestsCampusRow[];
    trend: IGspGuestsTrendPoint[];
}

export interface IGspCompletenessCampusRow {
    campusId: string;
    campusName: string;
    approved: number;
    expected: number;
    rate: number;
}

export interface IGspCompleteness {
    byStatus: Partial<Record<IReportStatus, number>>;
    byCampus: IGspCompletenessCampusRow[];
    pendingGspApproval: number;
}

export interface IGspCampusServiceRow {
    serviceId: string;
    label: string;
    serviceTime: number;
    churchAttendanceTotal: number;
    firstTimers: number;
}

export interface IGspCampusDrilldown {
    campus: { campusId: string; campusName: string };
    metrics: {
        churchAttendanceTotal: number;
        churchAttendanceAdults: number;
        childrenAttendance: number;
        firstTimers: number;
        newConverts: number;
        cars: number;
        totalTransferred?: number;
        classMemberCount?: number;
        onlineConverts?: number;
        incidents?: number;
        workforce: { total: number; active?: number; present: number; late: number; absent: number; rate?: number };
    };
    services: IGspCampusServiceRow[];
}

export interface IGspServiceRow {
    serviceId: string;
    label: string;
    serviceTime: number;
    churchAttendanceTotal: number;
    firstTimers: number;
    campusesReporting: number;
}

export interface IGspServices {
    services: IGspServiceRow[];
}

export interface IGspMetricBreakdownPoint {
    key: string;
    label: string;
    value: number;
    /** Present when groupBy=campus. */
    share?: number;
}

export interface IGspMetricBreakdown {
    metric: string;
    groupBy: IGspGroupBy;
    total: number;
    series: IGspMetricBreakdownPoint[];
}

/* ────────────────────────────────────────────────────────────────────────────
 * Service slice
 * ──────────────────────────────────────────────────────────────────────────── */
export const gspDashboardServiceSlice = createApi({
    reducerPath: 'gspDashboard',

    baseQuery: fetchUtils.baseQueryWithTokenRefresh,

    tagTypes: ['GspDashboard'],

    refetchOnFocus: true,
    refetchOnReconnect: true,

    endpoints: endpoint => ({
        getGspOverview: endpoint.query<IGspOverview, IGspBaseParams>({
            query: params => ({ url: `/${SERVICE_URL}/overview`, method: REST_API_VERBS.GET, params }),
            providesTags: ['GspDashboard'],
            transformResponse: (res: IDefaultResponse<IGspOverview>) => unwrap(res),
        }),

        getGspAttendanceByCampus: endpoint.query<IGspAttendanceByCampus, IGspBaseParams>({
            query: params => ({ url: `/${SERVICE_URL}/attendance/by-campus`, method: REST_API_VERBS.GET, params }),
            providesTags: ['GspDashboard'],
            transformResponse: (res: IDefaultResponse<IGspAttendanceByCampus>) => unwrap(res),
        }),

        getGspAttendanceTrend: endpoint.query<IGspTrend, IGspBaseParams>({
            query: params => ({ url: `/${SERVICE_URL}/attendance/trend`, method: REST_API_VERBS.GET, params }),
            providesTags: ['GspDashboard'],
            transformResponse: (res: IDefaultResponse<IGspTrend>) => unwrap(res),
        }),

        getGspWorkforceOverview: endpoint.query<IGspWorkforceOverview, IGspBaseParams>({
            query: params => ({ url: `/${SERVICE_URL}/workforce/overview`, method: REST_API_VERBS.GET, params }),
            providesTags: ['GspDashboard'],
            transformResponse: (res: IDefaultResponse<IGspWorkforceOverview>) => unwrap(res),
        }),

        getGspWorkforceTrend: endpoint.query<IGspWorkforceTrend, IGspBaseParams>({
            query: params => ({ url: `/${SERVICE_URL}/workforce/trend`, method: REST_API_VERBS.GET, params }),
            providesTags: ['GspDashboard'],
            transformResponse: (res: IDefaultResponse<IGspWorkforceTrend>) => unwrap(res),
        }),

        getGspGuests: endpoint.query<IGspGuests, IGspBaseParams>({
            query: params => ({ url: `/${SERVICE_URL}/guests`, method: REST_API_VERBS.GET, params }),
            providesTags: ['GspDashboard'],
            transformResponse: (res: IDefaultResponse<IGspGuests>) => unwrap(res),
        }),

        getGspCompleteness: endpoint.query<IGspCompleteness, IGspBaseParams>({
            query: params => ({ url: `/${SERVICE_URL}/reports/completeness`, method: REST_API_VERBS.GET, params }),
            providesTags: ['GspDashboard'],
            transformResponse: (res: IDefaultResponse<IGspCompleteness>) => unwrap(res),
        }),

        getGspCampus: endpoint.query<IGspCampusDrilldown, { campusId: string } & IGspBaseParams>({
            query: ({ campusId, ...params }) => ({
                url: `/${SERVICE_URL}/campus/${campusId}`,
                method: REST_API_VERBS.GET,
                params,
            }),
            providesTags: (_, __, { campusId }) => [{ type: 'GspDashboard', id: campusId }, 'GspDashboard'],
            transformResponse: (res: IDefaultResponse<IGspCampusDrilldown>) => unwrap(res),
        }),

        getGspServices: endpoint.query<IGspServices, IGspBaseParams>({
            query: params => ({ url: `/${SERVICE_URL}/services`, method: REST_API_VERBS.GET, params }),
            providesTags: ['GspDashboard'],
            transformResponse: (res: IDefaultResponse<IGspServices>) => unwrap(res),
        }),

        getGspMetric: endpoint.query<IGspMetricBreakdown, { metricKey: string } & IGspBaseParams>({
            query: ({ metricKey, ...params }) => ({
                url: `/${SERVICE_URL}/metric/${metricKey}`,
                method: REST_API_VERBS.GET,
                params,
            }),
            providesTags: (_, __, { metricKey }) => [{ type: 'GspDashboard', id: metricKey }, 'GspDashboard'],
            transformResponse: (res: IDefaultResponse<IGspMetricBreakdown>) => unwrap(res),
        }),
    }),
});

export const {
    useGetGspOverviewQuery,
    useGetGspAttendanceByCampusQuery,
    useGetGspAttendanceTrendQuery,
    useGetGspWorkforceOverviewQuery,
    useGetGspWorkforceTrendQuery,
    useGetGspGuestsQuery,
    useGetGspCompletenessQuery,
    useGetGspCampusQuery,
    useGetGspServicesQuery,
    useGetGspMetricQuery,
} = gspDashboardServiceSlice;
