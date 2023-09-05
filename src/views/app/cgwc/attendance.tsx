import React from 'react';
import FlatListComponent from '@components/composite/flat-list';
import {
    campusColumns_1,
    leadersAttendanceDataColumns,
    teamAttendanceDataColumns_1,
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
import { ScreenWidth } from '@rneui/base';
import If from '@components/composite/if-container';
import { mergeObjectsByKey } from '@utils/mergeObjectsByKey';
import useScreenFocus from '@hooks/focus';

const isAndroid = Platform.OS === 'android';

interface ICGWCAttendance extends Partial<IAttendance> {
    sessions?: IService[];
}

export const MyCGWCAttendance: React.FC<ICGWCAttendance> = React.memo(({ CGWCId, userId, sessions }) => {
    const {
        data,
        isSuccess,
        isLoading,
        isFetching,
        refetch: refetchAttendance,
    } = useGetAttendanceQuery({
        CGWCId,
        userId,
    });

    const minifiedSessions = React.useMemo(
        () =>
            sessions?.map(session => {
                return { serviceId: session._id, name: session.name };
            }) || [],
        [sessions]
    );

    const mergedSessionsWithAttendance = React.useMemo(() => {
        if (!!data?.length) {
            return mergeObjectsByKey(minifiedSessions, data);
        }
        return minifiedSessions;
    }, [minifiedSessions, data]);

    const TOTAL_ATTAINABLE_SCORE = (sessions?.length || 0) * 25;

    const cumulativeAttendance = React.useMemo(
        () => data?.map(data => data.score).reduce((a, b) => a + b) || 0,
        [data]
    );
    const totalAttendance = (cumulativeAttendance / TOTAL_ATTAINABLE_SCORE) * 100;

    useScreenFocus({
        onFocus: refetchAttendance,
    });

    return (
        <ErrorBoundary>
            <AttendanceContainer title="My Attendance" score={totalAttendance} scoreType="percent">
                <ListTable
                    isLoading={isLoading}
                    Header={AttendanceHeader}
                    Column={AttendanceListRow}
                    data={mergedSessionsWithAttendance}
                    headerProps={{ titles: ['Session', 'Clock in', 'Clock out', 'Score'] }}
                />
            </AttendanceContainer>
        </ErrorBoundary>
    );
});

export const TeamCGWCAttendance: React.FC<ICGWCAttendance> = React.memo(({ CGWCId }) => {
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
        if (!!sessions?.length) {
            setServiceId(sessions[0]._id);
        }
    }, [sessionsIsSuccess]);

    const {
        isLoading,
        isFetching,
        refetch: refetchAttendance,
        data: membersClockedIn,
    } = useGetAttendanceQuery({
        CGWCId,
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

    // TODO: Get this value from endpoint
    const eligible = React.useMemo(() => Math.round(Math.random() * 10), []);

    return (
        <ErrorBoundary>
            <AttendanceContainer showTitle={false} title="Team Attendance" score={3} scoreType="count">
                <HStack mb={3} mx={4} mr={10} w={ScreenWidth - 42} alignItems="baseline" justifyContent="space-between">
                    <SelectComponent
                        w={ScreenWidth / 1.8}
                        selectedValue={serviceId}
                        onValueChange={setService}
                        placeholder="Select Session"
                    >
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
                        <Text fontSize="lg" bold>
                            Eligible:{'  '}
                        </Text>
                        <Text bold _dark={{ color: 'gray.400' }} fontSize="4xl" _light={{ color: 'gray.800' }}>
                            {eligible}
                        </Text>
                    </HStack>
                </HStack>
            </AttendanceContainer>
            <FlatListComponent
                padding={isAndroid ? 3 : 4}
                onRefresh={handleRefetch}
                isLoading={isLoading || isFetching}
                refreshing={isLoading || isFetching}
                columns={teamAttendanceDataColumns_1}
                data={mergedAttendanceWithMemberList}
                ListFooterComponentStyle={{ marginVertical: 20 }}
            />
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
    showTitle?: boolean;
    score?: number | string;
    scoreType: 'percent' | 'count';
}

export const AttendanceContainer: React.FC<IAttendanceContainerProps> = ({
    children,
    title,
    score,
    scoreType,
    showTitle = true,
}) => {
    return (
        <Box flexDirection="column" w={['100%', '46%']}>
            <If condition={showTitle}>
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
            </If>
            {children}
        </Box>
    );
};

export const AttendanceListRow: React.FC<IAttendance & { name: string; score?: number }> = ({
    name,
    clockIn,
    clockOut,
    score = 0,
    ...props
}) => {
    return (
        <>
            <HStack
                alignItems="center"
                style={styles.listRow}
                borderBottomWidth={0.2}
                borderBottomColor="gray.400"
                justifyContent="space-between"
            >
                <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={styles.listRowItem}
                    width={[ScreenWidth / 3.6, '40%']}
                >
                    {name}
                </Text>
                <HStack
                    style={[styles.listRowItem, { justifyContent: 'flex-end' }]}
                    minWidth={[ScreenWidth / 4.5, '25%']}
                >
                    <Icon color={THEME_CONFIG.primaryLight} name="arrow-down-right" type="feather" size={18} />
                    <Text style={[{ textAlign: 'right' }]}>{clockIn ? moment(clockIn).format('LT') : '--:--'}</Text>
                </HStack>
                <HStack
                    style={[styles.listRowItem, { justifyContent: 'flex-end' }]}
                    minWidth={[ScreenWidth / 4.5, '25%']}
                >
                    <Icon color={THEME_CONFIG.primaryLight} name="arrow-up-right" type="feather" size={18} />
                    <Text style={[{ textAlign: 'right' }]}>{!!clockOut ? moment(clockOut).format('LT') : '--:--'}</Text>
                </HStack>
                {typeof score === 'number' && (
                    <HStack
                        style={[styles.listRowItem, { justifyContent: 'flex-end' }]}
                        minWidth={[ScreenWidth / 4.5, '10%']}
                    >
                        <Text style={[{ textAlign: 'right' }]}>{score}</Text>
                    </HStack>
                )}
            </HStack>
        </>
    );
};

export const AttendanceHeader: React.FC<{ titles: string[] }> = ({ titles }) => {
    return (
        <HStack
            w={['100%', '50%']}
            alignItems="center"
            borderTopWidth={0.2}
            style={styles.listRow}
            borderColor="gray.400"
            borderBottomWidth={0.2}
            justifyContent="space-between"
        >
            {titles?.map((title, index) => (
                <Box minWidth={[index === 0 ? ScreenWidth / 3.6 : ScreenWidth / 4.5,index === 0 ? '40%':'20%']}>
                    <Text
                        bold
                        key={index}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        maxWidth={index === 0 ? ScreenWidth / 3.6 : ScreenWidth / 4.5}
                        style={[styles.listRowItem, { textAlign: index !== 0 ? 'right' : 'left' }]}
                    >
                        {title}
                    </Text>
                </Box>
            ))}
        </HStack>
    );
};

const styles = StyleSheet.create({
    dateTime: {},
    title: {},
    listRow: {
        padding: 10,
    },
    listRowItem: {
        flexWrap: 'wrap',
    },
});
