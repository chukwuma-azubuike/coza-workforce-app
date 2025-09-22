import React, { useCallback, useMemo } from 'react';
import FlatListComponent from '@components/composite/flat-list';
import {
    CampusAttendanceRow,
    GroupAttendanceRow,
    LeadersAttendanceRow,
    MyAttendanceRow,
    TeamAttendanceRow,
} from './row-components';
import { useGetAttendanceQuery } from '@store/services/attendance';
import useRole from '@hooks/role';
import { IAttendance, IService } from '@store/types';
import { useGetServicesQuery } from '@store/services/services';
import { useGetGroupHeadUsersQuery, useGetUsersByDepartmentIdQuery, useGetUsersQuery } from '@store/services/account';
import dayjs from 'dayjs';
import ErrorBoundary from '@components/composite/error-boundary';
import useFetchMoreData from '@hooks/fetch-more-data';
import Utils from '@utils/index';
import { Platform, View } from 'react-native';
// import { useGetGHCampusByIdQuery } from '@store/services/campus';
import PickerSelect from '~/components/ui/picker-select';

const isAndroid = Platform.OS === 'android';

export const MyAttendance: React.FC = React.memo(() => {
    const { user } = useRole();

    const [page, setPage] = React.useState<number>(1);

    const { data, isLoading, isFetching, refetch, isSuccess, isUninitialized } = useGetAttendanceQuery({
        userId: user?._id,
        limit: 10,
        page,
    });

    const { data: moreData } = useFetchMoreData({ dataSet: data, isSuccess, uniqKey: '_id' });

    const minimalAttendanceData = useMemo(
        () =>
            (moreData as IAttendance[])?.map(({ _id, createdAt, clockIn, clockOut }) => ({
                _id,
                createdAt,
                clockIn,
                clockOut,
            })),
        [moreData]
    );

    const fetchMoreData = useCallback(() => {
        if (!isFetching && !isLoading) {
            if (data?.length) {
                setPage(prev => prev + 1);
            } else {
                setPage(prev => prev - 1);
            }
        }
    }, [isFetching, isLoading, data]);

    const renderItemComponent = useCallback(
        ({ item }: { item: any; index: number }) => <MyAttendanceRow item={item} index={0} />,
        [MyAttendanceRow]
    );

    return (
        <ErrorBoundary>
            <View className="mt-4 flex-1">
                <FlatListComponent
                    itemHeight={85.3}
                    fetchMoreData={fetchMoreData}
                    padding={isAndroid ? 3 : true}
                    data={minimalAttendanceData}
                    isLoading={isLoading || isFetching}
                    refreshing={isLoading || isFetching}
                    renderItemComponent={renderItemComponent}
                    onRefresh={isUninitialized ? refetch : undefined}
                    ListFooterComponentStyle={{ marginVertical: 20 }}
                />
            </View>
        </ErrorBoundary>
    );
});

