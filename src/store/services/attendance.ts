import { createApi } from '@reduxjs/toolkit/query/react';
import { GeoCoordinates } from 'react-native-geolocation-service';
import { IAttendance, IDefaultResponse } from '../types';
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

export const attendanceServiceSlice = createApi({
    reducerPath: SERVICE_URL,

    baseQuery: fetchUtils.baseQuery,

    endpoints: endpoint => ({
        clockIn: endpoint.mutation<IAttendance, IClockInPayload>({
            query: body => ({
                url: `/${SERVICE_URL}/clockin`,
                method: 'POST',
                body,
            }),

            transformResponse: (response: IMutateAttendanceResponse) =>
                response.data,
        }),

        clockOut: endpoint.mutation<IAttendance, string>({
            query: attendanceId => ({
                url: `/attendance/clock-out/${attendanceId}`,
                method: 'PUT',
            }),

            transformResponse: (response: IMutateAttendanceResponse) =>
                response.data,
        }),

        getAttendance: endpoint.query<IAttendance, string>({
            query: id => `/${SERVICE_URL}/${id}`,
        }),

        // Add your endpoints here
    }),
});

// Use exported hook in relevant components
export const {
    useClockInMutation,
    useClockOutMutation,
    useGetAttendanceQuery,
} = attendanceServiceSlice;
