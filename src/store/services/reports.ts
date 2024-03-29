import { ICampus, IDefaultQueryParams, IGraphAttendanceReports, IStatus, IUser } from './../types/index';
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
    departmentalReport: {
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

    endpoints: endpoint => ({
        createChildCareReport: endpoint.mutation<void, IChildCareReportPayload>({
            query: body => ({
                url: `/${SERVICE_URL}/updateChildChareReport/${body._id}/${body.campusId}`,
                method: REST_API_VERBS.PUT,
                body,
            }),
        }),

        createIncidentReport: endpoint.mutation<void, IIncidentReportPayload>({
            query: body => ({
                url: `/${SERVICE_URL}/createIncidentReport`,
                method: REST_API_VERBS.POST,
                body,
            }),
        }),

        createAttendanceReport: endpoint.mutation<void, IAttendanceReportPayload>({
            query: body => ({
                url: `/${SERVICE_URL}/updateAttendanceReport/${body._id}/${body.campusId}`,
                method: REST_API_VERBS.PUT,
                body,
            }),
        }),

        createGuestReport: endpoint.mutation<void, IGuestReportPayload>({
            query: body => ({
                url: `/${SERVICE_URL}/updateGuestReport/${body._id}/${body.campusId}`,
                method: REST_API_VERBS.PUT,
                body,
            }),
        }),

        createSecurityReport: endpoint.mutation<void, ISecurityReportPayload>({
            query: body => ({
                url: `/${SERVICE_URL}/updateSecurityReport/${body._id}/${body.campusId}`,
                method: REST_API_VERBS.PUT,
                body,
            }),
        }),

        createTransferReport: endpoint.mutation<void, ITransferReportPayload>({
            query: body => ({
                url: `/${SERVICE_URL}/updateTransferReport/${body._id}/${body.campusId}`,
                method: REST_API_VERBS.PUT,
                body,
            }),
        }),

        createServiceReport: endpoint.mutation<void, IServiceReportPayload>({
            query: body => ({
                url: `/${SERVICE_URL}/updateServiceReport/${body._id}/${body.campusId}`,
                method: REST_API_VERBS.PUT,
                body,
            }),
        }),

        getGSPReport: endpoint.query<IGSPReport, { serviceId?: IService['_id']; campusId?: ICampus['_id'] }>({
            query: params => ({
                url: `/${SERVICE_URL}/gspReport`,
                method: REST_API_VERBS.GET,
                params,
            }),

            transformResponse: (res: IDefaultResponse<IGSPReport>) => res.data,
        }),

        getGlobalWorkforceSummary: endpoint.query<IGlobalWorkforceReportSummary, void>({
            query: () => ({
                url: `/${SERVICE_URL}/gspReport`,
                method: REST_API_VERBS.GET,
            }),

            transformResponse: (res: IDefaultResponse<IGlobalWorkforceReportSummary>) => res.data,
        }),

        getCarsSummary: endpoint.query<ICarsReportSummary, void>({
            query: () => ({
                url: `/${SERVICE_URL}/carsReport`,
                method: REST_API_VERBS.GET,
            }),

            transformResponse: (res: IDefaultResponse<ICarsReportSummary>) => res.data,
        }),

        getServiceAttendanceSummary: endpoint.query<IServiceAttendanceReportSummary, void>({
            query: () => ({
                url: `/${SERVICE_URL}/serviceAttendanceReport`,
                method: REST_API_VERBS.GET,
            }),

            transformResponse: (res: IDefaultResponse<IServiceAttendanceReportSummary>) => res.data,
        }),

        getGuestSummary: endpoint.query<IGuestReportSummary, void>({
            query: () => ({
                url: `/${SERVICE_URL}/guestReport`,
                method: REST_API_VERBS.GET,
            }),

            transformResponse: (res: IDefaultResponse<IGuestReportSummary>) => res.data,
        }),

        getBusSummary: endpoint.query<IBusReportSummary, void>({
            query: () => ({
                url: `/${SERVICE_URL}/busReport`,
                method: REST_API_VERBS.GET,
            }),

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

            transformResponse: (res: IDefaultResponse<ICampusReportSummary>) => res.data,
        }),

        getDepartmentReportsList: endpoint.query<IDepartmentAndIncidentReport, IDepartment['_id']>({
            query: departmentId => ({
                url: `/${SERVICE_URL}/getReportByDepartmentID/${departmentId}`,
                method: REST_API_VERBS.GET,
            }),

            transformResponse: (res: IDefaultResponse<IDepartmentAndIncidentReport>) => res.data,
        }),

        submitGSPReport: endpoint.mutation<any, IGSPReportPayload>({
            query: body => ({
                url: `/${SERVICE_URL}/submitCampusReport`,
                method: REST_API_VERBS.POST,
                body,
            }),
        }),

        getCampusReportList: endpoint.query<ICampusReportList, ICampusReportListPayload>({
            query: params => ({
                url: `/${SERVICE_URL}/getCampusPastReports`,
                method: REST_API_VERBS.GET,
                params,
            }),

            transformResponse: (res: IDefaultResponse<ICampusReportList>) => res?.data,
        }),

        getGlobalReportList: endpoint.query<IGlobalReportList, IGlobalReportListPayload>({
            query: params => ({
                url: `/${SERVICE_URL}/gspSubmittedReport/${params.serviceId}`,
                method: REST_API_VERBS.GET,
                params,
            }),

            transformResponse: (res: IDefaultResponse<IGlobalReportList>) => res?.data,
        }),

        getGraphAttendanceReports: endpoint.query<IGraphAttendanceReports, IDefaultQueryParams>({
            query: params => ({
                url: `/${SERVICE_URL}/getReportByGraphs`,
                method: REST_API_VERBS.GET,
                params,
            }),

            transformResponse: (res: IDefaultResponse<IGraphAttendanceReports>) => res?.data,
        }),

        // Add your endpoints here
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
