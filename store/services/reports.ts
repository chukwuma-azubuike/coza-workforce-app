import { ICampus, IDefaultQueryParams, IGraphAttendanceReports, IStatus, IUser } from '../types/index';
import { createApi } from '@reduxjs/toolkit/query/react';
import {
    IChildCareReportPayload,
    IDefaultResponse,
    IAttendanceReportPayload,
    IGuestReportPayload,
    ISecurityReportPayload,
    ITransferReportPayload,
    IIncidentReportPayload,
    IServiceReportPayload,
    IDepartment,
    IDepartmentReportResponse,
    IService,
    IReportStatus,
    REST_API_VERBS,
} from '../types';
import { fetchUtils } from './fetch-utils';

const SERVICE_URL = 'report';

export interface IGlobalWorkforceReportSummary {
    totalWorkers: number;
    activeWrokers: number;
    presentWorkers: number;
    lateWorkers: number;
    absentWorkers: number;
}

export interface IGSPReport {
    workers: {
        tickets: number;
        totalWorkers: number;
        activeWorkers: number;
        presentWorkers: number;
        lateWorkers: number;
        absentWorkers: number;
    };
    serviceAttendance: {
        totalAttenance: number;
        menAttendance: number;
        womenAttendance: number;
        teenagerAttendance: number;
        childrenAttendance: number;
    };
    guestAttendance: {
        firstTimer: number;
        newConvert: number;
    };
    busCount: {
        location: number;
        totalGuest: number;
        totalAdult: number;
        totalChildren: number;
        totalCars: number;
    };
}
export interface ICarsReportSummary {
    totalCars: number;
}

export interface IServiceAttendanceReportSummary {
    total: number;
    men: number;
    women: number;
    teenagers: number;
    children: number;
}

export interface IGuestReportSummary {
    firstTimers: number;
    newConvert: number;
}

export interface IBusReportSummary {
    locations: number;
    totalGuest: number;
    adult: number;
    children: number;
}
export interface ICampusReportSummary<R = unknown> {
    departmentName: string;
    campus: string;
    departmentalReport: {
        campus: string;
        status: IReportStatus;
        departmentName: string;
        report: {
            _id: string;
            departmentId: string;
            serviceId: string;
            status: IReportStatus;
        } & R;
    }[];
    incidentReport: {
        incidentReport: IIncidentReportPayload;
        departmentName: string;
    }[];
    campusCoordinatorComment?: string;
    submittedReport?: string;
}

export interface IDepartmentReportListById {
    _id: string;
    status: IStatus;
    createdAt: string;
    updatedAt: string;
    updatedBy: string;
    serviceId: string;
}

export interface IDepartmentAndIncidentReport {
    departmentalReport: IDepartmentReportListById[];
    incidentReport: IIncidentReportPayload & { _id: string }[];
}

export interface IGSPReportPayload {
    submittedReportIds: string[];
    incidentReportIds: string[];
    campusCoordinatorComment: string;
    campusId: ICampus['_id'];
    userId: IUser['_id'];
    serviceId: IService['_id'];
    status: IReportStatus;
}

export interface IGHReportPayload {
    departmentReports: string[];
    incidentReports: string[];
    submittedReport: string;
    serviceId: string;
}

export interface ICampusReport {
    serviceId: IService['_id'];
    campusId: ICampus['_id'];
    status: IReportStatus;
    serviceName: string;
    serviceTime: number;
}

export interface IGlobalReport {
    _id: string;
    status: IReportStatus;
    campusId: ICampus['_id'];
    campusName: string;
}

export interface IGHSubmittedReport {
    serviceId: string;
    serviceName: string;
    status: IReportStatus;
    createdAt: number;
}

export interface ICampusReportListPayload extends Pick<IDefaultQueryParams, 'limit' | 'page'> {
    campusId: ICampus['_id'];
}
export interface IGlobalReportListPayload extends Pick<IDefaultQueryParams, 'limit' | 'page'> {
    serviceId: IService['_id'];
}

export interface ICampusReportList extends Array<ICampusReport> {}
export interface IGlobalReportList extends Array<IGlobalReport> {}

