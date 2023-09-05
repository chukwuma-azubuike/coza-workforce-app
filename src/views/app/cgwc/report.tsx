import React from 'react';
import FlatListComponent from '@components/composite/flat-list';
import { campusColumns_1, myAttendanceColumns, teamAttendanceDataColumns } from '../attendance/flatListConfig';
import {
    useGetAttendanceQuery,
    useGetDepartmentAttendanceReportQuery,
    useGetLeadersAttendanceReportQuery,
    useGetWorkersAttendanceReportQuery,
} from '@store/services/attendance';
import useRole from '@hooks/role';
import { IAttendance, IService } from '@store/types';
import { useGetServicesQuery } from '@store/services/services';
import { useGetUsersByDepartmentIdQuery } from '@store/services/account';
import moment from 'moment';
import ErrorBoundary from '@components/composite/error-boundary';
import useFetchMoreData from '@hooks/fetch-more-data';
import Utils from '@utils/index';
import { SelectComponent, SelectItemComponent } from '@components/atoms/select';
import { Box, Center, Flex, HStack, Text, VStack } from 'native-base';
import { Platform, StyleSheet } from 'react-native';
import { THEME_CONFIG } from '@config/appConfig';
import { Icon } from '@rneui/themed';
import Loading from '@components/atoms/loading';
import { TouchableOpacity } from 'react-native';
import { CountUp } from 'use-count-up';
import { useNavigation } from '@react-navigation/native';
import useScreenFocus from '@hooks/focus';
import If from '@components/composite/if-container';

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

