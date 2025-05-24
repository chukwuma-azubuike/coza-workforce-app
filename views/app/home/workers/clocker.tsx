import React from 'react';
import ClockButton from './clock-button';
import Timer from './timer';
import CampusLocation from './campus-location';
import ClockStatistics from './clock-statistics';
import { CampusAttendanceSummary, TeamAttendanceSummary } from '../campus-pastors/attendance-summary';
import { GeoCoordinates } from 'react-native-geolocation-service';
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
import { View } from 'react-native';
import TopNav from '../top-nav';
import { cn } from '~/lib/utils';
import ViewWrapper from '~/components/layout/viewWrapper';
import { ScreenHeight } from '@rneui/base';

interface IClockerProps {
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
}) => {
    const {
        isHOD,
        isAHOD,
        isCampusPastor,
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
        departmentId: department?._id as string,
    });

    const {
        data: leadersAttendance,
        refetch: refetchLeaders,
        isUninitialized: leadersIsUninitialized,
    } = useGetLeadersAttendanceReportQuery(
        {
            serviceId: latestService?._id as string,
            campusId: campus?._id as string,
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
            campusId: campus?._id as string,
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
            campusId: campus?._id as string,
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

    return (
        <View className={cn('gap', 'flex-1 mt-2')}>
            <TopNav />
            <ViewWrapper scroll onRefresh={refreshData} refreshing={false} className="pt-6">
                <Timer />
                <If condition={isCampusPastor}>
                    <View className="gap-5 flex-1 mt-12">
                        <CampusAttendanceSummary
                            leadersAttendance={leadersAttendance?.attendance}
                            workersAttendance={workersAttendance?.attendance}
                            leaderUsers={leadersAttendance?.leaderUsers}
                            workerUsers={workersAttendance?.workerUsers}
                        />
                        <CampusTicketSummary tickets={tickets} />
                    </View>
                </If>
                {!userId ? (
                    <Loading />
                ) : (
                    <If condition={!isCampusPastor}>
                        <View
                            className="flex-1 items-center justify-between pt-12"
                            style={{ height: ScreenHeight - 300 }}
                        >
                            <ErrorBoundary>
                                <ClockButton
                                    isInRange={!!isInRange}
                                    refreshLocation={refreshLocation}
                                    onSuccess={attendanceReportRefetch}
                                    deviceCoordinates={deviceCoordinates}
                                    verifyRangeBeforeAction={verifyRangeBeforeAction}
                                />
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
                        </View>
                    </If>
                )}
            </ViewWrapper>
        </View>
    );
};
export default React.memo(Clocker);
