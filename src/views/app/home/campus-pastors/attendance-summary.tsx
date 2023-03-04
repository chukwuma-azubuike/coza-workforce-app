import React from 'react';
import { Icon } from '@rneui/base';
import { Center, Flex, HStack, Text, VStack } from 'native-base';
import { THEME_CONFIG } from '../../../../config/appConfig';
import {
    useGetDepartmentAttendanceReportQuery,
    useGetLeadersAttendanceReportQuery,
    useGetWorkersAttendanceReportQuery,
} from '../../../../store/services/attendance';
import useRole from '../../../../hooks/role';
import { useGetLatestServiceQuery } from '../../../../store/services/services';
import { CountUp } from 'use-count-up';
import useScreenFocus from '../../../../hooks/focus';
import Loading from '../../../../components/atoms/loading';

const TeamAttendanceSummary: React.FC = () => {
    const {
        user: { department, campus },
    } = useRole();

    const { data: latestService } = useGetLatestServiceQuery(campus?._id as string);

    const {
        data: attendanceReport,
        isLoading,
        refetch,
    } = useGetDepartmentAttendanceReportQuery({
        serviceId: latestService?._id as string,
        departmentId: department._id,
    });

    useScreenFocus({
        onFocus: refetch,
    });

    return (
        <Center>
            {isLoading ? (
                <Loading />
            ) : (
                <HStack alignItems="baseline">
                    <Flex alignItems="center" flexDirection="row">
                        <Icon color={THEME_CONFIG.primaryLight} name="people-outline" type="ionicon" size={18} />
                        <Text ml={2} fontSize="md" _dark={{ color: 'gray.400' }} _light={{ color: 'gray.600' }}>
                            Members clocked in:
                        </Text>
                    </Flex>

                    <Flex alignItems="baseline" flexDirection="row">
                        <Text fontWeight="semibold" color="primary.500" fontSize="4xl" ml={1}>
                            <CountUp isCounting duration={2} end={attendanceReport?.attendance ?? 0} />
                        </Text>
                        <Text
                            fontSize="md"
                            fontWeight="semibold"
                            _dark={{ color: 'gray.400' }}
                            _light={{ color: 'gray.600' }}
                        >
                            /<CountUp isCounting duration={2} end={attendanceReport?.departmentUsers ?? 0} />
                        </Text>
                    </Flex>
                </HStack>
            )}
        </Center>
    );
};

const CampusAttendanceSummary: React.FC = () => {
    const {
        user: { campus },
    } = useRole();

    const { data: latestService } = useGetLatestServiceQuery(campus?._id as string);

    const {
        data: leadersAttendance,
        refetch: refetchLeaders,
        isLoading: leadersLoading,
    } = useGetLeadersAttendanceReportQuery({
        serviceId: latestService?._id as string,
        campusId: campus._id,
    });

    const {
        data: workersAttendance,
        refetch: refetchWorkers,
        isLoading: workersLoading,
    } = useGetWorkersAttendanceReportQuery({
        serviceId: latestService?._id as string,
        campusId: campus._id,
    });

    useScreenFocus({
        onFocus: () => {
            refetchLeaders();
            refetchWorkers();
        },
    });

    return (
        <Center>
            <HStack alignItems="center" space={10}>
                <VStack alignItems="center">
                    <Flex alignItems="baseline" flexDirection="row">
                        <Text fontWeight="semibold" color="primary.600" fontSize="4xl" ml={1}>
                            <CountUp isCounting duration={2} end={leadersAttendance?.attendance || 0} />
                        </Text>
                        <Text
                            fontWeight="semibold"
                            _light={{ color: 'gray.600' }}
                            _dark={{ color: 'gray.400' }}
                            fontSize="md"
                        >{`/${leadersAttendance?.leaderUsers || 0}`}</Text>
                    </Flex>
                    <Flex alignItems="center" flexDirection="row">
                        <Icon color={THEME_CONFIG.primary} name="people-outline" type="ionicon" size={18} />
                        <Text _light={{ color: 'gray.600' }} _dark={{ color: 'gray.400' }} fontSize="md" ml={2}>
                            Leaders present
                        </Text>
                    </Flex>
                </VStack>
                <VStack alignItems="center">
                    <Flex alignItems="baseline" flexDirection="row">
                        <Text fontWeight="semibold" color="primary.600" fontSize="4xl" ml={1}>
                            <CountUp isCounting duration={2} end={workersAttendance?.attendance || 0} />
                        </Text>
                        <Text
                            fontWeight="semibold"
                            _light={{ color: 'gray.600' }}
                            _dark={{ color: 'gray.400' }}
                            fontSize="md"
                        >{`/${workersAttendance?.workerUsers || 0}`}</Text>
                    </Flex>
                    <Flex alignItems="center" flexDirection="row">
                        <Icon color={THEME_CONFIG.primary} type="material-community" name="crowd" size={18} />
                        <Text _light={{ color: 'gray.600' }} _dark={{ color: 'gray.400' }} fontSize="md" ml={2}>
                            Workers present
                        </Text>
                    </Flex>
                </VStack>
            </HStack>
        </Center>
    );
};

export { TeamAttendanceSummary, CampusAttendanceSummary };
