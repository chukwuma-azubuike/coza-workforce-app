import { createApi } from '@reduxjs/toolkit/query/react';
import { IAttendance, IUser } from '../types';
import { fetchUtils } from './fetch-utils';

const SERVICE_URL = 'attendance';

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
        // Add your endpoints here
    }),
});

// Use exported hook in relevant components
export const { useGetAttendanceQuery, usePostAttendanceMutation } =
    attendanceServiceSlice;
