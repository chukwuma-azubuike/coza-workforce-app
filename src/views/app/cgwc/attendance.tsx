import React from 'react';
import FlatListComponent from '@components/composite/flat-list';
import {
    campusColumns_1,
    leadersAttendanceDataColumns,
    myAttendanceColumns,
    teamAttendanceDataColumns,
} from '../attendance/flatListConfig';
import { useGetAttendanceQuery } from '@store/services/attendance';
import useRole from '@hooks/role';
import { IAttendance, IService } from '@store/types';
import { useGetServicesQuery } from '@store/services/services';
import { useGetUsersByDepartmentIdQuery, useGetUsersQuery } from '@store/services/account';
import moment from 'moment';
import ErrorBoundary from '@components/composite/error-boundary';
import useFetchMoreData from '@hooks/fetch-more-data';
import Utils from '@utils/index';
import { SelectComponent, SelectItemComponent } from '@components/atoms/select';
import { Box, HStack, Text } from 'native-base';
import { Platform, StyleSheet } from 'react-native';
import { THEME_CONFIG } from '@config/appConfig';
import { Icon } from '@rneui/themed';
import ListTable from '@components/composite/list/list-table';

const isAndroid = Platform.OS === 'android';

interface ICGWCAttendance extends Partial<IAttendance> {}

const DATA = [
    {
        id: 1,
        title: 'Day 1 - Morning',
    },
    {
        id: 2,
        title: 'Day 1 - Evening',
    },
    {
        id: 3,
        title: 'Day 2 - Morning',
    },
    {
        id: 4,
        title: 'Day 2 - Evening',
    },
    {
        id: 5,
        title: 'Day 3 - Morning',
    },
    {
        id: 6,
        title: 'Day 3 - Evening',
    },
    {
        id: 7,
        title: 'Day 4 - Morning',
    },
    {
        id: 8,
        title: 'Day 4 - Evening',
    },
    {
        id: 9,
        title: 'Day 5 - Morning',
    },
    {
        id: 10,
        title: 'Day 5 - Evening',
    },
    {
        id: 11,
        title: 'Day 6 - Morning',
    },
    {
        id: 12,
        title: 'Day 6 - Evening',
    },
];

export const MyCGWCAttendance: React.FC<ICGWCAttendance> = React.memo(({ cgwcId, userId }) => {
    const {
        data,
        isLoading,
        isFetching,
        refetch: refetchAttendance,
    } = useGetAttendanceQuery({
        cgwcId,
        userId,
    });

    return (
        <ErrorBoundary>
            <AttendanceContainer title="My Attendance" score={15} scoreType="percent">
                <ListTable
                    data={DATA}
                    Header={AttendanceHeader}
                    Column={AttendanceListRow}
                    headerProps={{ titles: ['Session', 'Clock in', 'Clock out'] }}
                />
            </AttendanceContainer>
        </ErrorBoundary>
    );
});

