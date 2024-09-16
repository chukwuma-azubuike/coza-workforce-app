import Loading from '@components/atoms/loading';
import ErrorBoundary from '@components/composite/error-boundary';
import If from '@components/composite/if-container';
import TextComponent from '@components/text';
import { THEME_CONFIG } from '@config/appConfig';
import useScreenFocus from '@hooks/focus';
import useRole from '@hooks/role';
import { useNavigation } from '@react-navigation/native';
import { Icon, ScreenHeight } from '@rneui/base';
import {
    useGetDepartmentAttendanceReportQuery,
    useGetLeadersAttendanceReportQuery,
    useGetWorkersAttendanceReportQuery,
} from '@store/services/attendance';
import { IGHSubmittedReport } from '@store/services/reports';
import { useGetLatestServiceQuery } from '@store/services/services';
import { useGetCampusTicketReportQuery } from '@store/services/tickets';
import moment from 'moment';
import { Center, HStack, Text, VStack } from 'native-base';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { GeoCoordinates } from 'react-native-geolocation-service';
import { CampusAttendanceSummary, TeamAttendanceSummary } from '../campus-pastors/attendance-summary';
import { CampusTicketSummary } from '../campus-pastors/ticket-summary';
import ClockButton from './clock-button';
import ClockStatistics from './clock-statistics';
import Timer from './timer';
import VStackComponent from '@components/layout/v-stack';

interface IClockerProps {
    isGh?: boolean;
    isInRange: boolean;
    refreshTrigger: boolean;
    deviceCoordinates: GeoCoordinates;
    refreshLocation: () => Promise<void>;
    setRefreshTrigger: React.Dispatch<React.SetStateAction<boolean>>;
    verifyRangeBeforeAction: (successCallback: () => any, errorCallback: () => any) => Promise<void>;
    ghReport?: IGHSubmittedReport;
}

const Clocker: React.FC<IClockerProps> = ({
    verifyRangeBeforeAction,
    deviceCoordinates,
    setRefreshTrigger,
    refreshLocation,
    refreshTrigger,
    isInRange,
    isGh,
    ghReport,
}) => {
    const navigation = useNavigation();

    const {
        isHOD,
        isAHOD,
        isCampusPastor,
        isGroupHead,
        user: { department, campus, userId },
    } = useRole();

    const {
        data: latestService,
        refetch: refetchService,
        isUninitialized: serviceIsUninitialized,
    } = useGetLatestServiceQuery(campus?._id as string);

    const {
        data: attendanceReport,
        isLoading: attendanceReportLoading,
        refetch: attendanceReportRefetch,
        isUninitialized: attendanceReportIsUninitialized,
    } = useGetDepartmentAttendanceReportQuery({
        serviceId: ghReport?.serviceId ?? (latestService?._id as string),
        departmentId: department?._id,
    });

    const {
        data: leadersAttendance,
        refetch: refetchLeaders,
        isUninitialized: leadersIsUninitialized,
    } = useGetLeadersAttendanceReportQuery(
        {
            serviceId: ghReport?.serviceId ?? (latestService?._id as string),
            campusId: campus?._id,
        },
        { skip: !latestService?._id && !ghReport?.serviceId }
    );

    const {
        data: workersAttendance,
        refetch: refetchWorkers,
        isUninitialized: workersIsUninitialized,
    } = useGetWorkersAttendanceReportQuery(
        {
            serviceId: ghReport?.serviceId ?? (latestService?._id as string),
            campusId: campus?._id,
        },
        { skip: !latestService?._id && !ghReport?.serviceId }
    );

    const {
        data: tickets,
        refetch: refetchTickets,
        isUninitialized: ticketsIsUninitialized,
    } = useGetCampusTicketReportQuery(
        {
            serviceId: ghReport?.serviceId ?? (latestService?._id as string),
            campusId: campus?._id,
        },
        { skip: !latestService?._id && !ghReport?.serviceId }
    );

    const refreshData = () => {
        refreshLocation();
        !serviceIsUninitialized && refetchService();
        !leadersIsUninitialized && refetchLeaders();
        !workersIsUninitialized && refetchWorkers();
        !ticketsIsUninitialized && refetchTickets();
        !attendanceReportIsUninitialized && attendanceReportRefetch();
    };

    useScreenFocus({
        onFocus: refreshData,
    });

    React.useEffect(() => {
        if (refreshTrigger) {
            refreshData();
        }
        setRefreshTrigger(false);

        return () => {
            setRefreshTrigger(false);
        };
    }, [refreshTrigger]);

    const heightOffset = ScreenHeight * 0.6;

    const handleNavigateToReports = () => {
        navigation.navigate('Group Head Service Report' as never);
    };

    return (
        <Center _dark={{ bg: 'black' }}>
            {ghReport?.serviceId ? (
                <VStackComponent style={{ alignItems: 'center', paddingBottom: 10 }}>
                    <TextComponent bold>{ghReport?.serviceName}</TextComponent>
                    <TextComponent>{moment(ghReport?.createdAt).format('MMMM Do, YYYY')}</TextComponent>
                </VStackComponent>
            ) : (
                <Timer />
            )}
            <If condition={isCampusPastor || isGh}>
                <CampusAttendanceSummary
                    leadersAttendance={leadersAttendance?.attendance}
                    workersAttendance={workersAttendance?.attendance}
                    leaderUsers={leadersAttendance?.leaderUsers}
                    workerUsers={workersAttendance?.workerUsers}
                />
                <CampusTicketSummary tickets={tickets} />
            </If>
            {!userId ? (
                <Loading />
            ) : (
                <If condition={!isCampusPastor && !isGh}>
                    <VStack h={heightOffset} alignItems="center" justifyContent="space-between">
                        <ErrorBoundary>
                            <ClockButton
                                isInRange={!!isInRange}
                                refreshLocation={refreshLocation}
                                deviceCoordinates={deviceCoordinates}
                                verifyRangeBeforeAction={verifyRangeBeforeAction}
                            />
                            {isGroupHead && latestService?._id && (
                                <TouchableOpacity activeOpacity={0.6} onPress={handleNavigateToReports}>
                                    <HStack alignItems="center" space={1} mt={10}>
                                        <Icon
                                            color={THEME_CONFIG.primary}
                                            name="people-outline"
                                            type="ionicon"
                                            size={18}
                                        />
                                        <Text color="gray.400" fontSize="md" ml={2}>
                                            Group reports submitted
                                        </Text>
                                        <Icon
                                            color={THEME_CONFIG.primary}
                                            name="external-link"
                                            type="evilicon"
                                            size={26}
                                        />
                                    </HStack>
                                </TouchableOpacity>
                            )}
                        </ErrorBoundary>
                        {/* <CampusLocation /> */}
                        <If condition={isAHOD || isHOD}>
                            <TeamAttendanceSummary
                                isLoading={attendanceReportLoading}
                                attendance={attendanceReport?.attendance}
                                departmentUsers={attendanceReport?.departmentUsers}
                            />
                        </If>
                        <ClockStatistics />
                    </VStack>
                </If>
            )}
        </Center>
    );
};

export default React.memo(Clocker);
