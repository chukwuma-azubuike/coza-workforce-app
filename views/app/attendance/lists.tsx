import React, { useMemo } from 'react';
import FlatListComponent from '@components/composite/flat-list';
import {
    campusColumns,
    groupAttendanceDataColumns,
    leadersAttendanceDataColumns,
    myAttendanceColumns,
    teamAttendanceDataColumns,
} from './flatListConfig';
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
import { useGetGHCampusByIdQuery } from '@store/services/campus';
import PickerSelect from '~/components/ui/picker-select';

const isAndroid = Platform.OS === 'android';

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
                padding={isAndroid ? 3 : true}
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

    const handleRefetch = () => {
        usersRefetch();
        refetchServices();
        refetchAttendance();
    };

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
                    customLabel={session => `${session.name} | ${dayjs(session.serviceTime).format('DD MMM YYYY')}`}
                />
            </View>
            <View className="px-2 flex-1">
                <FlatListComponent
                    padding={isAndroid ? 3 : 1}
                    onRefresh={handleRefetch}
                    isLoading={isLoading || isFetching}
                    columns={teamAttendanceDataColumns}
                    refreshing={isLoading || isFetching}
                    data={mergedAttendanceWithMemberList}
                    ListFooterComponentStyle={{ marginVertical: 20 }}
                />
            </View>
        </ErrorBoundary>
    );
});

export const LeadersAttendance: React.FC = React.memo(() => {
    const { leaderRoleIds, user } = useRole();

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
        [leadersClockedIn, mergedLeaders]
    );

    const handleRefetch = () => {
        refetchHods();
        refetchAHods();
        refetchServices();
    };

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
                    customLabel={session => `${session.name} | ${dayjs(session.serviceTime).format('DD MMM YYYY')}`}
                />
            </View>
            <View className="px-2 flex-1">
                <FlatListComponent
                    padding={isAndroid ? 3 : true}
                    onRefresh={handleRefetch}
                    isLoading={isLoading || isFetching}
                    refreshing={isLoading || isFetching}
                    data={mergedAttendanceWithLeaderList}
                    columns={leadersAttendanceDataColumns}
                    ListFooterComponentStyle={{ marginVertical: 20 }}
                />
            </View>
        </ErrorBoundary>
    );
});

export const CampusAttendance: React.FC = React.memo(() => {
    const { user } = useRole();
    const [page, setPage] = React.useState<number>(1);

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
            // page,
            // limit: 20,
            serviceId: serviceId,
            campusId: user?.campus?._id,
        },
        {
            skip: !serviceId,
            refetchOnMountOrArgChange: true,
        }
    );

    const handleRefetch = () => {
        !attedanceIsUninitialized && refetchAttendance();
        !servicesIsUninitialized && refetchServices();
    };

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
                    customLabel={session => `${session.name} | ${dayjs(session.serviceTime).format('DD MMM YYYY')}`}
                />
            </View>
            <View className="px-2 flex-1">
                <FlatListComponent
                    columns={campusColumns}
                    onRefresh={handleRefetch}
                    data={data as IAttendance[]}
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
    const { user } = useRole();

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
        [membersClockedIn, mergedUsers]
    );

    const handleRefetch = () => {
        usersRefetch();
        refetchServices();
        refetchAttendance();
    };

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
                    customLabel={session => `${session.name} | ${dayjs(session.serviceTime).format('DD MMM YYYY')}`}
                />
            </View>
            <View className="px-2 flex-1">
                <FlatListComponent
                    padding={isAndroid ? 3 : 1}
                    onRefresh={handleRefetch}
                    isLoading={isLoading || isFetching}
                    columns={groupAttendanceDataColumns}
                    refreshing={isLoading || isFetching}
                    data={mergedAttendanceWithMemberList}
                    ListFooterComponentStyle={{ marginVertical: 20 }}
                />
            </View>
        </ErrorBoundary>
    );
});
