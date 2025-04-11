import React, { ReactNode } from 'react';
import FlatListComponent from '@components/composite/flat-list';
import { scoreMappingColumn } from '../attendance/flatListConfig';
import { useGetAttendanceQuery } from '@store/services/attendance';
import useRole from '@hooks/role';
import { IAttendance, IService } from '@store/types';
import { useGetServicesQuery } from '@store/services/services';
import dayjs from 'dayjs';
import ErrorBoundary from '@components/composite/error-boundary';
// import useFetchMoreData from '@hooks/fetch-more-data';
import Utils from '@utils/index';
import { SelectComponent, SelectItemComponent } from '@components/atoms/select';
import { Platform, StyleSheet, View } from 'react-native';
import { THEME_CONFIG } from '@config/appConfig';
import { Icon } from '@rneui/themed';
import ListTable from '@components/composite/list/list-table';
import { ScreenWidth } from '@rneui/base';
import If from '@components/composite/if-container';
import useScreenFocus from '@hooks/focus';
import { useGetCummulativeScoresQuery } from '@store/services/score-mapping';
import HStackComponent from '@components/layout/h-stack';
import TextComponent from '@components/text';

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
                return { ...attendance, serviceId: attendance?.service?._id || attendance?.serviceId };
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
        isLoading: attendanceLoading,
        isFetching: attendanceFetching,
        refetch: refetchAttendance,
        data: membersClockedIn,
    } = useGetAttendanceQuery({
        CGWCId,
        serviceId,
        departmentId: user?.department?._id,
    });

    const {
        isLoading: scoreMappingLoading,
        isFetching: scoreMappingFetching,
        refetch,
        data: scoreMappingAttendance,
    } = useGetCummulativeScoresQuery({
        CGWCId,
        serviceId,
        departmentId: user?.department?._id,
    });

    const isLoading = attendanceLoading || scoreMappingLoading;
    const isFetching = attendanceFetching || scoreMappingFetching;

    useScreenFocus({
        onFocus: () => {
            if (!!sessions?.length) {
                setServiceId(sessions[0]._id);
            }
        },
    });

    const membersClockedInValid = !membersClockedIn?.length ? [] : membersClockedIn;
    const scoreMappingAttendanceValid = !scoreMappingAttendance?.length ? [] : scoreMappingAttendance;
    const allMembers = React.useMemo(() => {
        if (!membersClockedInValid?.length) return [];

        return membersClockedInValid?.map(member => {
            return {
                ...member,
                userId: member.user._id,
            };
        });
    }, [membersClockedInValid]);
    const mergedUsers = [...scoreMappingAttendanceValid, ...allMembers] as any;

    const mergedAttendanceWithMemberList = React.useMemo(
        () => Utils.mergeDuplicatesByKey(mergedUsers, 'userId'),
        [membersClockedIn, mergedUsers]
    );

    const handleRefetch = () => {
        refetchSessions();
        refetch();
    };

    const eligible = React.useMemo(
        () => scoreMappingAttendance?.filter(scoreMap => scoreMap.isEligible)?.length,
        [scoreMappingAttendance]
    );

    return (
        <ErrorBoundary>
            <AttendanceContainer showTitle={false} title="Team Attendance" score={3} scoreType="count">
                <HStackComponent
                    style={{
                        flex: 0,
                        marginBottom: 6,
                        paddingHorizontal: 8,
                        alignItems: 'baseline',
                    }}
                    space={8}
                >
                    <SelectComponent
                        valueKey="_id"
                        displayKey="name"
                        items={sessions || []}
                        style={{ width: 200 }}
                        selectedValue={serviceId}
                        placeholder="Select Session"
                        onValueChange={setService as any}
                    >
                        {sessions?.map((session, index) => (
                            <SelectItemComponent
                                value={session._id}
                                key={`session-${index}`}
                                isLoading={sessionsIsLoading}
                                label={`${session.name} | ${dayjs(session.clockInStartTime).format('Do MMM YYYY')}`}
                            />
                        ))}
                    </SelectComponent>
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'baseline',
                            justifyContent: 'space-between',
                        }}
                    >
                        <TextComponent size="lg" bold>
                            Eligible:{'  '}
                        </TextComponent>
                        <TextComponent bold size="2xl">
                            {eligible || 0}
                        </TextComponent>
                    </View>
                </HStackComponent>
            </AttendanceContainer>
            <FlatListComponent
                onRefresh={handleRefetch}
                padding={isAndroid ? 3 : 4}
                isLoading={isLoading || isFetching}
                refreshing={isLoading || isFetching}
                columns={scoreMappingColumn}
                data={mergedAttendanceWithMemberList || []}
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

    const { data: HODProfiles } = useGetCummulativeScoresQuery(
        { roleId: leaderRoleIds && leaderRoleIds[0], campusId: user?.campus?._id, CGWCId, serviceId },
        { skip: !leaderRoleIds?.length }
    );
    const { data: AHODProfiles } = useGetCummulativeScoresQuery(
        { roleId: leaderRoleIds && leaderRoleIds[1], campusId: user?.campus?._id, CGWCId, serviceId },
        { skip: !leaderRoleIds?.length }
    );

    const leadersClockedIn = AHODs && HODs ? [...AHODs, ...HODs] : [];
    const allLeadersRaw = HODProfiles && AHODProfiles ? [...AHODProfiles, ...HODProfiles] : [];
    const allLeaders = !!allLeadersRaw.length ? allLeadersRaw : [];

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

    const eligible = React.useMemo(() => allLeaders?.filter(leader => leader.isEligible)?.length, [allLeaders]);

    return (
        <ErrorBoundary>
            <HStackComponent
                style={{
                    flex: 0,
                    marginBottom: 6,
                    paddingHorizontal: 8,
                    alignItems: 'baseline',
                }}
                space={8}
            >
                <SelectComponent
                    valueKey="_id"
                    displayKey="name"
                    items={sessions || []}
                    style={{ width: 200 }}
                    selectedValue={serviceId}
                    placeholder="Select Session"
                    onValueChange={setService as any}
                >
                    {sessions?.map((session, index) => (
                        <SelectItemComponent
                            value={session._id}
                            key={`session-${index}`}
                            isLoading={serviceIsLoading}
                            label={`${session.name} | ${dayjs(session.clockInStartTime).format('Do MMM YYYY')}`}
                        />
                    ))}
                </SelectComponent>
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'baseline',
                        justifyContent: 'space-between',
                    }}
                >
                    <TextComponent size="lg" bold>
                        Eligible:{'  '}
                    </TextComponent>
                    <TextComponent bold size="2xl">
                        {eligible || 0}
                    </TextComponent>
                </View>
            </HStackComponent>
            <FlatListComponent
                onRefresh={handleRefetch}
                padding={isAndroid ? 3 : 10}
                isLoading={isLoading || isFetching}
                refreshing={isLoading || isFetching}
                data={mergedAttendanceWithLeaderList}
                columns={scoreMappingColumn}
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

    const { data: campusAttendance, isLoading: campusIsLoading } = useGetAttendanceQuery({
        page,
        CGWCId,
        serviceId,
        campusId: user?.campus._id,
    });

    const {
        data: scoreMappingAttendance,
        refetch,
        isLoading,
        isSuccess,
        isFetching,
    } = useGetCummulativeScoresQuery(
        {
            CGWCId,
            serviceId,
            campusId: user?.campus._id,
        },
        {
            skip: !serviceId,
            refetchOnMountOrArgChange: true,
        }
    );

    const scoreMappingAttendanceValid = !!scoreMappingAttendance?.length ? scoreMappingAttendance : [];

    const allMembersClockedInValid = React.useMemo(() => {
        if (!campusAttendance?.length) return [];

        return campusAttendance?.map(attendance => {
            return {
                ...attendance,
                userId: attendance.user._id,
            };
        });
    }, [campusAttendance]);

    const mergedAttendance = [...allMembersClockedInValid, ...scoreMappingAttendanceValid] as any;

    const mergedAttendanceWithLeaderList = React.useMemo(
        () => Utils.mergeDuplicatesByKey(mergedAttendance, 'userId'),
        [scoreMappingAttendanceValid, mergedAttendance]
    );

    const eligible = React.useMemo(
        () => scoreMappingAttendance?.filter(member => member.isEligible)?.length,
        [scoreMappingAttendance]
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
            <HStackComponent
                style={{
                    flex: 0,
                    marginBottom: 6,
                    paddingHorizontal: 8,
                    alignItems: 'baseline',
                }}
                space={8}
            >
                <SelectComponent
                    valueKey="_id"
                    displayKey="name"
                    items={sessions || []}
                    style={{ width: 200 }}
                    selectedValue={serviceId}
                    placeholder="Select Session"
                    onValueChange={setService as any}
                >
                    {sessions?.map((session, index) => (
                        <SelectItemComponent
                            value={session._id}
                            key={`session-${index}`}
                            isLoading={sessionsIsLoading}
                            label={`${session.name} | ${dayjs(session.clockInStartTime).format('Do MMM YYYY')}`}
                        />
                    ))}
                </SelectComponent>
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'baseline',
                        justifyContent: 'space-between',
                    }}
                >
                    <TextComponent size="lg" bold>
                        Eligible:{'  '}
                    </TextComponent>
                    <TextComponent bold size="2xl">
                        {eligible || 0}
                    </TextComponent>
                </View>
            </HStackComponent>
            <FlatListComponent
                onRefresh={handleRefetch}
                data={mergedAttendanceWithLeaderList || []}
                padding={isAndroid ? 3 : 10}
                // fetchMoreData={fetchMoreData}
                isLoading={isLoading || isFetching || sessionsIsLoading}
                refreshing={isLoading || isFetching}
                columns={scoreMappingColumn}
                ListFooterComponentStyle={{ marginVertical: 20 }}
            />
        </ErrorBoundary>
    );
});