export const reportsServiceSlice = createApi({
    reducerPath: SERVICE_URL,

    baseQuery: fetchUtils.baseQuery,

    tagTypes: [
        SERVICE_URL,
        'Report',
        'CampusReport',
        'DepartmentReport',
        'ServiceReport',
        'GlobalReport',
        'GSPReport',
        'AttendanceReport',
        'GuestReport',
        'SecurityReport',
        'TransferReport',
        'ChildCareReport'
    ],

    refetchOnFocus: true,
    refetchOnReconnect: true,
    refetchOnMountOrArgChange: true,

    endpoints: endpoint => ({
        createChildCareReport: endpoint.mutation<void, IChildCareReportPayload>({
            query: body => ({
                url: `/${SERVICE_URL}/updateChildChareReport/${body._id}/${body.campusId}`,
                method: REST_API_VERBS.PUT,
                body,
            }),

            invalidatesTags: (result, error, { campusId }) => [
                'ChildCareReport',
                { type: 'CampusReport', id: campusId },
                'GSPReport',
                SERVICE_URL
            ],
        }),

        createIncidentReport: endpoint.mutation<void, IIncidentReportPayload>({
            query: body => ({
                url: `/${SERVICE_URL}/createIncidentReport`,
                method: REST_API_VERBS.POST,
                body,
            }),

            invalidatesTags: (result, error, { campusId }) => [
                'Report',
                { type: 'CampusReport', id: campusId },
                'GSPReport',
                SERVICE_URL
            ],
        }),

        createAttendanceReport: endpoint.mutation<void, IAttendanceReportPayload>({
            query: body => ({
                url: `/${SERVICE_URL}/updateAttendanceReport/${body._id}/${body.campusId}`,
                method: REST_API_VERBS.PUT,
                body,
            }),

            invalidatesTags: (result, error, { campusId }) => [
                'AttendanceReport',
                { type: 'CampusReport', id: campusId },
                'GSPReport',
                SERVICE_URL
            ],
        }),

        createGuestReport: endpoint.mutation<void, IGuestReportPayload>({
            query: body => ({
                url: `/${SERVICE_URL}/updateGuestReport/${body._id}/${body.campusId}`,
                method: REST_API_VERBS.PUT,
                body,
            }),

            invalidatesTags: (result, error, { campusId }) => [
                'GuestReport',
                { type: 'CampusReport', id: campusId },
                'GSPReport',
                SERVICE_URL
            ],
        }),

        createSecurityReport: endpoint.mutation<void, ISecurityReportPayload>({
            query: body => ({
                url: `/${SERVICE_URL}/updateSecurityReport/${body._id}/${body.campusId}`,
                method: REST_API_VERBS.PUT,
                body,
            }),

            invalidatesTags: (result, error, { campusId }) => [
                'SecurityReport',
                { type: 'CampusReport', id: campusId },
                'GSPReport',
                SERVICE_URL
            ],
        }),

        createTransferReport: endpoint.mutation<void, ITransferReportPayload>({
            query: body => ({
                url: `/${SERVICE_URL}/updateTransferReport/${body._id}/${body.campusId}`,
                method: REST_API_VERBS.PUT,
                body,
            }),

            invalidatesTags: (result, error, { campusId }) => [
                'TransferReport',
                { type: 'CampusReport', id: campusId },
                'GSPReport',
                SERVICE_URL
            ],
        }),

        createServiceReport: endpoint.mutation<void, IServiceReportPayload>({
            query: body => ({
                url: `/${SERVICE_URL}/updateServiceReport/${body._id}/${body.campusId}`,
                method: REST_API_VERBS.PUT,
                body,
            }),

            invalidatesTags: (result, error, { campusId, _id }) => [
                { type: 'ServiceReport', id: _id },
                { type: 'CampusReport', id: campusId },
                'GSPReport',
                SERVICE_URL
            ],
        }),

        getGSPReport: endpoint.query<IGSPReport, { serviceId?: IService['_id']; campusId?: ICampus['_id'] }>({
            query: params => ({
                url: `/${SERVICE_URL}/gspReport`,
                method: REST_API_VERBS.GET,
                params,
            }),

            providesTags: (result, error, { serviceId, campusId }) => [
                'GSPReport',
                serviceId ? { type: 'ServiceReport', id: serviceId } : 'Report',
                campusId ? { type: 'CampusReport', id: campusId } : 'Report',
                SERVICE_URL
            ],

            transformResponse: (res: IDefaultResponse<IGSPReport>) => res.data,
        }),

        getGlobalWorkforceSummary: endpoint.query<IGlobalWorkforceReportSummary, void>({
            query: () => ({
                url: `/${SERVICE_URL}/gspReport`,
                method: REST_API_VERBS.GET,
            }),

            providesTags: ['GlobalReport', 'GSPReport', SERVICE_URL],

            transformResponse: (res: IDefaultResponse<IGlobalWorkforceReportSummary>) => res.data,
        }),

        getCarsSummary: endpoint.query<ICarsReportSummary, void>({
            query: () => ({
                url: `/${SERVICE_URL}/carsReport`,
                method: REST_API_VERBS.GET,
            }),

            providesTags: ['Report', SERVICE_URL],

            transformResponse: (res: IDefaultResponse<ICarsReportSummary>) => res.data,
        }),

        getServiceAttendanceSummary: endpoint.query<IServiceAttendanceReportSummary, void>({
            query: () => ({
                url: `/${SERVICE_URL}/serviceAttendanceReport`,
                method: REST_API_VERBS.GET,
            }),

            providesTags: ['AttendanceReport', SERVICE_URL],

            transformResponse: (res: IDefaultResponse<IServiceAttendanceReportSummary>) => res.data,
        }),

        getGuestSummary: endpoint.query<IGuestReportSummary, void>({
            query: () => ({
                url: `/${SERVICE_URL}/guestReport`,
                method: REST_API_VERBS.GET,
            }),

            providesTags: ['GuestReport', SERVICE_URL],

            transformResponse: (res: IDefaultResponse<IGuestReportSummary>) => res.data,
        }),

        getBusSummary: endpoint.query<IBusReportSummary, void>({
            query: () => ({
                url: `/${SERVICE_URL}/busReport`,
                method: REST_API_VERBS.GET,
            }),

            providesTags: ['Report', SERVICE_URL],

            transformResponse: (res: IDefaultResponse<IBusReportSummary>) => res.data,
        }),

        getDepartmentalReport: endpoint.query<
            IDepartmentReportResponse,
            { departmentId: IDepartment['_id']; serviceId: IService['_id']; campusId: ICampus['_id'] }
        >({
            query: ({ departmentId, serviceId, campusId }) => ({
                url: `/${SERVICE_URL}/getReportByDepartment/${departmentId}/${serviceId}/${campusId}`,
                method: REST_API_VERBS.GET,
            }),

            providesTags: (result, error, { departmentId, serviceId, campusId }) => [
                { type: 'DepartmentReport', id: departmentId },
                { type: 'ServiceReport', id: serviceId },
                { type: 'CampusReport', id: campusId },
                SERVICE_URL
            ],

            transformResponse: (res: IDefaultResponse<IDepartmentReportResponse>) => res.data,
        }),

        getCampusReportSummary: endpoint.query<
            ICampusReportSummary,
            { serviceId: IService['_id']; campusId: ICampus['_id'] }
        >({
            query: ({ serviceId, campusId }) => ({
                url: `/${SERVICE_URL}/getServiceReports/${serviceId}/${campusId}`,
                method: REST_API_VERBS.GET,
            }),

            providesTags: (result, error, { serviceId, campusId }) => [
                { type: 'ServiceReport', id: serviceId },
                { type: 'CampusReport', id: campusId },
                SERVICE_URL
            ],

            transformResponse: (res: IDefaultResponse<ICampusReportSummary>) => res.data,
        }),

        getDepartmentReportsList: endpoint.query<IDepartmentAndIncidentReport, IDepartment['_id']>({
            query: departmentId => ({
                url: `/${SERVICE_URL}/getReportByDepartmentID/${departmentId}`,
                method: REST_API_VERBS.GET,
            }),

            providesTags: (result, error, departmentId) => [
                { type: 'DepartmentReport', id: departmentId },
                SERVICE_URL
            ],

            transformResponse: (res: IDefaultResponse<IDepartmentAndIncidentReport>) => res.data,
        }),

        submitGSPReport: endpoint.mutation<any, IGSPReportPayload>({
            query: body => ({
                url: `/${SERVICE_URL}/submitCampusReport`,
                method: REST_API_VERBS.POST,
                body,
            }),

            invalidatesTags: (result, error, { campusId }) => [
                'GSPReport',
                { type: 'CampusReport', id: campusId },
                'GlobalReport',
                SERVICE_URL
            ],
        }),

        getCampusReportList: endpoint.query<ICampusReportList, ICampusReportListPayload>({
            query: params => ({
                url: `/${SERVICE_URL}/getCampusPastReports`,
                method: REST_API_VERBS.GET,
                params,
            }),

            providesTags: (result, error, { campusId }) => [
                { type: 'CampusReport', id: campusId },
                SERVICE_URL
            ],

            transformResponse: (res: IDefaultResponse<ICampusReportList>) => res?.data,
        }),

        getGlobalReportList: endpoint.query<IGlobalReportList, IGlobalReportListPayload>({
            query: params => ({
                url: `/${SERVICE_URL}/gspSubmittedReport/${params.serviceId}`,
                method: REST_API_VERBS.GET,
                params,
            }),

            providesTags: ['GlobalReport', SERVICE_URL],

            transformResponse: (res: IDefaultResponse<IGlobalReportList>) => res?.data,
        }),

        getGraphAttendanceReports: endpoint.query<IGraphAttendanceReports, IDefaultQueryParams>({
            query: params => ({
                url: `/${SERVICE_URL}/getReportByGraphs`,
                method: REST_API_VERBS.GET,
                params,
            }),

            providesTags: ['AttendanceReport', SERVICE_URL],

            transformResponse: (res: IDefaultResponse<IGraphAttendanceReports>) => res?.data,
        }),
    }),
});

// Use exported hook in relevant components
export const {
    useGetGSPReportQuery,
    useGetBusSummaryQuery,
    useGetCarsSummaryQuery,
    useGetGuestSummaryQuery,
    useSubmitGSPReportMutation,
    useGetCampusReportListQuery,
    useGetGlobalReportListQuery,
    useCreateGuestReportMutation,
    useGetDepartmentalReportQuery,
    useGetCampusReportSummaryQuery,
    useCreateServiceReportMutation,
    useCreateTransferReportMutation,
    useCreateSecurityReportMutation,
    useCreateIncidentReportMutation,
    useCreateChildCareReportMutation,
    useGetDepartmentReportsListQuery,
    useCreateAttendanceReportMutation,
    useGetGlobalWorkforceSummaryQuery,
    useGetGraphAttendanceReportsQuery,
    useGetServiceAttendanceSummaryQuery,
} = reportsServiceSlice;
