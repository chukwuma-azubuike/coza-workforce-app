import React from 'react';
import FlatListComponent from '@components/composite/flat-list';
import { teamAttendanceDataColumns_1 } from '../attendance/flatListConfig';
import { useGetAttendanceQuery } from '@store/services/attendance';
import useRole from '@hooks/role';
import { IAttendance, IService } from '@store/types';
import { useGetServicesQuery } from '@store/services/services';
import { useGetUsersByDepartmentIdQuery, useGetUsersQuery } from '@store/services/account';
import moment from 'moment';
import ErrorBoundary from '@components/composite/error-boundary';
// import useFetchMoreData from '@hooks/fetch-more-data';
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
        isLoading,
        refetch: refetchAttendance,
    } = useGetAttendanceQuery({
        CGWCId,
        userId,
    });

    const minifiedAttendance = React.useMemo(
        () =>
            data?.map(attendance => {
                return { ...attendance, serviceId: attendance.service._id };
            }) || [],
        [data]
    );

    const minifiedSessions = React.useMemo(
        () =>
            sessions?.map(session => {
                return { serviceId: session._id, name: session.name };
            }) || [],
        [sessions]
    );

    const mergedSessionsWithAttendance = React.useMemo(() => {
        if (!!minifiedAttendance?.length) {
            return Utils.mergeDuplicatesByKey<IAttendance>([...minifiedSessions, ...minifiedAttendance], 'serviceId');
        }
        return Utils.mergeDuplicatesByKey<IAttendance>(minifiedSessions, 'serviceId');
    }, [minifiedSessions, minifiedAttendance]);

    const TOTAL_ATTAINABLE_SCORE = (sessions?.length || 0) * 25;

    const cumulativeAttendance = React.useMemo(() => {
        if (!!data?.length) {
            return data?.map(data => data.score)?.reduce((a, b) => a + b);
        }
        return 0;
    }, [data]);

    const totalAttendance = Math.round((cumulativeAttendance / TOTAL_ATTAINABLE_SCORE) * 100);

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

    const [serviceId, setServiceId] = React.useState<IService['_id']>();

    const {
        data: sessions,
        refetch: refetchSessions,
        isLoading: sessionsIsLoading,
        isSuccess: sessionsIsSuccess,
    } = useGetServicesQuery({ CGWCId }, { refetchOnMountOrArgChange: true });

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
        serviceId,
        departmentId: user?.department?._id,
    });

    useScreenFocus({
        onFocus: () => {
            if (!!sessions?.length) {
                setServiceId(sessions[0]._id);
            }
        },
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

export const LeadersCGWCAttendance: React.FC<ICGWCAttendance> = React.memo(({ CGWCId }) => {
    const { leaderRoleIds, user } = useRole();
    const [serviceId, setServiceId] = React.useState<IService['_id']>();

    const {
        data: sessions,
        refetch: refetchServices,
        isLoading: serviceIsLoading,
        isSuccess: servicesIsSuccess,
    } = useGetServicesQuery({ CGWCId }, { refetchOnMountOrArgChange: true });

    const setService = (value: IService['_id']) => {
        setServiceId(value);
    };

    useScreenFocus({
        onFocus: () => {
            if (!!sessions?.length) {
                setServiceId(sessions[0]._id);
            }
        },
    });

    React.useEffect(() => {
        if (!!sessions?.length) {
            setServiceId(sessions[0]._id);
        }
    }, [sessions]);

    const {
        data: HODs,
        refetch: refetchHods,
        isLoading: hodLoading,
        isFetching: hodFetching,
    } = useGetAttendanceQuery(
        {
            CGWCId,
            serviceId,
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
            CGWCId,
            serviceId,
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
            <HStack mt={4} px={2} w="full" justifyContent="space-between">
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
                            isLoading={serviceIsLoading}
                            label={`${session.name} - ${moment(session.clockInStartTime).format('Do MMM YYYY')}`}
                        />
                    ))}
                </SelectComponent>
                <HStack justifyContent="space-between" alignItems="baseline" px={4}>
                    <Text fontSize="lg" bold>
                        Eligible:
                    </Text>
                    <Text ml={4} bold _dark={{ color: 'gray.400' }} fontSize="4xl" _light={{ color: 'gray.800' }}>
                        0
                    </Text>
                </HStack>
            </HStack>
            <FlatListComponent
                onRefresh={handleRefetch}
                padding={isAndroid ? 3 : 10}
                isLoading={isLoading || isFetching}
                refreshing={isLoading || isFetching}
                data={mergedAttendanceWithLeaderList}
                columns={teamAttendanceDataColumns_1}
                ListFooterComponentStyle={{ marginVertical: 20 }}
            />
        </ErrorBoundary>
    );
});

export const CampusCGWCAttendance: React.FC<ICGWCAttendance> = React.memo(({ CGWCId }) => {
    const { user } = useRole();
    const [page, setPage] = React.useState<number>(1);
    const [serviceId, setServiceId] = React.useState<IService['_id']>();

    const {
        data: sessions,
        isLoading: sessionsIsLoading,
        isSuccess: sessionsIsSuccess,
    } = useGetServicesQuery(
        { CGWCId },
        {
            refetchOnMountOrArgChange: true,
        }
    );

    const setService = (value: IService['_id']) => {
        setServiceId(value);
    };

    useScreenFocus({
        onFocus: () => {
            if (!!sessions?.length) {
                setServiceId(sessions[0]._id);
            }
        },
    });

    React.useEffect(() => {
        if (!!sessions?.length) {
            setServiceId(sessions[0]._id);
        }
    }, [sessions]);

    const { data, refetch, isLoading, isSuccess, isFetching } = useGetAttendanceQuery(
        {
            page,
            CGWCId,
            limit: 20,
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
            <HStack mt={4} px={2} w="full" justifyContent="space-between">
                <SelectComponent
                    w={ScreenWidth / 1.8}
                    placeholder="Select Session"
                    selectedValue={serviceId}
                    onValueChange={setService}
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
                <HStack justifyContent="space-between" alignItems="baseline" px={4}>
                    <Text fontSize="lg" bold>
                        Eligible:
                    </Text>
                    <Text ml={4} bold _dark={{ color: 'gray.400' }} fontSize="4xl" _light={{ color: 'gray.800' }}>
                        0
                    </Text>
                </HStack>
            </HStack>
            <FlatListComponent
                onRefresh={handleRefetch}
                data={data as IAttendance[]}
                padding={isAndroid ? 3 : 10}
                // fetchMoreData={fetchMoreData}
                isLoading={isLoading || isFetching}
                refreshing={isLoading || isFetching}
                columns={teamAttendanceDataColumns_1}
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
                <Box minWidth={[index === 0 ? ScreenWidth / 3.6 : ScreenWidth / 4.5, index === 0 ? '40%' : '20%']}>
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