export const TeamAttendance: React.FC = React.memo(() => {
    const { user } = useRole();

    const {
        data: services,
        refetch: refetchServices,
        isLoading: serviceIsLoading,
        isSuccess: servicesIsSuccess,
    } = useGetServicesQuery({});

    const [serviceId, setServiceId] = React.useState<IService['_id']>();

    const setService = useCallback((value: IService['_id']) => {
        setServiceId(value);
    }, []);

    const filteredServices = React.useMemo<IService[] | undefined>(
        () => services && services.filter(service => dayjs().unix() > dayjs(service.clockInStartTime).unix()),
        [services]
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
        departmentId: user?.department?._id,
    });

    const { data: members, refetch: usersRefetch } = useGetUsersByDepartmentIdQuery(user?.department._id);

    const allMembers = React.useMemo(() => {
        if (!members?.length) return [];

        return members?.map(member => {
            return {
                ...member,
                userId: member._id,
            };
        });
    }, [members]);

    const membersClockedInValid = React.useMemo(() => {
        if (!membersClockedIn?.length) return [];

        return membersClockedIn?.map(member => {
            return {
                ...member,
                userId: member?.user?._id,
            };
        });
    }, [membersClockedIn]);

    const mergedUsers = useMemo(
        () => [...membersClockedInValid, ...allMembers] as any,
        [membersClockedInValid, allMembers]
    );

    const mergedAttendanceWithMemberList = React.useMemo(
        () => Utils.mergeDuplicatesByKey<IAttendance>(mergedUsers, 'userId'),
        [membersClockedIn, mergedUsers]
    );

    const minimalTeamData = useMemo(
        () =>
            mergedAttendanceWithMemberList?.map(({ _id, user, clockIn, clockOut, departmentName }) => ({
                _id,
                firstName: user?.firstName,
                lastName: user?.lastName,
                pictureUrl: user?.pictureUrl,
                clockIn,
                clockOut,
                departmentName,
            })),
        [mergedAttendanceWithMemberList]
    );

    const handleRefetch = useCallback(() => {
        usersRefetch();
        refetchServices();
        refetchAttendance();
    }, []);

    const handleCustomLabel = useCallback(
        (session: IService) => `${session.name} | ${dayjs(session.serviceTime).format('DD MMM YYYY')}`,
        []
    );

    return (
        <ErrorBoundary>
            <View className="px-2 mb-2 pt-4">
                <PickerSelect
                    valueKey="_id"
                    labelKey="name"
                    value={serviceId}
                    items={sortedServices || []}
                    isLoading={serviceIsLoading}
                    placeholder="Select Session"
                    onValueChange={setService}
                    customLabel={handleCustomLabel}
                />
            </View>
            <View className="px-2 flex-1">
                <FlatListComponent
                    itemHeight={85.3}
                    onRefresh={handleRefetch}
                    padding={isAndroid ? 3 : 1}
                    isLoading={isLoading || isFetching}
                    renderItemComponent={({ item }) => <TeamAttendanceRow item={item} index={0} />}
                    refreshing={isLoading || isFetching}
                    data={minimalTeamData}
                    ListFooterComponentStyle={{ marginVertical: 20 }}
                />
            </View>
        </ErrorBoundary>
    );
});

