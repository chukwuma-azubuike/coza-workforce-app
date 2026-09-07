import { Text } from '~/components/ui/text';
import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, TouchableOpacity, View } from 'react-native';
import { Href, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';

import ViewWrapper from '@components/layout/viewWrapper';
import If from '@components/composite/if-container';
import useRole from '@hooks/role';
import StaggerButtonComponent from '@components/composite/stagger';
import useModal from '@hooks/modal/useModal';
import CampusReport from './campus-report';
import { useGetDepartmentalReportQuery, useGetDepartmentReportsListQuery } from '@store/services/reports';
import { useGetLatestServiceQuery } from '@store/services/services';
import { FlatListSkeleton } from '@components/layout/skeleton';
import useScreenFocus from '@hooks/focus';
import ErrorBoundary from '@components/composite/error-boundary';
import ReportStatusPill from '@components/composite/report-status-pill';
import { getReportStatusMeta } from '@constants/report-status';
import { Card } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Skeleton } from '~/components/ui/skeleton';
import { ReportRouteIndex } from '../home/campus-pastors/report-summary';
import { IReportFormProps } from './forms/types';
import { IIncidentReportPayload, IReportStatus } from '@store/types';
import GlobalReportDetails from './gsp-report';
import { GlobalReportProvider } from './gsp-report/context';
import FilterChip from '../gh-approvals/approvals-filter-chip';
import { toLogicalRole } from '@constants/report-actions';

// Departments whose report data has nested arrays/objects that can't survive
// expo-router param serialization — they travel as a JSON `data` string instead.
const NESTED_PARAM_DEPTS = new Set([
    'Children Ministry',
    'Witty Inventions',
    'Traffic & Security',
    'Digital Surveillance Security',
    'COZA Transfer Service',
]);

// ─── History rows ───────────────────────────────────────────────────────────
export const DepartmentReportListRow: React.FC<
    Pick<IReportFormProps, 'updatedAt' | 'createdAt' | 'status'> & { departmentName?: string; logicalRole?: ReturnType<typeof toLogicalRole> }
> = React.memo(({ departmentName, logicalRole, ...props }) => {
        const handlePress = useCallback(() => {
            // departmentName is destructured above for the route lookup — re-attach it
            // so the destination form still receives it (used by resolveReportType()).
            const reportData = { ...props, departmentName };
            router.push({
                pathname: `/reports/${ReportRouteIndex[departmentName ?? '']}` as any,
                params: NESTED_PARAM_DEPTS.has(departmentName ?? '') ? { data: JSON.stringify(reportData) } : reportData,
            });
        }, [props, departmentName]);

        const meta = getReportStatusMeta(props?.status as string);

        return (
            <TouchableOpacity activeOpacity={0.6} onPress={handlePress} accessibilityRole="button">
                <Card className="p-0 overflow-hidden mb-2">
                    <View className="flex-row items-stretch">
                        <View className={`w-1 ${meta.accentClass}`} />
                        <View className="flex-1 flex-row items-center justify-between p-3.5">
                            <View className="gap-0.5">
                                <Text className="font-semibold text-foreground">Departmental report</Text>
                                <Text className="text-muted-foreground">
                                    {dayjs(props.updatedAt || props.createdAt).format('DD MMM, YYYY')}
                                </Text>
                            </View>
                            <ReportStatusPill status={props?.status as string} size="sm" role={logicalRole} />
                        </View>
                    </View>
                </Card>
            </TouchableOpacity>
        );
    });

const IncidentReportListRow: React.FC<Pick<IIncidentReportPayload, 'createdAt' | 'details'>> = React.memo(props => {
    const handlePress = () => {
        router.push({ pathname: '/reports/incident-report', params: props as any });
    };

    return (
        <TouchableOpacity activeOpacity={0.6} onPress={handlePress} accessibilityRole="button">
            <Card className="p-3.5 mb-2 flex-row items-center gap-3">
                <View className="w-9 h-9 rounded-full bg-rose-100 dark:bg-rose-900/20 items-center justify-center">
                    <Ionicons name="warning-outline" size={16} color="#f43f5e" />
                </View>
                <View className="flex-1">
                    <Text className="!text-sm font-semibold text-foreground">Incident</Text>
                    <Text className="!text-xs text-muted-foreground" numberOfLines={1}>
                        {props.details || '—'}
                    </Text>
                </View>
                <Text className="!text-[11px] text-muted-foreground">{dayjs(props.createdAt).format('DD MMM')}</Text>
            </Card>
        </TouchableOpacity>
    );
});

// ─── HOD/AHOD dashboard ─────────────────────────────────────────────────────
interface HodReportsProps {
    serviceName?: string;
    serviceTime?: string | number;
    departmentName?: string;
    currentStatus?: string;
    ghComment?: string | null;
    onOpenReport: () => void;
    departmentReports: any[];
    incidentReports: any[];
    isLoading?: boolean;
    onRefresh: () => void;
    logicalRole?: ReturnType<typeof toLogicalRole>;
}

