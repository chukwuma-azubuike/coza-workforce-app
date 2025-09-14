import dayjs from 'dayjs';
import React, { memo, useMemo } from 'react';
import { Platform, View } from 'react-native';
import { useGetPermissionsQuery } from '@store/services/permissions';
import { useGetTicketsQuery } from '@store/services/tickets';
import { ITicket } from '@store/types';
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
import { TeamAttendanceRow } from '../../attendance/row-components';
import SectionListComponent from '~/components/composite/section-list';
import PickerSelect from '~/components/ui/picker-select';

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

    const minimalTeamData = useMemo(() => 
        mergedAttendanceWithMemberList?.map(({ _id, user, clockIn, clockOut, departmentName }) => ({
            _id,
            firstName: user?.firstName,
            lastName: user?.lastName,
            pictureUrl: user?.pictureUrl,
            clockIn,
            clockOut,
            departmentName
        })) || [],
        [mergedAttendanceWithMemberList]
    );

    const handleRefetch = () => {
        usersRefetch();
        refetchServices();
        refetchAttendance();
    };

    return (
        <ErrorBoundary>
            <View className="px-2 mb-2">
                <PickerSelect
                    labelKey="name"
                    valueKey="_id"
                    onValueChange={setService}
                    placeholder="Select Service"
                    items={sortedServices || []}
                    isLoading={serviceIsLoading}
                    customLabel={service =>
                        `${service.name} - ${dayjs(service.clockInStartTime).format('DD MMM YYYY')}`
                    }
                />
            </View>
            <FlatListComponent
                padding={isAndroid ? 3 : 1}
                onRefresh={handleRefetch}
                isLoading={isLoading || isFetching}
                renderItemComponent={({ item }: { item: any; index: number }) => (
                    <TeamAttendanceRow item={item as any} index={0} />
                )}
                refreshing={isLoading || isFetching}
                data={minimalTeamData}
                ListFooterComponentStyle={{ marginVertical: 20 }}
            />
        </ErrorBoundary>
    );
});

export const GroupHeadTeamTicketsList: React.FC<{
    departmentId: string;
}> = memo(({ departmentId }) => {
    const renderTeamTicketItem = React.useCallback(
        ({ item }: { item: ITicket; index: number }) => <TicketListRow type="team" {...item} />,
        []
    );

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

    const minimalTicketData = useMemo(() => 
        sortedData?.map(({ _id, user, departmentName, category, status, isIndividual, isDepartment }) => ({
            _id,
            user: user ? {
                firstName: user.firstName,
                lastName: user.lastName,
                pictureUrl: user.pictureUrl
            } : undefined,
            departmentName,
            category: category ? {
                categoryName: category.categoryName
            } : undefined,
            status,
            isIndividual,
            isDepartment
        })) || [],
        [sortedData]
    );

    return (
        <FlatListComponent
            data={minimalTicketData}
            renderItemComponent={renderTeamTicketItem}
            fetchMoreData={fetchMoreData}
            isLoading={isLoading || isFetching}
            refreshing={isLoading || isFetching}
            emptyMessage={"Nothing here, let's keep it that way 😇"}
        />
    );
});

export const GroupHeadTeamPermissionsList: React.FC<{
    params: { departmentId: string; screenName: string };
}> = memo(({ params }) => {
    const { departmentId, screenName } = params;

    const { data, isLoading, isFetching, isSuccess, refetch } = useGetPermissionsQuery(
        { departmentId, limit: 20 },
        {
            refetchOnMountOrArgChange: true,
        }
    );

    const { data: moreData } = useFetchMoreData({ uniqKey: '_id', dataSet: data, isSuccess });

    return (
        <ErrorBoundary>
            <SectionListComponent
                data={moreData}
                field="createdAt"
                refetch={refetch}
                itemHeight={66.7}
                refreshing={isFetching}
                column={PermissionListRow}
                extraProps={{ type: 'grouphead' }}
                isLoading={isLoading || isFetching}
            />
        </ErrorBoundary>
    );
});
