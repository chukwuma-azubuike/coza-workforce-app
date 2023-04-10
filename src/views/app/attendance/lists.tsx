import React from 'react';
import FlatListComponent from '../../../components/composite/flat-list';
import { campusColumns_1, myAttendanceColumns, teamAttendanceDataColumns } from './flatListConfig';
import { MonthPicker } from '../../../components/composite/date-picker';
import { useGetAttendanceByUserIdQuery, useGetAttendanceQuery } from '../../../store/services/attendance';
import useRole from '../../../hooks/role';
import { IAttendance } from '../../../store/types';
import { useGetLatestServiceQuery } from '../../../store/services/services';
import { useGetUsersByDepartmentIdQuery } from '../../../store/services/account';
import moment from 'moment';
import ErrorBoundary from '../../../components/composite/error-boundary';
// import ButtonComponent from '../../../components/atoms/button'; // TODO: Restored when pagination is fixed
import useFetchMoreData from '../../../hooks/fetch-more-data';

export const MyAttendance: React.FC = React.memo(() => {
    const { user } = useRole();

    const { data, isLoading, refetch, isFetching } = useGetAttendanceByUserIdQuery(
        user?._id || (user?.userId as string)
    );

    return (
        <ErrorBoundary>
            <MonthPicker />
            <FlatListComponent
                padding
                onRefresh={refetch}
                data={data as IAttendance[]}
                columns={myAttendanceColumns}
                isLoading={isLoading || isFetching}
                refreshing={isLoading || isFetching}
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
        refetch,
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
                onRefresh={refetch}
                data={uniqueAttendanceList}
                isLoading={isLoading || isFetching}
                columns={teamAttendanceDataColumns}
                refreshing={isLoading || isFetching}
            />
        </ErrorBoundary>
    );
});

export const CampusAttendance: React.FC = React.memo(() => {
    const { user } = useRole();
    // TODO: Restored when pagination is fixed
    // const [page, setPageCount] = React.useState<number>(1);

    const { data: latestService } = useGetLatestServiceQuery(user.campus._id);
    const { data, isLoading, refetch, isSuccess, isFetching } = useGetAttendanceQuery(
        {
            // page, // TODO: Restored when pagination is fixed
            limit: 50,
            campusId: user?.campus._id,
            serviceId: latestService?._id,
        },
        {
            skip: !latestService,
            refetchOnMountOrArgChange: true,
        }
    );

    // TODO: Restored when pagination is fixed
    // const setPage = (pageArg: number) => () => {
    //     console.log('End reached!', page + pageArg);
    //     setPageCount(prev => {
    //         if (prev + pageArg > 0) return prev + pageArg;
    //         return prev;
    //     });
    // };

    const { data: moreData } = useFetchMoreData({ dataSet: data, isSuccess: isSuccess });

    return (
        <ErrorBoundary>
            <MonthPicker today />
            <FlatListComponent
                padding
                columns={campusColumns_1}
                data={moreData as IAttendance[]}
                // fetchMoreData={setPage(1)} // TODO: Restored when pagination is fixed
                onRefresh={latestService && refetch}
                isLoading={isLoading || isFetching}
                refreshing={isLoading || isFetching}
            />
            {/* TODO: Restored when pagination is fixed */}
            {/* <ButtonComponent
                mt={4}
                size="xs"
                secondary
                width={120}
                margin="auto"
                onPress={setPage(1)}
                isLoading={isLoading || isFetching}
                isDisabled={isLoading || isFetching}
            >
                Load more
            </ButtonComponent> */}
        </ErrorBoundary>
    );
});
