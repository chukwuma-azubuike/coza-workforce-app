import React from 'react';
import dayjs from 'dayjs';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import { ClipboardList, Download } from 'lucide-react-native';

import useRole from '@hooks/role';
import { useAppDispatch } from '@store/hooks';
import { useGetCampusesQuery } from '@store/services/campus';
import { gspDashboardServiceSlice } from '@store/services/gsp-dashboard';
import ViewWrapper from '~/components/layout/viewWrapper';
import ErrorBoundary from '@components/composite/error-boundary';
import { Text } from '~/components/ui/text';
import HomeTopBar from '../../components/top-bar';
import { Separator } from '~/components/ui/separator';
import { THEME_CONFIG } from '@config/appConfig';
import { IService } from '@store/types';
import Utils from '@utils/index';

import useGspFilters from './use-gsp-filters';
import { gspRoutes } from './routes';
import { exportGspDashboard } from './export';
import FilterBar from './components/filter-bar';
import OverviewSection from './sections/overview-section';
import AttendanceSection from './sections/attendance-section';
import WorkforceSection from './sections/workforce-section';
import GuestsSection from './sections/guests-section';
import ServicesSection from './sections/services-section';
import CompletenessSection from './sections/completeness-section';
import { useGetLatestServiceQuery, useGetServicesQuery } from '~/store/services/services';

/**
 * GSP Global Dashboard — the bird's-eye view across every campus.
 *
 * Reads the same rhythm top-to-bottom: global KPI cards (with the completeness
 * trust banner) → attendance → workforce → guests → services → completeness.
 * Every section shares one filter bar (window + campus) and refetches together.
 */
const GSPDashboard: React.FC = () => {
    const { user } = useRole();
    const dispatch = useAppDispatch();
    const filters = useGspFilters();

    // The filter bar reacts to `filters` instantly (so a pill highlights on tap),
    // while the heavy section subtree consumes a deferred copy — React renders it at
    // lower priority and can interrupt it, keeping the tap/scroll responsive.
    const deferredFilters = React.useDeferredValue(filters);
    const isStale = filters !== deferredFilters;

    const { data: campuses, isLoading: campusesLoading } = useGetCampusesQuery();
    const { data: services, isLoading: servicesLoading } = useGetServicesQuery({ limit: 100, page: 1 });

    // Services within the active window, latest first — the service picker's options.
    const windowServices = React.useMemo<IService[]>(() => {
        const within = (services ?? []).filter(s => {
            const t = dayjs(s.serviceTime ?? s.clockInStartTime).unix();
            return t >= filters.window.start && t <= filters.window.end;
        });
        return Utils.sortByDate(within, 'serviceTime') as IService[];
    }, [services, filters.window.start, filters.window.end]);

    // If the persisted service no longer falls within the chosen window, drop back to All.
    React.useEffect(() => {
        if (!servicesLoading && filters.serviceId && !windowServices.some(s => s._id === filters.serviceId)) {
            filters.setService(undefined);
        }
    }, [servicesLoading, filters.serviceId, windowServices, filters.setService]);

    const [refreshing, setRefreshing] = React.useState(false);
    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        dispatch(gspDashboardServiceSlice.util.invalidateTags(['GspDashboard']));
        // The invalidation kicks off refetches; clear the spinner shortly after.
        setTimeout(() => setRefreshing(false), 800);
    }, [dispatch]);

    const openCompleteness = React.useCallback(() => gspRoutes.completeness(filters.win), [filters.win]);

    const [exporting, setExporting] = React.useState(false);
    const onExport = React.useCallback(async () => {
        setExporting(true);
        await exportGspDashboard({ ...filters.win, fileName: `GSP-Dashboard-${filters.window.label}` });
        setExporting(false);
    }, [filters.win, filters.window.label]);

    const campusId = user?.campus?._id;

    const {
        data: latestService,
    } = useGetLatestServiceQuery(campusId as string, { skip: !campusId });


    return (
        <View className="flex-1">
            <HomeTopBar
                firstName={user?.firstName}
                lastName={user?.lastName}
                pictureUrl={user?.pictureUrl}
                serviceName={latestService?.name}
                serviceTime={latestService?.serviceTime}
            />
            <View className="px-4 pt-2 pb-3 flex-row items-center justify-between gap-3">
                <View className="flex-1 gap-0.5">
                    <Text className="!text-[13px] font-semibold uppercase tracking-widest text-muted-foreground">
                        Global Overview
                    </Text>
                    <Text className="text-2xl font-bold text-foreground">
                        {user?.firstName ? `Welcome, ${user.firstName}` : 'Global Dashboard'}
                    </Text>
                </View>
                <View className="flex-row items-center gap-2">
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => gspRoutes.approvals()}
                        accessibilityLabel="Open approvals inbox"
                        className="w-11 h-11 rounded-full bg-muted-background items-center justify-center"
                    >
                        <ClipboardList size={20} color={THEME_CONFIG.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={onExport}
                        disabled={exporting}
                        accessibilityLabel="Export dashboard to spreadsheet"
                        className="w-11 h-11 rounded-full bg-muted-background items-center justify-center"
                    >
                        {exporting ? (
                            <ActivityIndicator size="small" color={THEME_CONFIG.primary} />
                        ) : (
                            <Download size={20} color={THEME_CONFIG.primary} />
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            <View className="pb-3">
                <FilterBar
                    filters={filters}
                    campuses={campuses}
                    campusesLoading={campusesLoading}
                    services={windowServices}
                    servicesLoading={servicesLoading}
                />
            </View>
            <Separator />

            <ViewWrapper scroll noPadding refreshing={refreshing} onRefresh={onRefresh} className="flex-1">
                <View className="px-4 gap-6 pt-4 pb-10" style={{ opacity: isStale ? 0.6 : 1 }}>
                    <ErrorBoundary>
                        <OverviewSection filters={deferredFilters} />
                    </ErrorBoundary>
                    <ErrorBoundary>
                        <AttendanceSection filters={deferredFilters} onCheckCompleteness={openCompleteness} />
                    </ErrorBoundary>
                    <ErrorBoundary>
                        <WorkforceSection filters={deferredFilters} onCheckCompleteness={openCompleteness} />
                    </ErrorBoundary>
                    <ErrorBoundary>
                        <GuestsSection filters={deferredFilters} onCheckCompleteness={openCompleteness} />
                    </ErrorBoundary>
                    <ErrorBoundary>
                        <ServicesSection filters={deferredFilters} onCheckCompleteness={openCompleteness} />
                    </ErrorBoundary>
                    <ErrorBoundary>
                        <CompletenessSection filters={deferredFilters} />
                    </ErrorBoundary>

                    {/* Drill-down to the legacy single-service report view */}
                    {/* <Card className="p-0">
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => gspRoutes.serviceReport()}
                            className="flex-row items-center gap-3 p-4"
                        >
                            <View className="w-9 h-9 rounded-xl bg-secondary items-center justify-center">
                                <FileSpreadsheet size={18} color={THEME_CONFIG.primary} />
                            </View>
                            <View className="flex-1">
                                <Text className="text-sm font-semibold text-foreground">Single service report</Text>
                                <Text className="text-sm line-clamp-none text-muted-foreground">
                                    Detailed per-service workforce & attendance summary
                                </Text>
                            </View>
                            <ChevronRight size={18} color={THEME_CONFIG.lightGray} />
                        </TouchableOpacity>
                    </Card> */}
                </View>
            </ViewWrapper>
        </View>
    );
};

export default React.memo(GSPDashboard);
