import { createApi } from '@reduxjs/toolkit/query/react';
import { GeoCoordinates } from 'react-native-geolocation-service';
import { IAttendance, IDefaultResponse, REST_API_VERBS } from '../types';
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

            transformResponse: (response: IMutateAttendanceResponse) =>
                response.data,
        }),

        clockOut: endpoint.mutation<IAttendance, string>({
            query: attendanceId => ({
                url: `/${SERVICE_URL}/clock-out/${attendanceId}`,
                method: REST_API_VERBS.PUT,
            }),

            invalidatesTags: ['Attendance'],

            transformResponse: (response: IMutateAttendanceResponse) =>
                response.data,
        }),

        getLatestAttendanceByUserId: endpoint.query<IAttendance, string>({
            query: userId => ({
                url: `/${SERVICE_URL}/getLatestAttendanceByUserId/${userId}`,
                method: REST_API_VERBS.GET,
            }),

            providesTags: ['Attendance'],

            transformResponse: (response: IMutateAttendanceResponse) =>
                response.data,
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

        // Add your endpoints here
    }),
});

// Use exported hook in relevant components
export const {
    useClockInMutation,
    useClockOutMutation,
    useGetAttendanceByUserIdQuery,
    useGetAttendanceByCampusIdQuery,
    useGetLatestAttendanceByUserIdQuery,
} = attendanceServiceSlice;
