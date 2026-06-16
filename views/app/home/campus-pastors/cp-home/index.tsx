import React, { useContext, useMemo } from 'react';
import { FlatList, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import dayjs from 'dayjs';
import { Ionicons } from '@expo/vector-icons';

import useRole from '@hooks/role';
import useScreenFocus from '@hooks/focus';
import { HomeContext } from '../../context';
import { GeoCoordinates } from '~/hooks/geo-location';
import ViewWrapper from '~/components/layout/viewWrapper';
import ErrorBoundary from '@components/composite/error-boundary';
import { Separator } from '~/components/ui/separator';
import { Text } from '~/components/ui/text';
import { Card } from '~/components/ui/card';
import { Skeleton } from '~/components/ui/skeleton';

import { useGetLatestServiceQuery } from '@store/services/services';
import {
    useGetLeadersAttendanceReportQuery,
    useGetWorkersAttendanceReportQuery,
} from '@store/services/attendance';
import { useGetCampusTicketReportQuery } from '@store/services/tickets';
import { useGetCampusReportSummaryQuery } from '@store/services/reports';
import { IReportStatus } from '@store/types';
import { resolveReportType } from '@constants/report-actions';
import { NESTED_PARAM_DEPTS } from '../../_utils/nested-param-depts';

import HomeTopBar from '../../components/top-bar';
import HomeGreeting from '../../components/greeting';
import HomeClockCard from '../../components/clock-card';
import HomeSkeleton from '../../components/home-skeleton';
import CPKpiGrid from './cp-kpi-grid';

import ReportStatusPill from '@components/composite/report-status-pill';
import { getReportStatusMeta } from '@constants/report-status';
import { THEME_CONFIG } from '~/config/appConfig';

interface CPHomeProps {
    isInRange: boolean;
    refreshTrigger: boolean;
    deviceCoordinates: GeoCoordinates;
    refreshLocation: () => Promise<void>;
    setRefreshTrigger: React.Dispatch<React.SetStateAction<boolean>>;
    verifyRangeBeforeAction: (ok: () => any, err: () => any) => Promise<void>;
}

// ─── Department report row ────────────────────────────────────────────────────
const DeptReportRow: React.FC<{ item: any; campusId?: string; serviceId?: string }> = ({ item, campusId, serviceId }) => {
    const meta = getReportStatusMeta(item?.report?.status as string);

    const handlePress = () => {
        const deptName = item?.departmentName;
        const routeKey = resolveReportType({ departmentName: deptName })?.toLowerCase().replace('report', '-report') ?? '';
        const report = { ...item?.report, _id: item?.report?._id, departmentId: item?.report?.departmentId, serviceId, campusId };
        router.push({
            pathname: `/reports/${routeKey}` as any,
            params: NESTED_PARAM_DEPTS.has(deptName) ? ({ data: JSON.stringify(report) } as any) : (report as any),
        });
    };

    return (
        <TouchableOpacity activeOpacity={0.6} onPress={handlePress} accessibilityRole="button">
            <Card className="p-0 overflow-hidden mb-2">
                <View className="flex-row items-stretch">
                    <View className={`w-1 ${meta.accentClass}`} />
                    <View className="flex-1 flex-row items-center justify-between p-3.5">
                        <View className="gap-0.5">
                            <Text className="!text-sm font-semibold text-foreground">{item?.departmentName}</Text>
                            {item?.report?.updatedAt ? (
                                <Text className="!text-xs text-muted-foreground">
                                    {dayjs(item.report.updatedAt).format('DD MMM, YYYY')}
                                </Text>
                            ) : null}
                        </View>
                        <ReportStatusPill status={item?.report?.status as string} size="sm" role="CAMPUS_PASTOR" />
                    </View>
                </View>
            </Card>
        </TouchableOpacity>
    );
};

// ─── Main CPHome ──────────────────────────────────────────────────────────────
const CPHome: React.FC<CPHomeProps> = ({
    isInRange, refreshTrigger, deviceCoordinates, refreshLocation, setRefreshTrigger, verifyRangeBeforeAction,
}) => {
    const { user, isCampusPastor } = useRole();
    const homeCtx = useContext(HomeContext);
    const attendanceData = homeCtx?.latestAttendance?.latestAttendanceData;
    const attendanceLoading = homeCtx?.latestAttendance?.latestAttendanceIsLoading;

    const campusId = user?.campus?._id;

    const {
        data: latestService, refetch: refetchService, isUninitialized: serviceUninitialized,
    } = useGetLatestServiceQuery(campusId as string, { skip: !campusId });

    const serviceId = latestService?._id;

    const { data: leadersAttendance, refetch: refetchLeaders, isUninitialized: leadersUninitialized } =
        useGetLeadersAttendanceReportQuery({ serviceId: serviceId as string, campusId: campusId as string }, { skip: !serviceId });

    const { data: workersAttendance, refetch: refetchWorkers, isUninitialized: workersUninitialized } =
        useGetWorkersAttendanceReportQuery({ serviceId: serviceId as string, campusId: campusId as string }, { skip: !serviceId });

    const { data: tickets, refetch: refetchTickets, isUninitialized: ticketsUninitialized } =
        useGetCampusTicketReportQuery({ serviceId: serviceId as string, campusId: campusId as string }, { skip: !serviceId });

    const {
        data: campusSummary,
        refetch: refetchCampusSummary,
        isLoading: summaryLoading,
        isUninitialized: summaryUninitialized,
    } = useGetCampusReportSummaryQuery(
        { serviceId: serviceId as string, campusId: campusId as string },
        { skip: !serviceId }
    );

    const deptReports = campusSummary?.departmentalReport ?? [];

    const pendingCount = useMemo(
        () => deptReports.filter(d => {
            const s = d?.report?.status;
            return s === IReportStatus.HOD_SUBMITTED || s === IReportStatus.PENDING || s === IReportStatus.GH_APPROVED;
        }).length,
        [deptReports]
    );

    const cpReviewedCount = useMemo(
        () => deptReports.filter(d => {
            const s = d?.report?.status;
            return s === IReportStatus.CP_APPROVED;
        }).length,
        [deptReports]
    );

    const refreshAll = () => {
        refreshLocation();
        !serviceUninitialized && refetchService();
        !leadersUninitialized && refetchLeaders();
        !workersUninitialized && refetchWorkers();
        !ticketsUninitialized && refetchTickets();
        !summaryUninitialized && refetchCampusSummary();
    };

    useScreenFocus({ onFocus: refreshAll });

    React.useEffect(() => {
        if (refreshTrigger) {
            refreshAll();
            setRefreshTrigger(false);
        }
    }, [refreshTrigger]);

    const isInitialLoad = serviceUninitialized || (!!campusId && summaryLoading && !campusSummary);

    return (
        <View className="flex-1">
            <HomeTopBar
                firstName={user?.firstName}
                lastName={user?.lastName}
                pictureUrl={user?.pictureUrl}
                serviceName={latestService?.name}
                serviceTime={latestService?.serviceTime}
                unread={false}
            />

            {isInitialLoad ? (
                <HomeSkeleton />
            ) : (
                <ViewWrapper scroll noPadding refreshing={false} onRefresh={refreshAll} className="flex-1">
                    <HomeGreeting firstName={user?.firstName} campus={user?.campus?.campusName} isPastor={isCampusPastor} />
                    <View className="px-4 gap-5 pt-2 pb-4">
                        <ErrorBoundary>
                            <HomeClockCard
                                isInRange={isInRange}
                                deviceCoordinates={deviceCoordinates}
                                service={latestService}
                                latestAttendanceData={attendanceData}
                                latestAttendanceIsLoading={attendanceLoading}
                                verifyRangeBeforeAction={verifyRangeBeforeAction}
                                showClockInSomeone
                            />
                        </ErrorBoundary>

                        <CPKpiGrid
                            leadersAttendance={leadersAttendance?.attendance}
                            leaderUsers={leadersAttendance?.leaderUsers}
                            workersAttendance={workersAttendance?.attendance}
                            workerUsers={workersAttendance?.workerUsers}
                            pendingReports={pendingCount}
                            totalReports={deptReports.length}
                            tickets={tickets}
                            approvedCount={cpReviewedCount}
                            isLoading={summaryLoading}
                        />

                        <Separator />

                        {/* Department reports status */}
                        <View className="gap-3">
                            <View className="flex-row items-center justify-between">
                                <Text className="font-semibold">Department Reports</Text>
                                {deptReports.length > 0 && <TouchableOpacity
                                    activeOpacity={0.6}
                                    onPress={() =>
                                        router.push({
                                            pathname: '/reports/campus-report' as any,
                                            params: { serviceId, campusId, campusName: user?.campus?.campusName },
                                        })
                                    }
                                    className="flex-row items-center gap-2"
                                >
                                    <Text className="text-base text-primary font-medium">View full report</Text>
                                    <Ionicons name="open-outline" size={20} color={THEME_CONFIG.primary} />
                                </TouchableOpacity>}
                            </View>

                            {summaryLoading ? (
                                <View className="gap-2">
                                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)}
                                </View>
                            ) : deptReports.length === 0 ? (
                                <Text className="!text-sm text-muted-foreground text-center py-4">
                                    No reports for this service yet.
                                </Text>
                            ) : (
                                <FlatList
                                    data={deptReports}
                                    keyExtractor={(item, i) => `${item?.departmentName}-${i}`}
                                    renderItem={({ item }) => (
                                        <DeptReportRow item={item} campusId={campusId} serviceId={serviceId} />
                                    )}
                                    scrollEnabled={false}
                                />
                            )}
                        </View>
                    </View>
                </ViewWrapper>
            )}
        </View>
    );
};

export default React.memo(CPHome);
