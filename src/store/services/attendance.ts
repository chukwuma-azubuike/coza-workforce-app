import { createApi } from '@reduxjs/toolkit/query/react';
import { GeoCoordinates } from 'react-native-geolocation-service';
import { IAttendance, ICampus, IDefaultQueryParams, IDefaultResponse, IUser, REST_API_VERBS } from '../types';
import { fetchUtils } from './fetch-utils';

const SERVICE_URL = 'attendance';

export type ICampusCoordinates = Pick<GeoCoordinates, 'latitude' | 'longitude'>;

export interface IClockInPayload {
    userId: string;
    clockIn: string | null;
    clockOut: string | null;
    serviceId: string;
    coordinates: {
        lat: string;
        long: string;
    };
    roleId: IUser['role']['_id'];
    campusId: ICampus['_id'];
    departmentId: string;
}

export type IMutateAttendanceResponse = IDefaultResponse<IAttendance>;

export type IGetAttendanceListResponse = IDefaultResponse<IAttendance[]>;

export const attendanceServiceSlice = createApi({
    tagTypes: ['Attendance'],

    reducerPath: SERVICE_URL,

    baseQuery: fetchUtils.baseQuery,

    endpoints: endpoint => ({
        clockIn: endpoint.mutation<IAttendance, IClockInPayload>({
            query: body => ({
                url: `/${SERVICE_URL}/clockin`,
                method: REST_API_VERBS.POST,
                body,
            }),

            invalidatesTags: ['Attendance'],

            transformResponse: (response: IMutateAttendanceResponse) => response.data,
        }),

        clockOut: endpoint.mutation<IAttendance, string>({
            query: attendanceId => ({
                url: `/${SERVICE_URL}/clock-out/${attendanceId}`,
                method: REST_API_VERBS.PUT,
            }),

            invalidatesTags: ['Attendance'],

            transformResponse: (response: IMutateAttendanceResponse) => response.data,
        }),

        getAttendance: endpoint.query<IAttendance[], IDefaultQueryParams>({
            query: params => ({
                url: `/${SERVICE_URL}/getAttendance`,
                method: REST_API_VERBS.GET,
                params,
            }),

            providesTags: ['Attendance'],

            transformResponse: (response: IDefaultResponse<IAttendance[]>) => response.data,
        }),

        getAttendanceByUserId: endpoint.query<IAttendance[], string>({
            query: userId => `/${SERVICE_URL}/getAttendanceByUserId/${userId}`,

            transformResponse: (res: IGetAttendanceListResponse) => res.data,

            providesTags: ['Attendance'],
        }),

        getAttendanceByCampusId: endpoint.query<IAttendance[], string>({
            query: campusId => ({
                url: `${SERVICE_URL}/getAttendanceByCampusId/${campusId}`,
                method: REST_API_VERBS.GET,
            }),

            transformResponse: (res: IGetAttendanceListResponse) => res.data,
        }),

        getDepartmentAttendanceReport: endpoint.query<
            {
                attendance: number;
                departmentUsers: number;
            },
            { serviceId: string; departmentId: string }
        >({
            query: ({ serviceId, departmentId }) => ({
                url: `${SERVICE_URL}/departmentReport/${serviceId}/${departmentId} `,
                method: REST_API_VERBS.GET,
            }),

            transformResponse: (
                res: IDefaultResponse<{
                    attendance: number;
                    departmentUsers: number;
                }>
            ) => res.data,
        }),

        getLeadersAttendanceReport: endpoint.query<
            {
                attendance: number;
                leaderUsers: number;
            },
            { serviceId: string; campusId: string }
        >({
            query: ({ serviceId, campusId }) => ({
                url: `${SERVICE_URL}/leaderAttendanceReport/${serviceId}/${campusId} `,
                method: REST_API_VERBS.GET,
            }),

            transformResponse: (
                res: IDefaultResponse<{
                    attendance: number;
                    leaderUsers: number;
                }>
            ) => res.data,
        }),

        getWorkersAttendanceReport: endpoint.query<
            {
                attendance: number;
                workerUsers: number;
            },
            { serviceId: string; campusId: string }
        >({
            query: ({ serviceId, campusId }) => ({
                url: `${SERVICE_URL}/workersAttendanceReport/${serviceId}/${campusId} `,
                method: REST_API_VERBS.GET,
            }),

            transformResponse: (
                res: IDefaultResponse<{
                    attendance: number;
                    workerUsers: number;
                }>
            ) => res.data,
        }),

        // Add your endpoints here
    }),
});

// Use exported hook in relevant components
export const {
    useClockInMutation,
    useClockOutMutation,
    useGetAttendanceQuery,
    useGetAttendanceByUserIdQuery,
    useGetAttendanceByCampusIdQuery,
    useGetWorkersAttendanceReportQuery,
    useGetLeadersAttendanceReportQuery,
    useGetDepartmentAttendanceReportQuery,
} = attendanceServiceSlice;
