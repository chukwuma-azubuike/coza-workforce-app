import React from 'react';
import {
    useGetDepartmentAttendanceReportQuery,
    useGetLeadersAttendanceReportQuery,
    useGetWorkersAttendanceReportQuery,
} from '@store/services/attendance';
import useRole from '@hooks/role';
import { IService } from '@store/types';
import moment from 'moment';
import { SelectComponent, SelectItemComponent } from '@components/atoms/select';
import { Box, Center, Flex, HStack, Text } from 'native-base';
import { THEME_CONFIG } from '@config/appConfig';
import { Icon } from '@rneui/themed';
import Loading from '@components/atoms/loading';
import { TouchableOpacity } from 'react-native';
import { CountUp } from 'use-count-up';
import { useNavigation } from '@react-navigation/native';
import useScreenFocus from '@hooks/focus';
import If from '@components/composite/if-container';

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
            CGWCId,
            isCGWC: true,
            departmentId: department?._id,
            serviceId: serviceId as string,
        },
        { skip: !serviceId }
    );

    const {
        data: leadersAttendance,
        refetch: refetchLeaders,
        isLoading: leadersReportLoading,
        isUninitialized: leadersIsUninitialized,
    } = useGetLeadersAttendanceReportQuery(
        {
            CGWCId,
            isCGWC: true,
            campusId: campus?._id,
            serviceId: serviceId as string,
        },
        { skip: !serviceId }
    );

    const {
        data: workersAttendance,
        refetch: refetchWorkers,
        isUninitialized: workersIsUninitialized,
    } = useGetWorkersAttendanceReportQuery(
        {
            CGWCId,
            isCGWC: true,
            campusId: campus?._id,
            serviceId: serviceId as string,
        },
        { skip: !serviceId }
    );

    const navigation = useNavigation();

    const goToAttendance = () => {
        navigation.navigate('CGWC Attendance' as never, { CGWCId } as never);
    };

    const goToTickets = () => {
        navigation.navigate('Tickets' as never);
    };

    useScreenFocus({
        onFocus: () => {
            if (!!sessions?.length) {
                return setServiceId(sessions[0]?._id);
            }
        },
    });

    React.useEffect(() => {
        if (!!sessions?.length) {
            return setServiceId(sessions[0]?._id);
        }
    }, [sessions]);

    return (
        <Box flexDirection="column" w={['100%', '46%']}>
            <HStack px={2} pt={[6, 0]} justifyContent="space-between" alignItems="baseline">
                <Text textAlign="center" fontSize="lg" bold pt={3} pb={4}>
                    {title}
                </Text>
                <SelectComponent
                    w={180}
                    selectedValue={serviceId}
                    onValueChange={setService}
                    placeholder="Select Service"
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
                                        <CountUp isCounting duration={2} end={attendanceReport?.tickets || 0} />
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
