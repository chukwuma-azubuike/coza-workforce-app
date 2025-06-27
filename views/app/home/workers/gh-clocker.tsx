import { Text } from '~/components/ui/text';
import Loading from '@components/atoms/loading';
import If from '@components/composite/if-container';
import { THEME_CONFIG } from '@config/appConfig';
import useScreenFocus from '@hooks/focus';
import useRole from '@hooks/role';
import { useNavigation } from '@react-navigation/native';

import {
    useGetDepartmentAttendanceReportQuery,
    useGetLeadersAttendanceReportQuery,
    useGetWorkersAttendanceReportQuery,
} from '@store/services/attendance';
import { IGHSubmittedReport } from '@store/services/reports';
import { useGetLatestServiceQuery } from '@store/services/services';
import { useGetCampusTicketReportQuery } from '@store/services/tickets';

import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { GeoCoordinates } from '~/hooks/geo-location';
import { CampusAttendanceSummary } from '../campus-pastors/attendance-summary';
import { CampusTicketSummary } from '../campus-pastors/ticket-summary';
import ClockButton from './clock-button';
import ClockStatistics from './clock-statistics';
import Timer from './timer';
import { Ionicons } from '@expo/vector-icons';

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

    const handleNavigateToReports = () => {
        navigation.navigate('Group Head Service Report' as never);
    };

    return (
        <View className="flex-1 justify-between mt-8">
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
                    <View className="items-center justify-around flex-1">
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
                                <View className="items-center gap-4 mt-10 flex-row">
                                    <Ionicons
                                        color={THEME_CONFIG.primary}
                                        name="people-outline"
                                        type="ionicon"
                                        size={18}
                                    />
                                    <Text>Group reports submitted</Text>
                                    <Ionicons
                                        color={THEME_CONFIG.primary}
                                        name="link-outline"
                                        type="evilicon"
                                        size={26}
                                    />
                                </View>
                            </TouchableOpacity>
                        )}
                        <ClockStatistics />
                    </View>
                </If>
            )}
        </View>
    );
};
export default React.memo(GHClocker);
