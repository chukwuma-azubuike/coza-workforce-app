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
    departmentalReport: {
        status: IReportStatus;
        departmentName: string;
        report: {
            _id: string;
            departmentId: string;
            serviceId: string;
        } & R;
    }[];
    incidentReport: unknown[];
}

export const reportsServiceSlice = createApi({
    reducerPath: SERVICE_URL,

    baseQuery: fetchUtils.baseQuery,

    endpoints: endpoint => ({
        createChildCareReport: endpoint.mutation<void, IChildCareReportPayload>({
            query: body => ({
                url: `/${SERVICE_URL}/updateChildChareReport/${body._id}`,
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
                url: `/${SERVICE_URL}/updateAttendanceReport/${body._id}t`,
                method: REST_API_VERBS.PUT,
                body,
            }),
        }),

        createGuestReport: endpoint.mutation<void, IGuestReportPayload>({
            query: body => ({
                url: `/${SERVICE_URL}/updateGuestReport/${body._id}`,
                method: REST_API_VERBS.PUT,
                body,
            }),
        }),

        createSecurityReport: endpoint.mutation<void, ISecurityReportPayload>({
            query: body => ({
                url: `/${SERVICE_URL}/updateSecurityReport/${body._id}`,
                method: REST_API_VERBS.PUT,
                body,
            }),
        }),

        createTransferReport: endpoint.mutation<void, ITransferReportPayload>({
            query: body => ({
                url: `/${SERVICE_URL}/updateTransferReport/${body._id}`,
                method: REST_API_VERBS.PUT,
                body,
            }),
        }),

        createServiceReport: endpoint.mutation<void, IServiceReportPayload>({
            query: body => ({
                url: `/${SERVICE_URL}/updateServiceReport/${body._id}`,
                method: REST_API_VERBS.PUT,
                body,
            }),
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
            { departmentId: IDepartment['_id']; serviceId: IService['_id'] }
        >({
            query: ({ departmentId, serviceId }) => ({
                url: `/${SERVICE_URL}/getReportByDepartment/${departmentId}/${serviceId}`,
                method: REST_API_VERBS.GET,
            }),

            transformResponse: (res: IDefaultResponse<IDepartmentReportResponse>) => res.data,
        }),

        getCampusReportSummary: endpoint.query<ICampusReportSummary, IService['_id']>({
            query: serviceId => ({
                url: `/${SERVICE_URL}/getServiceReports/${serviceId}`,
                method: REST_API_VERBS.GET,
            }),

            transformResponse: (res: IDefaultResponse<ICampusReportSummary>) => res.data,
        }),

        getDepartmentReportsList: endpoint.query<IDepartmentReportResponse[], IDepartment['_id']>({
            query: departmentId => ({
                url: `/${SERVICE_URL}/getReportByDepartment/${departmentId}`,
                method: REST_API_VERBS.GET,
            }),

            transformResponse: (res: IDefaultResponse<IDepartmentReportResponse[]>) => res.data,
        }),

        // Add your endpoints here
    }),
});

// Use exported hook in relevant components
export const {
    useGetBusSummaryQuery,
    useGetCarsSummaryQuery,
    useGetGuestSummaryQuery,
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
    useGetServiceAttendanceSummaryQuery,
} = reportsServiceSlice;
