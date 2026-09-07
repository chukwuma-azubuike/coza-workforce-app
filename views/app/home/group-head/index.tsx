import React, { useContext, useMemo } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import useRole from '@hooks/role';
import useGroup from '@hooks/group';
import useScreenFocus from '@hooks/focus';
import { HomeContext } from '../context';
import { GeoCoordinates } from '~/hooks/geo-location';
import ViewWrapper from '~/components/layout/viewWrapper';
import ErrorBoundary from '@components/composite/error-boundary';
import { Separator } from '~/components/ui/separator';
import { Text } from '~/components/ui/text';
import { Card } from '~/components/ui/card';

import { useGetLatestServiceQuery } from '@store/services/services';
import {
    useGetGhReportsQuery,
    useGetGHLeaderAttendanceReportQuery,
    useGetGHWorkersAttendanceReportQuery,
    useGetGHTicketReportQuery,
} from '@store/services/grouphead';
import { IReportStatus } from '@store/types';

import HomeTopBar from '../components/top-bar';
import HomeGreeting from '../components/greeting';
import HomeClockCard from '../components/clock-card';
import { GHKpiGrid } from './gh-kpi-grid';
import GHReportsStatus from './gh-reports-status';
import GHQuickActions from './gh-quick-actions';
import HomeSkeleton from '../components/home-skeleton';

interface IGHHomeProps {
    isInRange: boolean;
    refreshTrigger: boolean;
    deviceCoordinates: GeoCoordinates;
    refreshLocation: () => Promise<void>;
    setRefreshTrigger: React.Dispatch<React.SetStateAction<boolean>>;
    verifyRangeBeforeAction: (ok: () => any, err: () => any) => Promise<void>;
}

const FirstTimeGHEmptyState: React.FC = () => (
    <View className="flex-1 items-center justify-center px-8 gap-6">
        <View className="w-20 h-20 rounded-3xl bg-secondary items-center justify-center">
            <Ionicons name="people-outline" size={36} color="#71717a" />
        </View>
        <View className="items-center gap-2">
            <Text className="text-xl font-bold text-foreground text-center">Not assigned to a Group</Text>
            <Text className="text-md text-muted-foreground text-center leading-relaxed line-clamp-none">
                Your Group Head account hasn't been linked to a Group yet. Contact your Super Admin to get assigned.
            </Text>
        </View>
        <Card className="w-full p-2 bg-secondary/50">
            <Text className="text-sm text-muted-foreground text-center line-clamp-none">
                Once assigned, your Group's departments, reports, and workforce data will appear here.
            </Text>
        </Card>
    </View>
);

const GHHome: React.FC<IGHHomeProps> = ({
    isInRange,
    refreshTrigger,
    deviceCoordinates,
    refreshLocation,
    setRefreshTrigger,
    verifyRangeBeforeAction,
}) => {
    const { user } = useRole();
    const { groupId, isFirstTimeGH } = useGroup();
    const homeCtx = useContext(HomeContext);
    const attendanceData = homeCtx?.latestAttendance?.latestAttendanceData;
    const attendanceLoading = homeCtx?.latestAttendance?.latestAttendanceIsLoading;

    const campusId = user?.campus?._id;

    const {
        isLoading: serviceLoading,
        data: latestService,
        refetch: refetchService,
        isUninitialized: serviceUninitialized,
    } = useGetLatestServiceQuery(campusId as string, { skip: !campusId });

    const serviceId = latestService?._id;

    const {
        data: leadersAttendance,
        refetch: refetchLeaders,
        isUninitialized: leadersUninitialized,
    } = useGetGHLeaderAttendanceReportQuery(
        { serviceId: serviceId as string, campusId },
        { skip: !serviceId }
    );

    const {
        data: workersAttendance,
        refetch: refetchWorkers,
        isUninitialized: workersUninitialized,
    } = useGetGHWorkersAttendanceReportQuery(
        { serviceId: serviceId as string, campusId },
        { skip: !serviceId }
    );

    const {
        data: ticketReport,
        refetch: refetchTickets,
        isUninitialized: ticketsUninitialized,
    } = useGetGHTicketReportQuery(
        { serviceId: serviceId as string, campusId },
        { skip: !serviceId }
    );

    const {
        data: ghReportList,
        refetch: refetchGhReport,
        isUninitialized: ghReportUninitialized,
        isLoading: ghReportLoading,
    } = useGetGhReportsQuery({ serviceId }, { skip: !serviceId });

    // The list endpoint is group-scoped (all services). Narrow to the current
    // service when the rows carry a serviceId; otherwise show the group's rows.
    const serviceReports = useMemo(() => {
        const all = ghReportList?.reports ?? [];
        const hasServiceIds = all.some(r => !!r.serviceId);
        return hasServiceIds ? all.filter(r => r.serviceId === serviceId) : all;
    }, [ghReportList, serviceId]);

    const pendingCount = useMemo(
        () =>
            serviceReports.filter(
                r =>
                    r.status === IReportStatus.HOD_SUBMITTED ||
                    r.status === IReportStatus.PENDING ||
                    r.status === IReportStatus.CP_CHANGE_REQUESTED
            ).length,
        [serviceReports]
    );

    const totalReports = serviceReports.length;

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

    const isInitialLoad = serviceLoading || ghReportLoading

    return (
        <View className="flex-1">
            <HomeTopBar
                firstName={user?.firstName}
                lastName={user?.lastName}
                pictureUrl={user?.pictureUrl}
                serviceName={latestService?.name}
                serviceTime={latestService?.serviceTime}
            />

            {isFirstTimeGH ? (
                <FirstTimeGHEmptyState />
            ) : isInitialLoad ? (
                <HomeSkeleton />
            ) : (
                <ViewWrapper scroll noPadding refreshing={false} onRefresh={refreshAll} className="flex-1">
                    <HomeGreeting
                        firstName={user?.firstName}
                        campus={user?.campus?.campusName}
                    />
                    <View className="px-4 gap-5 pt-2 pb-4">
                        <ErrorBoundary>
                            <HomeClockCard
                                isInRange={isInRange}
                                deviceCoordinates={deviceCoordinates}
                                service={latestService}
                                latestAttendanceData={attendanceData}
                                latestAttendanceIsLoading={attendanceLoading}
                                verifyRangeBeforeAction={verifyRangeBeforeAction}
                            />
                        </ErrorBoundary>

                        <GHKpiGrid
                            leadersAttendance={leadersAttendance?.attended}
                            leaderUsers={leadersAttendance?.totalLeaders}
                            workersAttendance={workersAttendance?.attended}
                            workerUsers={workersAttendance?.totalWorkers}
                            pendingReports={pendingCount}
                            totalReports={totalReports}
                            tickets={ticketReport?.tickets}
                            isLoading={ghReportLoading}
                        />

                        <GHQuickActions pendingCount={pendingCount} />

                        <Separator />

                        <ErrorBoundary>
                            <GHReportsStatus reports={serviceReports} isLoading={ghReportLoading} />
                        </ErrorBoundary>
                    </View>
                </ViewWrapper>
            )}
        </View>
    );
};

export default React.memo(GHHome);
