import React from 'react';
import FlatListComponent from '../../../components/composite/flat-list';
import { campusColumns_1, myAttendanceColumns, teamAttendanceDataColumns } from './flatListConfig';
import { MonthPicker } from '../../../components/composite/date-picker';
import { useGetAttendanceQuery } from '../../../store/services/attendance';
import useRole from '../../../hooks/role';
import { IAttendance } from '../../../store/types';
import { useGetLatestServiceQuery } from '../../../store/services/services';
import { useGetUsersByDepartmentIdQuery } from '../../../store/services/account';
import moment from 'moment';
import ErrorBoundary from '../../../components/composite/error-boundary';
import useFetchMoreData from '../../../hooks/fetch-more-data';

export const MyAttendance: React.FC = React.memo(() => {
    const { user } = useRole();

    const [page, setPage] = React.useState<number>(1);

    const { data, isLoading, isFetching, isSuccess } = useGetAttendanceQuery({
        userId: user?._id,
        limit: 10,
        page,
    });

    const { data: moreData } = useFetchMoreData({ dataSet: data, isSuccess, uniqKey: '_id' });

    const fetchMoreData = () => {
        if (!isFetching && !isLoading) {
            if (data?.length) {
                setPage(prev => prev + 1);
            } else {
                setPage(prev => prev - 1);
            }
        }
    };

    return (
        <ErrorBoundary>
            <FlatListComponent
                padding
                fetchMoreData={fetchMoreData}
                columns={myAttendanceColumns}
                data={moreData as IAttendance[]}
                isLoading={isLoading || isFetching}
                refreshing={isLoading || isFetching}
                ListFooterComponentStyle={{ marginVertical: 20 }}
            />
        </ErrorBoundary>
    );
});

export const TeamAttendance: React.FC = React.memo(() => {
    const { user } = useRole();

    const { data: latestService } = useGetLatestServiceQuery(user?.campus?._id);
    const {
        data: membersClockedIn,
        isLoading,
        isFetching,
    } = useGetAttendanceQuery({
        departmentId: user?.department?._id,
        serviceId: latestService?._id,
    });

    const { data: members } = useGetUsersByDepartmentIdQuery(user?.department._id);

    const allMembers = members || [];
    const membersClockedInValid = membersClockedIn || [];
    const mergedUsers = [...membersClockedInValid, ...allMembers] as any;

    const mergedAttendanceWithMemberList = React.useMemo(
        () => [
            ...mergedUsers.map((member: any) => {
                return {
                    createdAt: moment(),
                    clockIn: member?.clockIn || 0,
                    clockOut: member?.clockOut || 0,
                    userId: member?.user?._id || member._id,
                    lastName: member?.lastName || member?.user?.lastName,
                    firstName: member?.firstName || member?.user?.firstName,
                };
            }),
        ],
        [membersClockedIn, mergedUsers]
    );

    // Filter out clocked in members from user list
    const uniqueAttendanceList = React.useMemo<any[]>(
        () =>
            mergedAttendanceWithMemberList.filter(
                (attendance, index) =>
                    mergedAttendanceWithMemberList.findIndex(item => item.userId === attendance.userId) === index
            ),
        [mergedAttendanceWithMemberList]
    );

    return (
        <ErrorBoundary>
            <MonthPicker today />
            <FlatListComponent
                padding
                data={uniqueAttendanceList}
                isLoading={isLoading || isFetching}
                columns={teamAttendanceDataColumns}
                refreshing={isLoading || isFetching}
                ListFooterComponentStyle={{ marginVertical: 20 }}
            />
        </ErrorBoundary>
    );
});

export const CampusAttendance: React.FC = React.memo(() => {
    const { user } = useRole();
    const [page, setPage] = React.useState<number>(1);

    const { data: latestService } = useGetLatestServiceQuery(user.campus._id);
    const { data, isLoading, isSuccess, isFetching } = useGetAttendanceQuery(
        {
            page,
            limit: 20,
            campusId: user?.campus._id,
            serviceId: latestService?._id,
        },
        {
            skip: !latestService,
            refetchOnMountOrArgChange: true,
        }
    );

    const fetchMoreData = () => {
        if (!isFetching && !isLoading) {
            if (data?.length) {
                setPage(prev => prev + 1);
            } else {
                setPage(prev => prev - 1);
            }
        }
    };

    const { data: moreData } = useFetchMoreData({ dataSet: data, isSuccess: isSuccess, uniqKey: '_id' });

    return (
        <ErrorBoundary>
            <MonthPicker today />
            <FlatListComponent
                padding
                columns={campusColumns_1}
                fetchMoreData={fetchMoreData}
                data={moreData as IAttendance[]}
                isLoading={isLoading || isFetching}
                refreshing={isLoading || isFetching}
                ListFooterComponentStyle={{ marginVertical: 20 }}
            />
        </ErrorBoundary>
    );
});