export const LeadersAttendance: React.FC = React.memo(() => {
    const { leaderRoleIds, user } = useRole();

    const { data: services, refetch: refetchServices, isLoading: serviceIsLoading } = useGetServicesQuery({});

    const [serviceId, setServiceId] = React.useState<IService['_id']>();

    const setService = useCallback((value: IService['_id']) => {
        setServiceId(value);
    }, []);

    const filteredServices = React.useMemo<IService[] | undefined>(
        () => services && services.filter(service => dayjs().unix() > dayjs(service.clockInStartTime).unix()),
        [services]
    );

    const sortedServices = React.useMemo<IService[] | undefined>(
        () => filteredServices && Utils.sortByDate(filteredServices, 'serviceTime'),
        [filteredServices]
    );

    React.useEffect(() => {
        sortedServices && setServiceId(sortedServices[0]._id);
    }, [sortedServices]);

    const {
        data: HODs,
        refetch: refetchHods,
        isLoading: hodLoading,
        isFetching: hodFetching,
    } = useGetAttendanceQuery(
        {
            serviceId: serviceId,
            campusId: user?.campus?._id,
            roleId: leaderRoleIds && (leaderRoleIds[0] as string),
        },
        { skip: !leaderRoleIds?.length, refetchOnMountOrArgChange: true }
    );

    const {
        data: AHODs,
        refetch: refetchAHods,
        isLoading: ahodLoading,
        isFetching: ahodFetching,
    } = useGetAttendanceQuery(
        {
            serviceId: serviceId,
            campusId: user?.campus?._id,
            roleId: leaderRoleIds && (leaderRoleIds[1] as string),
        },
        { skip: !leaderRoleIds?.length, refetchOnMountOrArgChange: true }
    );

    const isLoading = hodLoading || ahodLoading;
    const isFetching = hodFetching || ahodFetching;

    const { data: HODProfiles } = useGetUsersQuery(
        { roleId: leaderRoleIds && leaderRoleIds[0], campusId: user?.campus?._id },
        { skip: !leaderRoleIds?.length }
    );
    const { data: AHODProfiles } = useGetUsersQuery(
        { roleId: leaderRoleIds && leaderRoleIds[1], campusId: user?.campus?._id },
        { skip: !leaderRoleIds?.length }
    );

    const leadersClockedIn = useMemo(() => (AHODs && HODs ? [...AHODs, ...HODs] : []), [HODs, AHODs]);
    const allLeadersRaw = useMemo(
        () => (HODProfiles && AHODProfiles ? [...AHODProfiles, ...HODProfiles] : []),
        [AHODProfiles, HODProfiles]
    );

    const allLeaders = React.useMemo(() => {
        if (!allLeadersRaw.length) return [];

        return allLeadersRaw?.map(leader => {
            return {
                ...leader,
                userId: leader?._id,
            };
        });
    }, [allLeadersRaw]);

    const leadersClockedInValid = React.useMemo(() => {
        if (!leadersClockedIn?.length) return [];

        return leadersClockedIn?.map(leader => {
            return {
                ...leader,
                userId: leader?.user?._id,
            };
        });
    }, [leadersClockedIn]);

    const mergedLeaders = useMemo(
        () => [...leadersClockedInValid, ...allLeaders] as any,
        [leadersClockedInValid, allLeaders]
    );

    const mergedAttendanceWithLeaderList = React.useMemo(
        () => Utils.mergeDuplicatesByKey(mergedLeaders, 'userId'),
        [mergedLeaders]
    );

    const minimalLeaderData = useMemo(
        () =>
            mergedAttendanceWithLeaderList?.map(({ _id, user, clockIn, clockOut, departmentName }) => ({
                _id,
                firstName: user?.firstName,
                lastName: user?.lastName,
                pictureUrl: user?.pictureUrl,
                clockIn,
                clockOut,
                departmentName,
            })),
        [mergedAttendanceWithLeaderList]
    );

    const handleRefetch = useCallback(() => {
        refetchHods();
        refetchAHods();
        refetchServices();
    }, []);

    const handleCustomLabel = useCallback(
        (session: IService) => `${session.name} | ${dayjs(session.serviceTime).format('DD MMM YYYY')}`,
        []
    );

    return (
        <ErrorBoundary>
            <View className="px-2 mb-2 pt-4">
                <PickerSelect
                    valueKey="_id"
                    labelKey="name"
                    value={serviceId}
                    items={sortedServices || []}
                    isLoading={serviceIsLoading}
                    placeholder="Select Session"
                    onValueChange={setService}
                    customLabel={handleCustomLabel}
                />
            </View>
            <View className="px-2 flex-1">
                <FlatListComponent
                    itemHeight={85.3}
                    padding={isAndroid ? 3 : true}
                    onRefresh={handleRefetch}
                    isLoading={isLoading || isFetching}
                    refreshing={isLoading || isFetching}
                    data={minimalLeaderData}
                    renderItemComponent={({ item }) => <LeadersAttendanceRow item={item} index={0} />}
                    ListFooterComponentStyle={{ marginVertical: 20 }}
                />
            </View>
        </ErrorBoundary>
    );
});

export const CampusAttendance: React.FC = React.memo(() => {
    const { user } = useRole();

    const {
        data: services,
        refetch: refetchServices,
        isLoading: serviceIsLoading,
        isSuccess: servicesIsSuccess,
        isUninitialized: servicesIsUninitialized,
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
        sortedServices && setServiceId(sortedServices[0]?._id);
    }, [sortedServices]);

    const {
        data,
        isLoading,
        isSuccess,
        isFetching,
        isUninitialized: attedanceIsUninitialized,
        refetch: refetchAttendance,
    } = useGetAttendanceQuery(
        {
            serviceId: serviceId,
            campusId: user?.campus?._id,
        },
        {
            skip: !serviceId,
            refetchOnMountOrArgChange: true,
        }
    );

    const minimalCampusData = useMemo(
        () =>
            data?.map(({ _id, user, clockIn, clockOut, departmentName }) => ({
                _id,
                user: {
                    firstName: user?.firstName,
                    lastName: user?.lastName,
                    pictureUrl: user?.pictureUrl,
                },
                clockIn,
                clockOut,
                departmentName,
            })) || [],
        [data]
    );

    const handleRefetch = useCallback(() => {
        !attedanceIsUninitialized && refetchAttendance();
        !servicesIsUninitialized && refetchServices();
    }, [attedanceIsUninitialized, servicesIsUninitialized]);

    const handleCustomLabel = useCallback(
        (session: IService) => `${session.name} | ${dayjs(session.serviceTime).format('DD MMM YYYY')}`,
        []
    );

    return (
        <ErrorBoundary>
            <View className="px-2 mb-2 pt-4">
                <PickerSelect
                    valueKey="_id"
                    labelKey="name"
                    value={serviceId}
                    items={sortedServices || []}
                    isLoading={serviceIsLoading}
                    placeholder="Select Session"
                    onValueChange={setService}
                    customLabel={handleCustomLabel}
                />
            </View>
            <View className="px-2 flex-1">
                <FlatListComponent
                    itemHeight={85.3}
                    renderItemComponent={({ item }) => <CampusAttendanceRow item={item as IAttendance} index={0} />}
                    onRefresh={handleRefetch}
                    data={minimalCampusData}
                    padding={isAndroid ? 3 : true}
                    isLoading={isLoading || isFetching}
                    refreshing={isLoading || isFetching}
                    ListFooterComponentStyle={{ marginVertical: 20 }}
                />
            </View>
        </ErrorBoundary>
    );
});

