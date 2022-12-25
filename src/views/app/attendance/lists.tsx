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
import Empty from '../../../components/atoms/empty';
import If from '../../../components/composite/if-container';
import { IAttendance } from '../../../store/types';
import { FlatListSkeleton } from '../../../components/layout/skeleton';

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
            <If condition={isLoading}>
                <FlatListSkeleton />
            </If>
            <If condition={data && true}>
                <FlatListComponent
                    refreshing={isLoading}
                    onRefresh={handleRefresh}
                    data={data as IAttendance[]}
                    columns={myAttendanceColumns}
                />
            </If>
            <If condition={isSuccess && !data}>
                <Empty message="You have not marked any attendance yet" />
            </If>
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
            <If condition={data && true}>
                <FlatListComponent
                    refreshing={isLoading}
                    onRefresh={handleRefresh}
                    data={data as IAttendance[]}
                    columns={teamAttendanceDataColumns}
                />
            </If>
            <If condition={isSuccess && !data}>
                <Empty message="No member of your team has marked attendance yet" />
            </If>
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
            <If condition={data && true}>
                <FlatListComponent
                    refreshing={isLoading}
                    onRefresh={handleRefresh}
                    data={data as IAttendance[]}
                    columns={myAttendanceColumns}
                />
            </If>
            <If condition={isSuccess && !data}>
                <Empty message="No worker has marked attendance yet" />
            </If>
        </>
    );
});