interface IAttendanceContainerProps {
    title: string;
    showTitle?: boolean;
    children: ReactNode;
    score?: number | string;
    scoreType: 'percent' | 'count';
}

export const AttendanceContainer: React.FC<IAttendanceContainerProps> = React.memo(
    ({ children, title, score, scoreType, showTitle = true }) => {
        return (
            <View style={{ paddingHorizontal: 4 }}>
                <If condition={showTitle}>
                    <HStackComponent
                        style={{ paddingVertical: 10, justifyContent: 'space-between', alignItems: 'baseline' }}
                    >
                        <TextComponent size="lg" bold style={{ textAlign: 'center', paddingTop: 3, paddingBottom: 4 }}>
                            {title}
                        </TextComponent>
                        {!!score && (
                            <TextComponent
                                bold
                                fontSize="lg"
                                style={{
                                    paddingTop: 3,
                                    paddingBottom: 4,
                                    textAlign: 'center',
                                    color:
                                        +score < 31
                                            ? THEME_CONFIG.rose
                                            : +score > 69
                                              ? THEME_CONFIG.lightSuccess
                                              : THEME_CONFIG.warning,
                                }}
                            >
                                {score || 0}
                                {scoreType === 'percent' && '%'}
                            </TextComponent>
                        )}
                    </HStackComponent>
                </If>
                {children}
            </View>
        );
    }
);

