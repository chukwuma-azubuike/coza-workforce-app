import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Text } from '~/components/ui/text';
import { Separator } from '~/components/ui/separator';
import ViewWrapper from '~/components/layout/viewWrapper';
import ErrorBoundary from '@components/composite/error-boundary';
import { useGetGspCampusDepartmentsQuery } from '@store/services/gsp-dashboard';
import { THEME_CONFIG } from '@config/appConfig';
import { SectionCard, SectionEmpty, SectionError, SectionSkeleton } from '../components/states';
import SegmentedBar from '../components/segmented-bar';
import RatePill from '../components/rate-pill';
import { formatCompactNumber, formatPercent } from '../lib';
import { gspRoutes } from '../routes';

const WorkforceDepartments: React.FC = () => {
    const { campusId, campusName, startDate, endDate } = useLocalSearchParams<{
        campusId: string;
        campusName?: string;
        startDate?: string;
        endDate?: string;
    }>();

    const win = {
        startDate: startDate ? Number(startDate) : undefined,
        endDate: endDate ? Number(endDate) : undefined,
    };

    const { data, isLoading, isError, refetch } = useGetGspCampusDepartmentsQuery(
        { campusId: campusId as string, ...win },
        { skip: !campusId }
    );

    const campus = data?.campus;
    const departments = data?.departments ?? [];

    const attendanceSegments = campus?.attendance
        ? [
              { label: 'Present', value: campus.attendance.present ?? 0, color: THEME_CONFIG.success },
              { label: 'Late', value: campus.attendance.late ?? 0, color: THEME_CONFIG.warning },
              { label: 'Absent', value: campus.attendance.absent ?? 0, color: THEME_CONFIG.error },
          ]
        : [];

    return (
        <ViewWrapper scroll noPadding refreshing={false} onRefresh={refetch} className="flex-1">
            <View className="px-4 gap-6 pt-4 pb-10">
                {/* Header */}
                <View className="gap-0.5">
                    <Text className="!text-[13px] font-semibold uppercase tracking-widest text-muted-foreground">
                        Campus
                    </Text>
                    <Text className="text-2xl font-bold text-foreground">
                        {campus?.campusName ?? campusName ?? 'Departments'}
                    </Text>
                </View>

                {isLoading ? (
                    <SectionSkeleton rows={8} />
                ) : isError ? (
                    <SectionCard>
                        <SectionError onRetry={refetch} />
                    </SectionCard>
                ) : !departments.length ? (
                    <SectionCard>
                        <SectionEmpty message="No department data for this period." />
                    </SectionCard>
                ) : (
                    <ErrorBoundary>
                        {/* Campus-level rollup */}
                        {campus?.attendance && (
                            <SectionCard className="gap-4">
                                <Text className="text-md font-bold text-foreground">Campus attendance</Text>
                                <SegmentedBar
                                    segments={attendanceSegments}
                                    headline={formatPercent(campus.attendance.rate, 1)}
                                    headlineCaption={`${formatCompactNumber((campus.attendance.present ?? 0) + (campus.attendance.late ?? 0))} of ${formatCompactNumber(campus.attendance.expected ?? 0)} expected`}
                                    footnote={
                                        campus.attendance.permitted
                                            ? `${formatCompactNumber(campus.attendance.permitted)} on approved permission`
                                            : undefined
                                    }
                                />
                            </SectionCard>
                        )}

                        {/* Departments — worst rate first */}
                        <View className="gap-0.5">
                            <Text className="!text-[13px] font-semibold uppercase tracking-widest text-muted-foreground">
                                Departments
                            </Text>
                            <Text className="text-md text-muted-foreground">Sorted by attendance rate (lowest first)</Text>
                        </View>
                        <SectionCard className="gap-0">
                            {departments.map((dept, i) => {
                                const isLast = i === departments.length - 1;
                                return (
                                    <React.Fragment key={dept.departmentId}>
                                        <TouchableOpacity
                                            activeOpacity={0.7}
                                            onPress={() =>
                                                gspRoutes.workforceWorkers(dept.departmentId, win, dept.departmentName)
                                            }
                                            className="py-4 gap-3"
                                        >
                                            {/* Name + rate pill */}
                                            <View className="flex-row items-center justify-between gap-3">
                                                <Text
                                                    numberOfLines={1}
                                                    className="text-md font-semibold text-foreground flex-1"
                                                >
                                                    {dept.departmentName}
                                                </Text>
                                                <RatePill rate={dept?.attendance?.rate} />
                                            </View>

                                            {/* Mini bar */}
                                            <View className="flex-row h-2 rounded-full overflow-hidden bg-secondary">
                                                {[
                                                    { v: dept?.attendance?.present, c: THEME_CONFIG.success },
                                                    { v: dept?.attendance?.late, c: THEME_CONFIG.warning },
                                                    { v: dept?.attendance?.absent, c: THEME_CONFIG.error },
                                                ].map(({ v, c }, si) => (
                                                    <View
                                                        key={si}
                                                        style={{
                                                            flex: Math.max(0.0001, v),
                                                            backgroundColor: c,
                                                        }}
                                                    />
                                                ))}
                                            </View>

                                            {/* Stats row */}
                                            <View className="flex-row items-center gap-4">
                                                <Text className="!text-[12px] text-muted-foreground">
                                                    <Text className="font-semibold text-foreground">
                                                        {formatCompactNumber((dept?.attendance?.present ?? 0) + (dept?.attendance?.late ?? 0))}
                                                    </Text>
                                                    {' / '}
                                                    {formatCompactNumber(dept?.attendance?.expected ?? 0)} attended
                                                </Text>
                                                {(dept?.permissionsPending ?? 0) > 0 && (
                                                    <View className="flex-row items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40">
                                                        <Text className="!text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                                                            {dept.permissionsPending} pending
                                                        </Text>
                                                    </View>
                                                )}
                                                {(dept?.openTickets ?? 0) > 0 && (
                                                    <View className="flex-row items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/40">
                                                        <Text className="!text-[11px] font-semibold text-red-700 dark:text-red-400">
                                                            {dept.openTickets} tickets
                                                        </Text>
                                                    </View>
                                                )}
                                            </View>
                                        </TouchableOpacity>
                                        {!isLast && <Separator />}
                                    </React.Fragment>
                                );
                            })}
                        </SectionCard>
                    </ErrorBoundary>
                )}
            </View>
        </ViewWrapper>
    );
};

export default WorkforceDepartments;