const ctaForStatus = (status?: string): string => {
    if (!status) return 'Fill report';
    if (status === IReportStatus.GH_CHANGE_REQUESTED) return 'Resubmit changes';
    if (status === IReportStatus.DRAFT) return 'Continue report';
    return 'View report';
};

const HodReports: React.FC<HodReportsProps> = ({
    serviceName,
    serviceTime,
    departmentName,
    currentStatus,
    ghComment,
    onOpenReport,
    departmentReports,
    incidentReports,
    isLoading,
    onRefresh,
    logicalRole,
}) => {
    const needsChanges = currentStatus === IReportStatus.GH_CHANGE_REQUESTED;
    const [tab, setTab] = useState<'departmental' | 'incidents'>('departmental');

    return (
        <View className="flex-1">
            {/* Service header */}
            <View className="px-1 pt-2 pb-1">
                <Text className="!text-xl font-bold text-foreground">{serviceName || 'Latest service'}</Text>
                {serviceTime ? (
                    <Text className="!text-xs text-muted-foreground mt-0.5">
                        {dayjs(serviceTime).format('dddd, DD MMMM YYYY · h:mm A')}
                    </Text>
                ) : null}
            </View>

            {/* Current report card */}
            <Card className="p-4 gap-3 mt-2">
                {isLoading ? (
                    <View className="gap-3">
                        <Skeleton className="h-5 w-2/3 rounded" />
                        <Skeleton className="h-4 w-1/3 rounded" />
                        <Skeleton className="h-12 w-full rounded-xl" />
                    </View>
                ) : (
                    <>
                        <View className="flex-row items-start justify-between gap-2">
                            <View className="flex-1">
                                <Text className="!text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                                    This service
                                </Text>
                                <Text className="!text-base font-bold text-foreground mt-0.5">
                                    {departmentName || 'Department'} report
                                </Text>
                            </View>
                            {currentStatus ? <ReportStatusPill status={currentStatus} size="sm" role={logicalRole} /> : null}
                        </View>

                        {needsChanges && ghComment ? (
                            <View className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-3 gap-1">
                                <View className="flex-row items-center gap-1.5">
                                    <Ionicons name="create-outline" size={13} color="#d97706" />
                                    <Text className="!text-[11px] font-bold uppercase tracking-wide text-amber-700 dark:text-amber-400">
                                        Group Head requested changes
                                    </Text>
                                </View>
                                <Text className="!text-[13px] text-amber-800 dark:text-amber-300 leading-snug">
                                    "{ghComment}"
                                </Text>
                            </View>
                        ) : null}

                        <Button
                            className="h-12 rounded-xl"
                            variant={needsChanges || !currentStatus ? 'default' : 'outline'}
                            onPress={onOpenReport}
                            startIcon={
                                <Ionicons
                                    name={!currentStatus ? 'add' : needsChanges ? 'refresh' : 'open-outline'}
                                    size={16}
                                    color={needsChanges || !currentStatus ? 'white' : '#6d28d9'}
                                />
                            }
                        >
                            {ctaForStatus(currentStatus)}
                        </Button>
                    </>
                )}
            </Card>

            {/* History — segmented by type */}
            <View className="flex-row gap-2 mt-4 mb-1">
                <FilterChip active={tab === 'departmental'} onPress={() => setTab('departmental')}>
                    {`Departmental${departmentReports.length ? ` (${departmentReports.length})` : ''}`}
                </FilterChip>
                <FilterChip active={tab === 'incidents'} onPress={() => setTab('incidents')}>
                    {`Incidents${incidentReports.length ? ` (${incidentReports.length})` : ''}`}
                </FilterChip>
            </View>

            <FlatList
                className="flex-1 mt-2"
                data={tab === 'departmental' ? departmentReports : incidentReports}
                keyExtractor={(item, i) => item?._id ?? `${i}`}
                renderItem={({ item }) =>
                    tab === 'departmental' ? (
                        <DepartmentReportListRow {...item} departmentName={departmentName} logicalRole={logicalRole} />
                    ) : (
                        <IncidentReportListRow {...item} />
                    )
                }
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 140 }}
                removeClippedSubviews
                initialNumToRender={8}
                windowSize={7}
                refreshControl={<RefreshControl refreshing={!!isLoading} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    isLoading && tab === 'departmental' ? (
                        <View>
                            {[1, 2].map(i => (
                                <Skeleton key={i} className="h-16 w-full rounded-2xl mb-2" />
                            ))}
                        </View>
                    ) : (
                        <Text className="text-muted-foreground py-6 text-center">
                            {tab === 'departmental' ? 'No past reports yet.' : 'No incidents reported.'}
                        </Text>
                    )
                }
            />
        </View>
    );
};