export const AttendanceListRow: React.FC<IAttendance> = React.memo(
    ({ name, clockIn, clockOut, score = 0, ...props }) => {
        return (
            <HStackComponent
                style={{
                    paddingVertical: 10,
                    alignItems: 'center',
                    borderBottomWidth: 0.4,
                    justifyContent: 'space-between',
                    borderBottomColor: THEME_CONFIG.lightGray,
                }}
            >
                <TextComponent style={{ width: '40%' }}>{name}</TextComponent>
                <HStackComponent style={{ justifyContent: 'center', minWidth: '23%' }}>
                    <Icon color={THEME_CONFIG.primaryLight} name="arrow-down-right" type="feather" size={18} />
                    <TextComponent style={{ textAlign: 'right' }}>
                        {clockIn ? dayjs(clockIn).format('h:mm A') : '--:--'}
                    </TextComponent>
                </HStackComponent>
                <HStackComponent style={{ justifyContent: 'center', minWidth: '23%' }}>
                    <Icon color={THEME_CONFIG.primaryLight} name="arrow-up-right" type="feather" size={18} />
                    <TextComponent style={{ textAlign: 'right' }}>
                        {!!clockOut ? dayjs(clockOut).format('h:mm A') : '--:--'}
                    </TextComponent>
                </HStackComponent>
                {typeof score === 'number' && (
                    <HStackComponent style={{ justifyContent: 'center', minWidth: '15%' }}>
                        <TextComponent style={{ textAlign: 'center' }}>{score}</TextComponent>
                    </HStackComponent>
                )}
            </HStackComponent>
        );
    }
);

export const AttendanceHeader: React.FC<{ titles: string[] }> = React.memo(({ titles }) => {
    return (
        <HStackComponent
            style={[
                styles.listRow,
                {
                    width: '50%',
                    alignItems: 'center',
                    borderTopWidth: 0.6,
                    borderBottomWidth: 0.6,
                    justifyContent: 'space-between',
                    borderColor: THEME_CONFIG.lightGray,
                },
            ]}
        >
            {titles?.map((title, index) => (
                <View key={index} style={{ minWidth: index === 0 ? '40%' : index === 3 ? '15%' : '23%' }}>
                    <TextComponent
                        bold
                        style={{
                            textAlign: index !== 0 ? 'center' : 'left',
                            maxWidth: index === 0 ? ScreenWidth / 3.6 : ScreenWidth / 4.5,
                        }}
                    >
                        {title}
                    </TextComponent>
                </View>
            ))}
        </HStackComponent>
    );
});

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