export const GroupAttendance: React.FC = React.memo(() => {
    const { data: services, refetch: refetchServices, isLoading: serviceIsLoading } = useGetServicesQuery({});

    const [serviceId, setServiceId] = React.useState<IService['_id']>();

    const setService = useCallback((value: IService['_id']) => {
        setServiceId(value);
    }, []);

    const filteredServices = React.useMemo<IService[] | undefined>(
        () => services && services.filter(service => dayjs().unix() > dayjs(service.clockInStartTime).unix()),
        [services]
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
        isGH: true,
    });

    const {
        data: members,
        refetch: usersRefetch,
        isLoading: membersLoading,
        isFetching: membersFetching,
    } = useGetGroupHeadUsersQuery({});

    const allMembers = React.useMemo(() => {
        if (!members?.length) return [];

        return members?.map(member => {
            return {
                ...member,
                userId: member._id,
            };
        });
    }, [members]);

    const membersClockedInValid = React.useMemo(() => {
        if (!membersClockedIn?.length) return [];

        return membersClockedIn?.map(member => {
            return {
                ...member,
                userId: member?.user?._id,
            };
        });
    }, [membersClockedIn]);

    const mergedUsers = useMemo(
        () => [...membersClockedInValid, ...allMembers] as any,
        [membersClockedInValid, allMembers]
    );

    const mergedAttendanceWithMemberList = React.useMemo(
        () => Utils.mergeDuplicatesByKey<IAttendance>(mergedUsers, 'userId'),
        [mergedUsers]
    );

    const minimalGroupData = useMemo(
        () =>
            mergedAttendanceWithMemberList?.map(({ _id, user, clockIn, clockOut, departmentName, campusName }) => ({
                _id,
                user: {
                    firstName: user?.firstName,
                    lastName: user?.lastName,
                    pictureUrl: user?.pictureUrl,
                },
                clockIn,
                clockOut,
                departmentName,
                campusName,
            })),
        [mergedAttendanceWithMemberList]
    );

    const handleRefetch = useCallback(() => {
        usersRefetch();
        refetchServices();
        refetchAttendance();
    }, []);

    const handleCustomLabel = useCallback(
        (session: IService) => `${session.name} | ${dayjs(session.serviceTime).format('DD MMM YYYY')}`,
        []
    );

    return (
        <ErrorBoundary>
            <View className="px-2 mb-2 pt-4">
                <PickerSelect
                    valueKey="_id"
                    labelKey="name"
                    value={serviceId}
                    items={sortedServices || []}
                    isLoading={serviceIsLoading}
                    placeholder="Select Session"
                    onValueChange={setService}
                    customLabel={handleCustomLabel}
                />
            </View>
            <View className="px-2 flex-1">
                <FlatListComponent
                    itemHeight={85.3}
                    onRefresh={handleRefetch}
                    padding={isAndroid ? 3 : 1}
                    isLoading={isLoading || isFetching}
                    renderItemComponent={({ item }) => <GroupAttendanceRow item={item as IAttendance} index={0} />}
                    refreshing={isLoading || isFetching}
                    data={minimalGroupData}
                    ListFooterComponentStyle={{ marginVertical: 20 }}
                />
            </View>
        </ErrorBoundary>
    );
});
