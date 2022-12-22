import { createApi } from '@reduxjs/toolkit/query/react';
import { IChildCareReportPayload, IDefaultResponse } from '../types';
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

        getGlobalWorkforceSummary: endpoint.query<
            IGlobalWorkforceReportSummary,
            void
        >({
            query: () => ({
                url: `/${SERVICE_URL}/gspReport`,
                method: 'GET',
            }),

            transformResponse: (
                res: IDefaultResponse<IGlobalWorkforceReportSummary>
            ) => res.data,
        }),

        getCarsSummary: endpoint.query<ICarsReportSummary, void>({
            query: () => ({
                url: `/${SERVICE_URL}/carsReport`,
                method: 'GET',
            }),

            transformResponse: (res: IDefaultResponse<ICarsReportSummary>) =>
                res.data,
        }),

        getServiceAttendanceSummary: endpoint.query<
            IServiceAttendanceReportSummary,
            void
        >({
            query: () => ({
                url: `/${SERVICE_URL}/serviceAttendanceReport`,
                method: 'GET',
            }),

            transformResponse: (
                res: IDefaultResponse<IServiceAttendanceReportSummary>
            ) => res.data,
        }),

        getGuestSummary: endpoint.query<IGuestReportSummary, void>({
            query: () => ({
                url: `/${SERVICE_URL}/guestReport`,
                method: 'GET',
            }),

            transformResponse: (res: IDefaultResponse<IGuestReportSummary>) =>
                res.data,
        }),

        getBusSummary: endpoint.query<IBusReportSummary, void>({
            query: () => ({
                url: `/${SERVICE_URL}/busReport`,
                method: 'GET',
            }),

            transformResponse: (res: IDefaultResponse<IBusReportSummary>) =>
                res.data,
        }),

        // Add your endpoints here
    }),
});

// Use exported hook in relevant components
export const {
    useGetBusSummaryQuery,
    useGetCarsSummaryQuery,
    useGetGuestSummaryQuery,
    useCreateChildCareReportMutation,
    useGetGlobalWorkforceSummaryQuery,
    useGetServiceAttendanceSummaryQuery,
} = reportsServiceSlice;
