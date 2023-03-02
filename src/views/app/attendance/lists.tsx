import React from 'react';
import FlatListComponent from '../../../components/composite/flat-list';
import { myAttendanceColumns, teamAttendanceDataColumns } from './flatListConfig';
import { MonthPicker } from '../../../components/composite/date-picker';
import {
    useGetAttendanceByCampusIdQuery,
    useGetAttendanceByUserIdQuery,
    useGetAttendanceQuery,
} from '../../../store/services/attendance';
import useRole from '../../../hooks/role';
import { IAttendance } from '../../../store/types';

export const MyAttendance: React.FC = React.memo(() => {
    const { user } = useRole();

    const { data, isLoading, refetch, isSuccess, isFetching } = useGetAttendanceByUserIdQuery(user?.userId as string);

    return (
        <>
            <MonthPicker />
            <FlatListComponent
                padding
                onRefresh={refetch}
                data={data as IAttendance[]}
                columns={myAttendanceColumns}
                isLoading={isLoading || isFetching}
                refreshing={isLoading || isFetching}
            />
        </>
    );
});

export const TeamAttendance: React.FC = React.memo(() => {
    const { user } = useRole();

    const { data, isLoading, refetch, isFetching, isSuccess } = useGetAttendanceQuery({
        departmentId: user?.department._id,
    });

    return (
        <>
            <MonthPicker />
            <FlatListComponent
                padding
                onRefresh={refetch}
                data={data as IAttendance[]}
                isLoading={isLoading || isFetching}
                refreshing={isLoading || isFetching}
                columns={teamAttendanceDataColumns}
            />
        </>
    );
});

export const CampusAttendance: React.FC = React.memo(() => {
    const { user } = useRole();

    const { data, isLoading, refetch, isSuccess, isFetching } = useGetAttendanceByCampusIdQuery(
        user?.campus._id as string,
        {
            skip: !user,
            refetchOnMountOrArgChange: true,
        }
    );

    return (
        <>
            <MonthPicker />
            <FlatListComponent
                padding
                onRefresh={refetch}
                data={data as IAttendance[]}
                columns={myAttendanceColumns}
                isLoading={isLoading || isFetching}
                refreshing={isLoading || isFetching}
            />
        </>
    );
});