export const TeamCGWCAttendance: React.FC<ICGWCAttendance> = React.memo(({ cgwcId }) => {
    const { user } = useRole();

    const {
        data: sessions,
        refetch: refetchSessions,
        isLoading: sessionsIsLoading,
        isSuccess: sessionsIsSuccess,
    } = useGetServicesQuery({});

    const [serviceId, setServiceId] = React.useState<IService['_id']>();

    const setService = (value: IService['_id']) => {
        setServiceId(value);
    };

    React.useEffect(() => {
        !!sessions?.length && setServiceId(sessions[0]._id);
    }, [sessionsIsLoading]);

    const {
        isLoading,
        isFetching,
        refetch: refetchAttendance,
        data: membersClockedIn,
    } = useGetAttendanceQuery({
        cgwcId,
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
        refetchSessions();
        refetchAttendance();
    };

    const eligible = React.useMemo(() => Math.round(Math.random() * 10), []);

    return (
        <ErrorBoundary>
            <AttendanceContainer title="Team Attendance" score={3} scoreType="count">
                <HStack justifyContent="space-between" alignItems="baseline">
                    <SelectComponent placeholder="Select Session" selectedValue={serviceId} onValueChange={setService}>
                        {sessions?.map((session, index) => (
                            <SelectItemComponent
                                value={session._id}
                                key={`session-${index}`}
                                isLoading={sessionsIsLoading}
                                label={`${session.name} - ${moment(session.clockInStartTime).format('Do MMM YYYY')}`}
                            />
                        ))}
                    </SelectComponent>
                    <HStack justifyContent="space-between" alignItems="baseline">
                        <Text bold size="sm">
                            Eligible:{' '}
                        </Text>
                        <Text bold _dark={{ color: 'gray.400' }} _light={{ color: 'gray.800' }}>
                            {eligible}
                        </Text>
                    </HStack>
                </HStack>
                <ListTable
                    Header={AttendanceHeader}
                    Column={AttendanceListRow}
                    data={mergedAttendanceWithMemberList}
                    headerProps={{ titles: ['Session', 'Clock in', 'Clock out'] }}
                />
            </AttendanceContainer>
        </ErrorBoundary>
    );
});

export const LeadersCGWCAttendance: React.FC = React.memo(() => {
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
        () => services && services.filter(service => moment().unix() > moment(service.clockInStartTime).unix()),
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

    const leadersClockedIn = AHODs && HODs ? [...AHODs, ...HODs] : [];
    const allLeadersRaw = HODProfiles && AHODProfiles ? [...AHODProfiles, ...HODProfiles] : [];

    const allLeaders = React.useMemo(() => {
        if (!allLeadersRaw.length) return [];

        return allLeadersRaw?.map(leader => {
            return {
                ...leader,
                userId: leader._id,
            };
        });
    }, [allLeadersRaw]);

    const leadersClockedInValid = React.useMemo(() => {
        if (!leadersClockedIn?.length) return [];

        return leadersClockedIn?.map(leader => {
            return {
                ...leader,
                userId: leader.user._id,
            };
        });
    }, [leadersClockedIn]);

    const mergedLeaders = [...leadersClockedInValid, ...allLeaders] as any;

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
            <Box mb={2} px={2}>
                <SelectComponent placeholder="Select Service" selectedValue={serviceId} onValueChange={setService}>
                    {sortedServices?.map((service, index) => (
                        <SelectItemComponent
                            value={service._id}
                            key={`service-${index}`}
                            isLoading={serviceIsLoading}
                            label={`${service.name} - ${moment(service.clockInStartTime).format('Do MMM YYYY')}`}
                        />
                    ))}
                </SelectComponent>
            </Box>
            <FlatListComponent
                onRefresh={handleRefetch}
                padding={isAndroid ? 3 : true}
                isLoading={isLoading || isFetching}
                refreshing={isLoading || isFetching}
                data={mergedAttendanceWithLeaderList}
                columns={leadersAttendanceDataColumns}
                ListFooterComponentStyle={{ marginVertical: 20 }}
            />
        </ErrorBoundary>
    );
});

export const CampusCGWCAttendance: React.FC = React.memo(() => {
    const { user } = useRole();
    const [page, setPage] = React.useState<number>(1);

    const { data: services, isLoading: serviceIsLoading, isSuccess: servicesIsSuccess } = useGetServicesQuery({});

    const [serviceId, setServiceId] = React.useState<IService['_id']>();

    const setService = (value: IService['_id']) => {
        setServiceId(value);
    };

    const filteredServices = React.useMemo<IService[] | undefined>(
        () => services && services.filter(service => moment().unix() > moment(service.clockInStartTime).unix()),
        [services, servicesIsSuccess]
    );

    const sortedServices = React.useMemo<IService[] | undefined>(
        () => filteredServices && Utils.sortByDate(filteredServices, 'serviceTime'),
        [filteredServices]
    );

    React.useEffect(() => {
        sortedServices && setServiceId(sortedServices[0]._id);
    }, [sortedServices]);

    const { data, refetch, isLoading, isSuccess, isFetching } = useGetAttendanceQuery(
        {
            // page,
            // limit: 20,
            serviceId: serviceId,
            campusId: user?.campus._id,
        },
        {
            skip: !serviceId,
            refetchOnMountOrArgChange: true,
        }
    );

    // const fetchMoreData = () => {
    //     if (!isFetching && !isLoading) {
    //         if (data?.length) {
    //             setPage(prev => prev + 1);
    //         } else {
    //             setPage(prev => prev - 1);
    //         }
    //     }
    // };

    // const { data: moreData } = useFetchMoreData({ dataSet: data, isSuccess: isSuccess, uniqKey: '_id' });

    const handleRefetch = () => {
        refetch();
    };

    return (
        <ErrorBoundary>
            <Box mb={2} px={2}>
                <SelectComponent placeholder="Select Service" selectedValue={serviceId} onValueChange={setService}>
                    {sortedServices?.map((service, index) => (
                        <SelectItemComponent
                            value={service._id}
                            key={`service-${index}`}
                            isLoading={serviceIsLoading}
                            label={`${service.name} - ${moment(service.clockInStartTime).format('Do MMM YYYY')}`}
                        />
                    ))}
                </SelectComponent>
            </Box>
            <FlatListComponent
                onRefresh={handleRefetch}
                columns={campusColumns_1}
                data={data as IAttendance[]}
                padding={isAndroid ? 3 : true}
                // fetchMoreData={fetchMoreData}
                isLoading={isLoading || isFetching}
                refreshing={isLoading || isFetching}
                ListFooterComponentStyle={{ marginVertical: 20 }}
            />
        </ErrorBoundary>
    );
});

