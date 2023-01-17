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
import { IAttendance } from '../../../store/types';

export const MyAttendance: React.FC = React.memo(() => {
    const { user } = useRole();

    const { data, isLoading, refetch, isSuccess } =
        useGetAttendanceByUserIdQuery(user?.userId as string);

    const handleRefresh = () => {
        refetch();
    };

    return (
        <>
            <MonthPicker />
            <FlatListComponent
                padding
                isLoading={isLoading}
                refreshing={isLoading}
                onRefresh={handleRefresh}
                data={data as IAttendance[]}
                columns={myAttendanceColumns}
            />
        </>
    );
});

export const TeamAttendance: React.FC = React.memo(() => {
    const { user } = useRole();

    const { data, isLoading, refetch, isSuccess } =
        useGetAttendanceByUserIdQuery(user?.userId as string);

    const handleRefresh = () => {
        refetch();
    };

    return (
        <>
            <MonthPicker />
            <FlatListComponent
                padding
                isLoading={isLoading}
                refreshing={isLoading}
                onRefresh={handleRefresh}
                data={data as IAttendance[]}
                columns={teamAttendanceDataColumns}
            />
        </>
    );
});

export const CampusAttendance: React.FC = React.memo(() => {
    const { user } = useRole();

    const { data, isLoading, refetch, isSuccess } =
        useGetAttendanceByCampusIdQuery(user?.campus.id as string, {
            skip: !user,
            refetchOnMountOrArgChange: true,
        });

    const handleRefresh = () => {
        refetch();
    };

    return (
        <>
            <MonthPicker />
            <FlatListComponent
                padding
                isLoading={isLoading}
                refreshing={isLoading}
                onRefresh={handleRefresh}
                data={data as IAttendance[]}
                columns={myAttendanceColumns}
            />
        </>
    );
});
