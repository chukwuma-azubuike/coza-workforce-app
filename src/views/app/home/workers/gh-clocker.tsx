import Loading from '@components/atoms/loading';
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
import { Center, HStack, VStack } from 'native-base';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { GeoCoordinates } from 'react-native-geolocation-service';
import { CampusAttendanceSummary } from '../campus-pastors/attendance-summary';
import { CampusTicketSummary } from '../campus-pastors/ticket-summary';
import ClockButton from './clock-button';
import ClockStatistics from './clock-statistics';
import Timer from './timer';

interface IGHClockerProps {
    isGh?: boolean;
    isInRange: boolean;
    refreshTrigger: boolean;
    deviceCoordinates: GeoCoordinates;
    refreshLocation: () => Promise<void>;
    setRefreshTrigger: React.Dispatch<React.SetStateAction<boolean>>;
    verifyRangeBeforeAction: (successCallback: () => any, errorCallback: () => any) => Promise<void>;
    ghReport?: IGHSubmittedReport;
    showReport?: boolean;
}

const GHClocker: React.FC<IGHClockerProps> = ({
    verifyRangeBeforeAction,
    deviceCoordinates,
    setRefreshTrigger,
    refreshLocation,
    refreshTrigger,
    isInRange,
    isGh,
    showReport = false,
    ghReport,
}) => {
    const navigation = useNavigation();

    const {
        user,
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
            {!showReport && <Timer />}
            <If condition={showReport}>
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
                <If condition={!showReport}>
                    <VStack h={heightOffset} alignItems="center" justifyContent="space-around">
                        {!showReport && (
                            <ClockButton
                                isInRange={!!isInRange}
                                refreshLocation={refreshLocation}
                                deviceCoordinates={deviceCoordinates}
                                verifyRangeBeforeAction={verifyRangeBeforeAction}
                            />
                        )}
                        {isGroupHead && latestService?._id && (
                            <TouchableOpacity activeOpacity={0.6} onPress={handleNavigateToReports}>
                                <HStack alignItems="center" space={1} mt={10}>
                                    <Icon color={THEME_CONFIG.primary} name="people-outline" type="ionicon" size={18} />
                                    <TextComponent>Group reports submitted</TextComponent>
                                    <Icon color={THEME_CONFIG.primary} name="external-link" type="evilicon" size={26} />
                                </HStack>
                            </TouchableOpacity>
                        )}
                        <ClockStatistics />
                    </VStack>
                </If>
            )}
        </Center>
    );
};
export default React.memo(GHClocker);
