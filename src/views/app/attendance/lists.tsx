import React from 'react';
import FlatListComponent from '../../../components/composite/flat-list';
import {
    data,
    teamAttendanceData,
    myAttendanceColumns,
    teamAttendanceDataColumns,
} from './flatListConfig';
import { MonthPicker } from '../../../components/composite/date-picker';
import { useGetAttendanceByUserIdQuery } from '../../../store/services/attendance';
import useRole from '../../../hooks/role';

export const MyAttendance: React.FC = React.memo(() => {
    const { user } = useRole();

    const { data } = useGetAttendanceByUserIdQuery(user?.userId as string, {
        skip: !user,
        refetchOnMountOrArgChange: true,
    });

    return (
        <>
            <MonthPicker />
            {data && (
                <FlatListComponent columns={myAttendanceColumns} data={data} />
            )}
        </>
    );
});

export const TeamAttendance: React.FC = React.memo(() => {
    const { user } = useRole();

    const { data } = useGetAttendanceByUserIdQuery(user?.userId as string, {
        skip: !user,
        refetchOnMountOrArgChange: true,
    });
    return (
        <>
            <MonthPicker />
            {data && (
                <FlatListComponent
                    columns={teamAttendanceDataColumns}
                    data={teamAttendanceData}
                />
            )}
        </>
    );
});

export const CampusAttendance: React.FC = React.memo(() => {
    const { user } = useRole();

    const { data } = useGetAttendanceByUserIdQuery(user?.userId as string, {
        skip: !user,
        refetchOnMountOrArgChange: true,
    });
    return (
        <>
            <MonthPicker />
            {data && (
                <FlatListComponent columns={myAttendanceColumns} data={data} />
            )}
        </>
    );
});
