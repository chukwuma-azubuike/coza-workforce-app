import React, { useContext, useMemo } from 'react';
import { View } from 'react-native';

import useRole from '@hooks/role';
import useScreenFocus from '@hooks/focus';
import { HomeContext } from '../context';
import { GeoCoordinates } from '~/hooks/geo-location';
import ViewWrapper from '~/components/layout/viewWrapper';
import ErrorBoundary from '@components/composite/error-boundary';
import { Separator } from '~/components/ui/separator';

import { useGetLatestServiceQuery } from '@store/services/services';
import {
    useGetLeadersAttendanceReportQuery,
    useGetWorkersAttendanceReportQuery,
} from '@store/services/attendance';
import { useGetCampusTicketReportQuery } from '@store/services/tickets';
import { useGetGhReportByIdQuery } from '@store/services/grouphead';
import { IReportStatus } from '@store/types';

import GHTopBar from './gh-top-bar';
import GHGreeting from './gh-greeting';
import GHClockCard from './gh-clock-card';
import { GHKpiGrid } from './gh-kpi-grid';
import GHReportsStatus from './gh-reports-status';
import GHQuickActions from './gh-quick-actions';

interface IGHHomeProps {
    isInRange: boolean;
    refreshTrigger: boolean;
    deviceCoordinates: GeoCoordinates;
    refreshLocation: () => Promise<void>;
    setRefreshTrigger: React.Dispatch<React.SetStateAction<boolean>>;
    verifyRangeBeforeAction: (ok: () => any, err: () => any) => Promise<void>;
}

const GHHome: React.FC<IGHHomeProps> = ({
    isInRange,
    refreshTrigger,
    deviceCoordinates,
    refreshLocation,
    setRefreshTrigger,
    verifyRangeBeforeAction,
}) => {
    const { user } = useRole();
    const homeCtx = useContext(HomeContext);
    const attendanceData = homeCtx?.latestAttendance?.latestAttendanceData;
    const attendanceLoading = homeCtx?.latestAttendance?.latestAttendanceIsLoading;

    const campusId = user?.campus?._id;

    const {
        data: latestService,
        refetch: refetchService,
        isUninitialized: serviceUninitialized,
    } = useGetLatestServiceQuery(campusId as string, { skip: !campusId });

    const serviceId = latestService?._id;

    const {
        data: leadersAttendance,
        refetch: refetchLeaders,
        isUninitialized: leadersUninitialized,
    } = useGetLeadersAttendanceReportQuery(
        { serviceId: serviceId as string, campusId: campusId as string },
        { skip: !serviceId }
    );

    const {
        data: workersAttendance,
        refetch: refetchWorkers,
        isUninitialized: workersUninitialized,
    } = useGetWorkersAttendanceReportQuery(
        { serviceId: serviceId as string, campusId: campusId as string },
        { skip: !serviceId }
    );

    const {
        data: tickets,
        refetch: refetchTickets,
        isUninitialized: ticketsUninitialized,
    } = useGetCampusTicketReportQuery(
        { serviceId: serviceId as string, campusId: campusId as string },
        { skip: !serviceId }
    );

    const {
        data: ghReport,
        refetch: refetchGhReport,
        isUninitialized: ghReportUninitialized,
        isLoading: ghReportLoading,
    } = useGetGhReportByIdQuery(
        { serviceId: serviceId as string },
        { skip: !serviceId }
    );

    const pendingCount = useMemo(
        () => ghReport?.departmentalReport?.filter(d => d.report.status === IReportStatus.PENDING).length ?? 0,
        [ghReport]
    );

    const totalReports = ghReport?.departmentalReport?.length ?? 0;

    const refreshAll = () => {
        refreshLocation();
        !serviceUninitialized && refetchService();
        !leadersUninitialized && refetchLeaders();
        !workersUninitialized && refetchWorkers();
        !ticketsUninitialized && refetchTickets();
        !ghReportUninitialized && refetchGhReport();
    };

    useScreenFocus({ onFocus: refreshAll });

    React.useEffect(() => {
        if (refreshTrigger) {
            refreshAll();
            setRefreshTrigger(false);
        }
    }, [refreshTrigger]);

    return (
        <View className="flex-1">
            <GHTopBar
                firstName={user?.firstName}
                lastName={user?.lastName}
                pictureUrl={user?.pictureUrl}
                serviceName={latestService?.name}
                serviceTime={latestService?.serviceTime}
                unread={false}
            />
            <ViewWrapper scroll noPadding refreshing={false} onRefresh={refreshAll} className="flex-1">
                <GHGreeting
                    firstName={user?.firstName}
                    campus={user?.campus?.campusName}
                />
                <View className="px-4 gap-5 pt-2 pb-4">
                    <ErrorBoundary>
                        <GHClockCard
                            isInRange={isInRange}
                            deviceCoordinates={deviceCoordinates}
                            service={latestService}
                            latestAttendanceData={attendanceData}
                            latestAttendanceIsLoading={attendanceLoading}
                            verifyRangeBeforeAction={verifyRangeBeforeAction}
                        />
                    </ErrorBoundary>

                    <GHKpiGrid
                        leadersAttendance={leadersAttendance?.attendance}
                        leaderUsers={leadersAttendance?.leaderUsers}
                        workersAttendance={workersAttendance?.attendance}
                        workerUsers={workersAttendance?.workerUsers}
                        pendingReports={pendingCount}
                        totalReports={totalReports}
                        tickets={tickets}
                        isLoading={ghReportLoading}
                    />

                    <GHQuickActions pendingCount={pendingCount} />

                    <Separator />

                    <ErrorBoundary>
                        <GHReportsStatus ghReport={ghReport} isLoading={ghReportLoading} />
                    </ErrorBoundary>
                </View>
            </ViewWrapper>
        </View>
    );
};

export default React.memo(GHHome);