const Reports: React.FC = () => {
    const {
        user,
        isCTS,
        isPCU,
        isUshery,
        isSecurity,
        isChildcare,
        isCampusPastor,
        isHOD,
        isAHOD,
        isPrograms,
        isGlobalPastor,
        isGroupHead,
        isWitty,
        isInternship,
        isPRU,
        isWelfare,
        isProtocol,
        isGSP,
    } = useRole();

    const logicalRole = toLogicalRole({ isHOD, isAHOD, isGroupHead, isCampusPastor, isGSP });

    const { data: latestServiceData, refetch } = useGetLatestServiceQuery(user?.campus._id as string, { skip: !user });

    const { data, isLoading: currentLoading } = useGetDepartmentalReportQuery(
        {
            departmentId: user?.department?._id as string,
            serviceId: latestServiceData?._id as string,
            campusId: user?.campus?._id as string,
        },
        {
            skip: !user?.department?._id,
        }
    );

    const {
        refetch: reportsRefetch,
        isLoading: reportsIsLoading,
        data: departmentAndIncidentReport,
    } = useGetDepartmentReportsListQuery(user?.department?._id);

    useScreenFocus({
        onFocus: () => {
            refetch();
            reportsRefetch();
        },
    });

    const { setModalState } = useModal();

    const currentReport = data?.departmentalReport?.report as any;

    const goToReportRoute = (): Href | undefined => {
        if (isCTS) return '/reports/transfer-report';
        if (isPCU) return '/reports/guest-report';
        if (isUshery) return '/reports/attendance-report';
        if (isSecurity) return '/reports/security-report';
        if (isPrograms) return '/reports/service-report';
        if (isChildcare) return '/reports/childcare-report';
        if (isWitty) return '/reports/witty-report';
        if (isInternship) return '/reports/internship-report';
        if (isPRU) return '/reports/pru-report';
        if (isWelfare) return '/reports/welfare-report';
        if (isProtocol) return '/reports/protocol-report';
        return undefined;
    };

    const goToIncidentReport = useCallback(() => {
        router.push({
            pathname: '/reports/incident-report',
            params: {
                departmentId: user?.department._id,
                serviceId: latestServiceData?._id,
                campusId: user?.campus._id,
                userId: user?.userId,
            },
        });
    }, [user, latestServiceData?._id]);

    const goToDepartmentReport = useCallback(() => {
        const route = goToReportRoute();
        if (!route) {
            setModalState({
                status: 'info',
                defaultRender: true,
                message: 'No reports available for submission.',
            });
            return;
        }
        const report = {
            ...(currentReport ?? {}),
            _id: currentReport?._id,
            departmentId: user?.department?._id,
            serviceId: latestServiceData?._id,
            campusId: user?.campus?._id,
            userId: user?.userId,
        };
        // Mirror the list-row navigation: Children Ministry carries its nested age
        // bands as a JSON string (expo-router params can't hold nested objects).
        router.push({
            pathname: route as any,
            params: NESTED_PARAM_DEPTS.has(user?.department?.departmentName ?? '')
                ? ({ data: JSON.stringify(report) } as any)
                : (report as any),
        });
    }, [currentReport, user, latestServiceData?._id]);

    return (
        <ErrorBoundary>
            <View className="flex-1">
                <ViewWrapper className="flex-1">
                    <If condition={!user}>
                        <FlatListSkeleton count={9} />
                    </If>
                    <If condition={isCampusPastor}>
                        <CampusReport campusId={user?.campus?._id} serviceId={latestServiceData?._id} />
                    </If>
                    <If condition={isHOD || isAHOD}>
                        <HodReports
                            serviceName={latestServiceData?.name}
                            serviceTime={latestServiceData?.serviceTime}
                            departmentName={user?.department?.departmentName}
                            currentStatus={currentReport?.status}
                            ghComment={currentReport?.ghComment}
                            onOpenReport={goToDepartmentReport}
                            departmentReports={departmentAndIncidentReport?.departmentalReport || []}
                            incidentReports={departmentAndIncidentReport?.incidentReport || []}
                            isLoading={currentLoading || reportsIsLoading}
                            onRefresh={reportsRefetch}
                            logicalRole={logicalRole}
                        />
                    </If>
                    <If condition={isGlobalPastor}>
                        <GlobalReportProvider>
                            <GlobalReportDetails />
                        </GlobalReportProvider>
                    </If>
                </ViewWrapper>
                <If condition={!isGlobalPastor && !isCampusPastor}>
                    <StaggerButtonComponent
                        className="!bottom-32"
                        buttons={[
                            {
                                iconName: 'warning',
                                color: 'bg-rose-400',
                                iconType: 'antdesign',
                                handleClick: goToIncidentReport,
                            },
                            {
                                iconName: 'graph',
                                iconType: 'octicon',
                                color: 'bg-green-400',
                                handleClick: goToDepartmentReport,
                            },
                        ]}
                    />
                </If>
            </View>
        </ErrorBoundary>
    );
};

export default React.memo(Reports);