export const CGWCReportSummary: React.FC<{
    latestService?: IService;
    title: string;
    sessions: IService[];
    CGWCId: string;
}> = React.memo(({ latestService, title, sessions, CGWCId }) => {
    const {
        isHOD,
        isAHOD,
        isSuperAdmin,
        isCampusPastor,
        user: { department, campus },
    } = useRole();

    const [serviceId, setServiceId] = React.useState<IService['_id']>();

    const setService = (value: IService['_id']) => {
        setServiceId(value);
    };

    const {
        data: attendanceReport,
        isLoading: attendanceReportLoading,
        refetch: attendanceReportRefetch,
        isUninitialized: attendanceReportIsUninitialized,
    } = useGetDepartmentAttendanceReportQuery(
        {
            isCGWC: true,
            CGWCId: CGWCId,
            departmentId: department?._id,
            serviceId: latestService?._id as string,
        },
        { skip: !latestService?._id && isCampusPastor }
    );

    const {
        data: leadersAttendance,
        refetch: refetchLeaders,
        isLoading: leadersReportLoading,
        isUninitialized: leadersIsUninitialized,
    } = useGetLeadersAttendanceReportQuery(
        {
            isCGWC: true,
            CGWCId: CGWCId,
            serviceId: latestService?._id as string,
            campusId: campus?._id,
        },
        { skip: !latestService?._id && !isCampusPastor }
    );

    const {
        data: workersAttendance,
        refetch: refetchWorkers,
        isUninitialized: workersIsUninitialized,
    } = useGetWorkersAttendanceReportQuery(
        {
            isCGWC: true,
            CGWCId: CGWCId,
            serviceId: latestService?._id as string,
            campusId: campus?._id,
        },
        { skip: !latestService?._id }
    );

    const navigation = useNavigation();

    const goToAttendance = () => {
        navigation.navigate('CGWC Group Attendance' as never, { tabKey: 'teamAttendance' } as never);
    };

    const goToTickets = () => {
        navigation.navigate('Tickets' as never, { tabKey: 'teamTickets' } as never);
    };

    useScreenFocus({
        onFocus: () => {
            !!sessions && setServiceId(sessions[0]?._id);
        },
    });

    return (
        <Box flexDirection="column" w={['100%', '46%']}>
            <HStack px={2} pt={[6, 0]} justifyContent="space-between" alignItems="baseline">
                <Text textAlign="center" fontSize="lg" bold pt={3} pb={4}>
                    {title}
                </Text>
                <SelectComponent
                    w={180}
                    placeholder="Select Service"
                    selectedValue={serviceId}
                    onValueChange={setService}
                >
                    {sessions?.map((session, index) => (
                        <SelectItemComponent
                            value={session._id}
                            key={`session-${index}`}
                            isLoading={!sessions?.length}
                            label={`${session.name} - ${moment(session.serviceTime).format('Do MMM YYYY')}`}
                        />
                    ))}
                </SelectComponent>
            </HStack>
            <Center py={10}>
                {attendanceReportLoading || leadersReportLoading ? (
                    <Loading h={20} w={20} />
                ) : (
                    <Flex
                        px={0}
                        wrap="wrap"
                        alignItems="center"
                        flexDirection="row"
                        style={{ columnGap: 0, rowGap: 20 }}
                    >
                        <If condition={isCampusPastor || isSuperAdmin}>
                            <TouchableOpacity
                                delayPressIn={0}
                                activeOpacity={0.6}
                                onPress={goToAttendance}
                                style={{ width: '50%' }}
                                accessibilityRole="button"
                            >
                                <Center width="100%">
                                    <HStack alignItems="baseline" flexDirection="row">
                                        <Text fontWeight="semibold" color="primary.500" fontSize="4xl" ml={1}>
                                            <CountUp isCounting duration={2} end={leadersAttendance?.attendance || 0} />
                                        </Text>
                                        <Text
                                            fontSize="md"
                                            fontWeight="semibold"
                                            _dark={{ color: 'gray.400' }}
                                            _light={{ color: 'gray.600' }}
                                        >
                                            /
                                            <CountUp
                                                isCounting
                                                duration={2}
                                                end={leadersAttendance?.leaderUsers || 0}
                                            />
                                        </Text>
                                    </HStack>
                                    <HStack alignItems="center" flexDirection="row">
                                        <Icon
                                            color={THEME_CONFIG.primaryLight}
                                            name="people-outline"
                                            type="ionicon"
                                            size={18}
                                        />
                                        <Text
                                            ml={2}
                                            fontSize="md"
                                            _dark={{ color: 'gray.400' }}
                                            _light={{ color: 'gray.600' }}
                                        >
                                            Leaders
                                        </Text>
                                    </HStack>
                                </Center>
                            </TouchableOpacity>
                        </If>
                        <If condition={isCampusPastor || isSuperAdmin}>
                            <TouchableOpacity
                                delayPressIn={0}
                                activeOpacity={0.6}
                                style={{ width: '50%' }}
                                onPress={goToAttendance}
                                accessibilityRole="button"
                            >
                                <Center width="100%">
                                    <HStack alignItems="baseline" flexDirection="row">
                                        <Text fontWeight="semibold" color="primary.500" fontSize="4xl" ml={1}>
                                            <CountUp isCounting duration={2} end={workersAttendance?.attendance || 0} />
                                        </Text>
                                        <Text
                                            fontSize="md"
                                            fontWeight="semibold"
                                            _dark={{ color: 'gray.400' }}
                                            _light={{ color: 'gray.600' }}
                                        >
                                            /
                                            <CountUp
                                                isCounting
                                                duration={2}
                                                end={workersAttendance?.workerUsers || 0}
                                            />
                                        </Text>
                                    </HStack>
                                    <HStack alignItems="center" flexDirection="row">
                                        <Icon
                                            color={THEME_CONFIG.primaryLight}
                                            name="people-outline"
                                            type="ionicon"
                                            size={18}
                                        />
                                        <Text
                                            ml={2}
                                            fontSize="md"
                                            _dark={{ color: 'gray.400' }}
                                            _light={{ color: 'gray.600' }}
                                        >
                                            Workers
                                        </Text>
                                    </HStack>
                                </Center>
                            </TouchableOpacity>
                        </If>
                        <If condition={isHOD || isAHOD}>
                            <TouchableOpacity
                                delayPressIn={0}
                                activeOpacity={0.6}
                                style={{ width: '50%' }}
                                onPress={goToAttendance}
                                accessibilityRole="button"
                            >
                                <Center width="100%">
                                    <HStack alignItems="baseline" flexDirection="row">
                                        <Text fontWeight="semibold" color="primary.500" fontSize="4xl" ml={1}>
                                            <CountUp isCounting duration={2} end={attendanceReport?.attendance || 0} />
                                        </Text>
                                        <Text
                                            fontSize="md"
                                            fontWeight="semibold"
                                            _dark={{ color: 'gray.400' }}
                                            _light={{ color: 'gray.600' }}
                                        >
                                            /
                                            <CountUp
                                                isCounting
                                                duration={2}
                                                end={attendanceReport?.departmentUsers || 0}
                                            />
                                        </Text>
                                    </HStack>
                                    <HStack alignItems="center" flexDirection="row">
                                        <Icon
                                            color={THEME_CONFIG.primaryLight}
                                            name="people-outline"
                                            type="ionicon"
                                            size={18}
                                        />
                                        <Text
                                            ml={2}
                                            fontSize="md"
                                            _dark={{ color: 'gray.400' }}
                                            _light={{ color: 'gray.600' }}
                                        >
                                            Members clocked in
                                        </Text>
                                    </HStack>
                                </Center>
                            </TouchableOpacity>
                        </If>
                        <Box width={isCampusPastor || isSuperAdmin ? '100%' : 'auto'}>
                            <TouchableOpacity
                                delayPressIn={0}
                                activeOpacity={0.6}
                                onPress={goToTickets}
                                accessibilityRole="button"
                            >
                                <Center width={180} mx="auto">
                                    <Text fontWeight="semibold" color="gray.400" fontSize="4xl" ml={1}>
                                        <CountUp isCounting duration={2} end={attendanceReport?.attendance || 0} />
                                    </Text>
                                    <HStack alignItems="center" flexDirection="row">
                                        <Icon
                                            name="ticket-confirmation-outline"
                                            color={THEME_CONFIG.rose}
                                            type="material-community"
                                            size={18}
                                        />
                                        <Text
                                            ml={2}
                                            fontSize="md"
                                            _dark={{ color: 'gray.400' }}
                                            _light={{ color: 'gray.600' }}
                                        >
                                            Tickets
                                        </Text>
                                    </HStack>
                                </Center>
                            </TouchableOpacity>
                        </Box>
                    </Flex>
                )}
            </Center>
        </Box>
    );
});

export const CampusAttendance: React.FC = React.memo(() => {
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
    score: number;
}

export const AttendanceContainer: React.FC<IAttendanceContainerProps> = ({ children, title, score }) => {
    return (
        <>
            <HStack px={2} justifyContent="space-between" alignItems="baseline">
                <Text textAlign="center" fontSize="lg" bold pt={3} pb={4}>
                    {title}
                </Text>
                {!!score && (
                    <Text
                        pb={4}
                        pt={3}
                        bold
                        fontSize="lg"
                        textAlign="center"
                        color={score < 31 ? 'red.600' : score > 69 ? 'green.600' : 'yellow.400'}
                    >
                        {score}%
                    </Text>
                )}
            </HStack>
            {children}
        </>
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
        color: THEME_CONFIG.lightGray,
        width: '33%',
        flexWrap: 'wrap',
    },
});
