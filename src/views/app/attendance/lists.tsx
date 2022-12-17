import React from 'react';
import FlatListComponent from '../../../components/composite/flat-list';
import {
    myAttendanceColumns,
    teamAttendanceDataColumns,
} from './flatListConfig';
import { MonthPicker } from '../../../components/composite/date-picker';
import {
    useGetAttendanceByCampusIdQuery,
    useGetAttendanceByUserIdQuery,
} from '../../../store/services/attendance';
import useRole from '../../../hooks/role';
import Loading from '../../../components/atoms/loading';

export const MyAttendance: React.FC = React.memo(() => {
    const { user } = useRole();

    const { data, isLoading } = useGetAttendanceByUserIdQuery(
        user?.userId as string,
        {
            skip: !user,
            refetchOnMountOrArgChange: true,
        }
    );

    return (
        <>
            <MonthPicker />
            {isLoading ? (
                <Loading />
            ) : (
                data && (
                    <FlatListComponent
                        columns={myAttendanceColumns}
                        data={data}
                    />
                )
            )}
        </>
    );
});

export const TeamAttendance: React.FC = React.memo(() => {
    const { user } = useRole();

    const { data, isLoading } = useGetAttendanceByUserIdQuery(
        user?.userId as string,
        {
            skip: !user,
            refetchOnMountOrArgChange: true,
        }
    );
    return (
        <>
            <MonthPicker />
            {isLoading ? (
                <Loading />
            ) : (
                data && (
                    <FlatListComponent
                        columns={teamAttendanceDataColumns}
                        data={data}
                    />
                )
            )}
        </>
    );
});

export const CampusAttendance: React.FC = React.memo(() => {
    const { user } = useRole();

    const { data, isLoading } = useGetAttendanceByCampusIdQuery(
        user?.campus.id as string,
        {
            skip: !user,
            refetchOnMountOrArgChange: true,
        }
    );
    return (
        <>
            <MonthPicker />
            {isLoading ? (
                <Loading />
            ) : (
                data && (
                    <FlatListComponent
                        columns={myAttendanceColumns}
                        data={data}
                    />
                )
            )}
        </>
    );
});
