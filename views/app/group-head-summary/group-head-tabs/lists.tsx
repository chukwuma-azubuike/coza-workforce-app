import dayjs from 'dayjs';
import React, { memo, useMemo } from 'react';
import { Platform, View } from 'react-native';
import { IFlatListColumn } from '@components/composite/flat-list';
import { useGetPermissionsQuery } from '@store/services/permissions';
import { useGetTicketsQuery } from '@store/services/tickets';
import { IPermission, ITicket } from '@store/types';
import { SelectComponent, SelectItemComponent } from '@components/atoms/select';
import ErrorBoundary from '@components/composite/error-boundary';
import FlatListComponent from '@components/composite/flat-list';
import useFetchMoreData from '@hooks/fetch-more-data';
import { useGetUsersByDepartmentIdQuery } from '@store/services/account';
import { useGetAttendanceQuery } from '@store/services/attendance';
import { useGetServicesQuery } from '@store/services/services';
import { IService } from '@store/types';
import Utils from '@utils/index';
import { PermissionListRow } from '../../permissions/permissions-list';
import { TicketListRow } from '../../tickets/ticket-list';
import { teamAttendanceDataColumns } from './flatListConfig';

const isAndroid = Platform.OS === 'android';

export const GroupHeadTeamAttendance: React.FC<{ departmentId: string }> = React.memo(({ departmentId }) => {
    const {
        data: services,
        refetch: refetchServices,
        isLoading: serviceIsLoading,
        isSuccess: servicesIsSuccess,
    } = useGetServicesQuery({});

    const [serviceId, setServiceId] = React.useState<IService['_id']>();

    const setService = (value: IService['_id']) => {
        setServiceId(value);
    };

    const filteredServices = React.useMemo<IService[] | undefined>(
        () => services && services.filter(service => dayjs().unix() > dayjs(service.clockInStartTime).unix()),
        [services, servicesIsSuccess]
    );

    const sortedServices = React.useMemo<IService[] | undefined>(
        () => filteredServices && Utils.sortByDate(filteredServices, 'serviceTime'),
        [filteredServices]
    );

    React.useEffect(() => {
        sortedServices && setServiceId(sortedServices[0]._id);
    }, [sortedServices]);

    const {
        isLoading,
        isFetching,
        refetch: refetchAttendance,
        data: membersClockedIn,
    } = useGetAttendanceQuery({
        serviceId: serviceId,
        departmentId,
    });

    const { data: members, refetch: usersRefetch } = useGetUsersByDepartmentIdQuery(departmentId);

    const allMembers = React.useMemo(() => {
        if (!members?.length) {
            return [];
        }

        return members?.map(member => {
            return {
                ...member,
                userId: member._id,
            };
        });
    }, [members]);

    const membersClockedInValid = React.useMemo(() => {
        if (!membersClockedIn?.length) {
            return [];
        }

        return membersClockedIn?.map(member => {
            return {
                ...member,
                userId: member.user._id,
            };
        });
    }, [membersClockedIn]);

    const mergedUsers = [...membersClockedInValid, ...allMembers] as any;

    const mergedAttendanceWithMemberList = React.useMemo(
        () => Utils.mergeDuplicatesByKey(mergedUsers, 'userId'),
        [membersClockedIn, mergedUsers]
    );

    const handleRefetch = () => {
        usersRefetch();
        refetchServices();
        refetchAttendance();
    };

    return (
        <ErrorBoundary>
            <View mb={2} className="px-2">
                <SelectComponent placeholder="Select Service" selectedValue={serviceId} onValueChange={setService}>
                    {sortedServices?.map((service, index) => (
                        <SelectItemComponent
                            value={service._id}
                            key={`service-${index}`}
                            isLoading={serviceIsLoading}
                            label={`${service.name} - ${dayjs(service.clockInStartTime).format('DD MMM YYYY')}`}
                        />
                    ))}
                </SelectComponent>
            </View>
            <FlatListComponent
                padding={isAndroid ? 3 : 1}
                onRefresh={handleRefetch}
                isLoading={isLoading || isFetching}
                columns={teamAttendanceDataColumns}
                refreshing={isLoading || isFetching}
                data={mergedAttendanceWithMemberList}
                ListFooterComponentStyle={{ marginVertical: 20 }}
            />
        </ErrorBoundary>
    );
});

