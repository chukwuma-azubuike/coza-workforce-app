import React from 'react';
import { Center, HStack, Text, VStack, View } from 'native-base';
import ClockButton from './clock-button';
import Timer from './timer';
import CampusLocation from './campus-location';
import ClockStatistics from './clock-statistics';
import { CampusAttendanceSummary, TeamAttendanceSummary } from '../campus-pastors/attendance-summary';
import { GeoCoordinates } from 'react-native-geolocation-service';
import { Dimensions, Pressable, TouchableOpacity } from 'react-native';
import useRole from '@hooks/role';
import If from '@components/composite/if-container';
import {
    useGetDepartmentAttendanceReportQuery,
    useGetLeadersAttendanceReportQuery,
    useGetWorkersAttendanceReportQuery,
} from '@store/services/attendance';
import { CampusTicketSummary } from '../campus-pastors/ticket-summary';
import Loading from '@components/atoms/loading';
import { useGetLatestServiceQuery } from '@store/services/services';
import useScreenFocus from '@hooks/focus';
import { useGetCampusTicketReportQuery } from '@store/services/tickets';
import ErrorBoundary from '@components/composite/error-boundary';
import { Icon, ScreenHeight } from '@rneui/base';
import { THEME_CONFIG } from '@config/appConfig';
import { useNavigation } from '@react-navigation/native';

interface IClockerProps {
    isGh?: boolean;
    isInRange: boolean;
    refreshTrigger: boolean;
    deviceCoordinates: GeoCoordinates;
    refreshLocation: () => Promise<void>;
    setRefreshTrigger: React.Dispatch<React.SetStateAction<boolean>>;
    verifyRangeBeforeAction: (successCallback: () => any, errorCallback: () => any) => Promise<void>;
}

const Clocker: React.FC<IClockerProps> = ({
    verifyRangeBeforeAction,
    deviceCoordinates,
    setRefreshTrigger,
    refreshLocation,
    refreshTrigger,
    isInRange,
    isGh,
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
        serviceId: latestService?._id as string,
        departmentId: department?._id,
    });

    const {
        data: leadersAttendance,
        refetch: refetchLeaders,
        isUninitialized: leadersIsUninitialized,
    } = useGetLeadersAttendanceReportQuery(
        {
            serviceId: latestService?._id as string,
            campusId: campus?._id,
        },
        { skip: !latestService?._id }
    );

    const {
        data: workersAttendance,
        refetch: refetchWorkers,
        isUninitialized: workersIsUninitialized,
    } = useGetWorkersAttendanceReportQuery(
        {
            serviceId: latestService?._id as string,
            campusId: campus?._id,
        },
        { skip: !latestService?._id }
    );

    const {
        data: tickets,
        refetch: refetchTickets,
        isUninitialized: ticketsIsUninitialized,
    } = useGetCampusTicketReportQuery(
        {
            serviceId: latestService?._id as string,
            campusId: campus?._id,
        },
        { skip: !latestService?._id }
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
        navigation.navigate('Group head service report' as never);
    };
    return (
        <Center _dark={{ bg: 'black' }}>
            <Timer />
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
                            {isGroupHead && (
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
                        <CampusLocation />
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