interface IAttendanceContainerProps {
    title: string;
    score?: number | string;
    scoreType: 'percent' | 'count';
}

export const AttendanceContainer: React.FC<IAttendanceContainerProps> = ({ children, title, score, scoreType }) => {
    return (
        <Box flexDirection="column" w={['100%', '46%']}>
            <HStack px={2} justifyContent="space-between" alignItems="baseline">
                <Text textAlign="center" fontSize="lg" bold pt={3} pb={4}>
                    {title}
                </Text>
                {!!score && (
                    <Text
                        bold
                        pb={4}
                        pt={3}
                        fontSize="lg"
                        textAlign="center"
                        color={+score < 31 ? 'red.600' : +score > 69 ? 'green.600' : 'yellow.400'}
                    >
                        {score || 0}
                        {scoreType === 'percent' && '%'}
                    </Text>
                )}
            </HStack>
            {children}
        </Box>
    );
};

export const AttendanceListRow: React.FC<IAttendance & { title: string }> = ({ clockIn, clockOut, title }) => {
    return (
        <>
            <HStack
                alignItems="center"
                style={styles.listRow}
                borderBottomWidth={0.2}
                borderBottomColor="gray.400"
                justifyContent="space-between"
            >
                <Text style={styles.listRowItem}>{title}</Text>
                <HStack style={[styles.listRowItem, { justifyContent: 'flex-end' }]}>
                    <Icon color={THEME_CONFIG.primaryLight} name="arrow-down-right" type="feather" size={18} />
                    <Text style={[{ textAlign: 'right' }]}>
                        {clockIn ? moment(clockIn).format('DD/MM/YYYY') : '--:--'}
                    </Text>
                </HStack>
                <HStack style={[styles.listRowItem, { justifyContent: 'flex-end' }]}>
                    <Icon color={THEME_CONFIG.primaryLight} name="arrow-up-right" type="feather" size={18} />
                    <Text style={[{ textAlign: 'right' }]}>
                        {clockOut ? moment(clockOut).format('DD/MM/YYYY') : '--:--'}
                    </Text>
                </HStack>
            </HStack>
        </>
    );
};

export const AttendanceHeader: React.FC<{ titles: string[] }> = ({ titles }) => {
    return (
        <>
            <HStack
                alignItems="center"
                borderTopWidth={0.2}
                style={styles.listRow}
                borderColor="gray.400"
                borderBottomWidth={0.2}
                justifyContent="space-between"
            >
                {titles?.map((title, index) => (
                    <Text key={index} bold style={[styles.listRowItem, { textAlign: index !== 0 ? 'right' : 'left' }]}>
                        {title}
                    </Text>
                ))}
            </HStack>
        </>
    );
};

const styles = StyleSheet.create({
    dateTime: {},
    title: {},
    listRow: {
        padding: 10,
    },
    listRowItem: {
        width: '33%',
        flexWrap: 'wrap',
    },
});