export const GroupHeadTeamTicketsList: React.FC<{
    updatedListItem: ITicket;
    departmentId: string;
}> = memo(({ updatedListItem, departmentId }) => {
    const teamTicketsColumns: IFlatListColumn[] = [
        {
            dataIndex: 'createdAt',
            render: (_: ITicket, key) => <TicketListRow type="team" {..._} key={key} />,
        },
    ];

    const [page, setPage] = React.useState<number>(1);
    const { data, isLoading, isSuccess, isFetching } = useGetTicketsQuery(
        {
            departmentId,
            limit: 20,
            page,
        },
        { refetchOnMountOrArgChange: true }
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

    const preparedForSortData = useMemo(
        () =>
            moreData?.map((ticket: ITicket) => {
                return { ...ticket, sortDateKey: ticket?.updatedAt || ticket?.createdAt };
            }),
        [moreData]
    );

    const sortedData = React.useMemo(
        () => Utils.sortByDate(preparedForSortData || [], 'sortDateKey'),
        [preparedForSortData]
    );

    const groupedData = useMemo(
        () =>
            Utils.groupListByKey(
                Utils.replaceArrayItemByNestedKey(sortedData || [], updatedListItem, ['_id', updatedListItem?._id]),
                'sortDateKey'
            ),
        [updatedListItem?._id, sortedData]
    );

    return (
        <FlatListComponent
            data={groupedData}
            columns={teamTicketsColumns}
            fetchMoreData={fetchMoreData}
            isLoading={isLoading || isFetching}
            refreshing={isLoading || isFetching}
            emptyMessage={"Nothing here, let's keep it that way 😇"}
        />
    );
});

export const GroupHeadTeamPermissionsList: React.FC<{
    updatedListItem: IPermission;
    params: { departmentId: string; screenName: string };
}> = memo(({ updatedListItem, params }) => {
    const { departmentId, screenName } = params;

    const teamPermissionsColumns: IFlatListColumn[] = [
        {
            dataIndex: 'dateCreated',
            render: (_: IPermission, key) => (
                <PermissionListRow screen={{ name: screenName, value: departmentId }} type="team" {..._} key={key} />
            ),
        },
    ];

    const [page, setPage] = React.useState<number>(1);

    const { data, isLoading, isFetching, isSuccess } = useGetPermissionsQuery(
        { departmentId, limit: 20, page },
        {
            refetchOnMountOrArgChange: true,
        }
    );

    const { data: moreData } = useFetchMoreData({ uniqKey: '_id', dataSet: data, isSuccess });

    const fetchMoreData = () => {
        if (!isFetching && !isLoading) {
            if (data?.length) {
                setPage(prev => prev + 1);
            } else {
                setPage(prev => prev - 1);
            }
        }
    };

    const memoizedData = useMemo(
        () =>
            Utils.groupListByKey(
                Utils.sortByDate(
                    Utils.replaceArrayItemByNestedKey(moreData || [], updatedListItem, ['_id', updatedListItem?._id]),
                    'createdAt'
                ),
                'createdAt'
            ),
        [updatedListItem?._id, moreData]
    );

    return (
        <ErrorBoundary>
            {/* <PermissionStats total={21} pending={2} declined={4} approved={15} /> */}
            <FlatListComponent
                data={memoizedData}
                refreshing={isFetching}
                fetchMoreData={fetchMoreData}
                columns={teamPermissionsColumns}
                isLoading={isLoading || isFetching}
            />
        </ErrorBoundary>
    );
});
