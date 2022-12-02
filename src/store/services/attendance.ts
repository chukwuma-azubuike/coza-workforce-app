import { createApi } from '@reduxjs/toolkit/query/react';
import { GeoCoordinates, GeoPosition } from 'react-native-geolocation-service';
import { IAttendance, ICampus, IUser } from '../types';
import { fetchUtils } from './fetch-utils';

const SERVICE_URL = 'attendance';

interface IGetCampusByIdResponse {
    status: number;
    message: string;
    isError: boolean;
    isSuccessful: boolean;
    data: ICampus;
}

export type ICampusCoordinates = Pick<GeoCoordinates, 'latitude' | 'longitude'>;

export const attendanceServiceSlice = createApi({
    reducerPath: SERVICE_URL,

    baseQuery: fetchUtils.baseQuery,

    endpoints: endpoint => ({
        postAttendance: endpoint.mutation<void, IAttendance>({
            query: body => ({
                url: SERVICE_URL,
                method: 'POST',
                body,
            }),
        }),

        getAttendance: endpoint.query<void, Pick<IUser, 'id'>>({
            query: id => `/${SERVICE_URL}/${id}`,
        }),

        getCampusById: endpoint.query<IGetCampusByIdResponse, string>({
            query: campusId => `/campus/getCampus/${campusId}`,
        }),

        // Add your endpoints here
    }),
});

// Use exported hook in relevant components
export const {
    useGetAttendanceQuery,
    useGetCampusByIdQuery,
    usePostAttendanceMutation,
} = attendanceServiceSlice;
