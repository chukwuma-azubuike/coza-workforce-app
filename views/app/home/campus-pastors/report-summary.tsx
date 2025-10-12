import React, { useCallback } from 'react';
import { Text } from '~/components/ui/text';
import StatusTag from '@components/atoms/status-tag';
import FlatListComponent from '@components/composite/flat-list';
import { THEME_CONFIG } from '@config/appConfig';
import { Ionicons } from '@expo/vector-icons';
import useScreenFocus from '@hooks/focus';
import useRole from '@hooks/role';
import useAppColorMode from '@hooks/theme/colorMode';
import { useNavigation } from '@react-navigation/native';

import { Icon } from '@rneui/themed';
import { useGetGhReportByIdQuery } from '@store/services/grouphead';
import { ICampusReportSummary, useGetCampusReportSummaryQuery } from '@store/services/reports';
import Utils from '@utils/index';
import { router } from 'expo-router';
import { Platform, TouchableOpacity, View } from 'react-native';
import { Separator } from '~/components/ui/separator';

const isAndroid = Platform.OS === 'android';

type ReportSummaryListRowProps = ICampusReportSummary['departmentalReport'][0];

enum ReportSummaryMap {
    PCU = 'guest-report',
    CTS = 'transfer-report',
    Ushery = 'attendance-report',
    Security = 'security-report',
    Programme = 'service-report',
    Childcare = 'childcare-report',
}

interface ReportSummaryMapIndex {
    [key: string]: ReportSummaryMap;
}

export const ReportRouteIndex: ReportSummaryMapIndex = {
    PCU: ReportSummaryMap.PCU,
    'Ushery Board': ReportSummaryMap.Ushery,
    'COZA Transfer Service': ReportSummaryMap.CTS,
    'Children Ministry': ReportSummaryMap.Childcare,
    'Traffic & Security': ReportSummaryMap.Security,
    'Digital Surveillance Security': ReportSummaryMap.Security,
    'Programme Coordination': ReportSummaryMap.Programme,
};

const ReportSummaryListRow: React.FC<ReportSummaryListRowProps> = elm => {
    const { isLightMode } = useAppColorMode();
    const { isGroupHead } = useRole();

    const handlePress = useCallback(
        (elm: any) => () => {
            router.push({
                pathname: `/reports/${ReportRouteIndex[elm?.departmentName]}` as any,
                params:
                    elm?.departmentName === 'Children Ministry'
                        ? ({ data: JSON.stringify(elm.report) } as any)
                        : elm.report,
            });
        },
        [ReportRouteIndex, elm?.departmentName, elm.report]
    );

    return (
        <TouchableOpacity
            disabled={false}
            delayPressIn={0}
            activeOpacity={0.6}
            onPress={handlePress(elm)}
            accessibilityRole="button"
        >
            <View className="p-2 px-4 my-1 py-3 w-full flex-row rounded-2xl items-center bg-muted-background justify-between">
                <Text className="text-lg text-muted-foreground">{`${elm?.departmentName} Report`}</Text>
                <StatusTag>{elm?.report.status as any}</StatusTag>
            </View>
        </TouchableOpacity>
    );
};

const GHReportSummaryListRow: React.FC<ReportSummaryListRowProps> = reportItem => {
    const handlePress = useCallback(
        (reportItem: any) => () => {
            router.push({
                pathname: `/reports/${ReportRouteIndex[reportItem?.departmentName]}` as any,
                params: reportItem.report as any,
            });
        },
        [ReportRouteIndex]
    );

    return (
        <>
            <Text className="text-muted-foreground">{reportItem?.campus ?? ''}</Text>(
            <TouchableOpacity
                disabled={false}
                delayPressIn={0}
                activeOpacity={0.6}
                accessibilityRole="button"
                onPress={handlePress(reportItem)}
            >
                <View className="p-2 px-4 my-1 w-full rounded-md items-center bg-muted-background justify-between">
                    <Text className="text-muted-foreground">{`${reportItem?.departmentName} Report`}</Text>
                    <StatusTag>{reportItem?.report.status as any}</StatusTag>
                </View>
            </TouchableOpacity>
            );
        </>
    );
};
interface ICampusReportSummaryProps {
    campusId: string;
    serviceId: string;
    refetchService: () => void;
}

const CampusReportSummary: React.FC<ICampusReportSummaryProps> = React.memo(
    ({ serviceId, campusId, refetchService }) => {
        const { data, refetch, isLoading, isFetching, isUninitialized } = useGetCampusReportSummaryQuery(
            { serviceId: serviceId as string, campusId: campusId as string },
            {
                skip: !serviceId,
            }
        );

        const handleRefresh = () => {
            if (serviceId) {
                refetch();
            }
            refetchService();
        };

        const { user } = useRole();

        const navigateToReports = () =>
            router.push({
                pathname: '/reports/campus-report',
                params: { serviceId, campusId, campusName: user?.campusName },
            });

        const renderReportSummaryItem = React.useCallback(
            ({ item }: { item: ICampusReportSummary['departmentalReport'][0]; index: number }) => (
                <ReportSummaryListRow {...(item as any)} />
            ),
            []
        );

        const submittedReportCount = React.useMemo(
            () => data?.departmentalReport.filter(dept => dept?.report?.status !== 'PENDING').length,
            [data]
        );

        useScreenFocus({ onFocus: !isUninitialized ? refetch : undefined });

        return (
            <View className="flex-1">
                <View className="mt-4 px-4">
                    <View className="items-baseline justify-between flex-row">
                        <TouchableOpacity activeOpacity={0.6} onPress={navigateToReports}>
                            <View className="items-center gap-1 flex-row">
                                <Icon color={THEME_CONFIG.primary} name="people-outline" type="ionicon" size={18} />
                                <Text className="text-muted-foreground ml-2">Reports submitted</Text>
                                <Icon color={THEME_CONFIG.primary} name="external-link" type="evilicon" size={26} />
                            </View>
                        </TouchableOpacity>
                        <View className="items-baseline flex-row">
                            <Text className="font-semibold text-primary text-5xl ml-1">
                                {submittedReportCount || 0}
                            </Text>
                            <Text className="font-semibold text-muted-foreground">{`/${
                                data?.departmentalReport?.length || 0
                            }`}</Text>
                        </View>
                    </View>
                    <Separator />
                </View>
                <FlatListComponent
                    padding={isAndroid ? 3 : true}
                    emptySize={160}
                    showHeader={false}
                    data={data?.departmentalReport ?? []}
                    renderItemComponent={renderReportSummaryItem}
                    onRefresh={handleRefresh}
                    isLoading={isLoading || isFetching}
                    refreshing={isLoading || isFetching}
                />
            </View>
        );
    }
);

const GroupHeadReportSummary: React.FC<Partial<ICampusReportSummaryProps>> = React.memo(
    ({ serviceId, refetchService }) => {
        const { data, refetch, isLoading, isFetching, isUninitialized } = useGetGhReportByIdQuery(
            { serviceId: serviceId as string },
            {
                skip: !serviceId,
            }
        );

        const handleRefresh = () => {
            if (serviceId) {
                refetch();
            }
            if (refetchService) refetchService();
        };

        const submitData = {
            serviceId,
            ...data,
        };

        const { navigate } = useNavigation();

        const navigateToReportSummary = () =>
            router.push({ pathname: 'Submit report summary' as never, params: submitData as never });

        const navigateToReports = () => navigate('Reports' as never);

        const renderGHReportSummaryItem = React.useCallback(
            ({ item }: { item: ICampusReportSummary['departmentalReport'][0]; index: number }) => (
                <GHReportSummaryListRow {...(item as any)} />
            ),
            []
        );

        const sortedData = React.useMemo(
            () => Utils.sortByDate(data ? data?.departmentalReport : [], 'createdAt'),
            [data]
        );

        const groupedData = React.useMemo(() => Utils.groupListByKey(sortedData, 'campus'), [sortedData]);

        const submittedReportCount = React.useMemo(
            () => data?.departmentalReport?.filter(dept => dept?.report?.status !== 'PENDING').length,
            [data]
        );

        useScreenFocus({ onFocus: !isUninitialized ? refetch : undefined });

        return (
            <>
                {!isLoading && !isFetching && (
                    <View className="flex-1 justify-center mt-6 items-center">
                        <TouchableOpacity activeOpacity={0.6} onPress={navigateToReportSummary}>
                            <View className="items-center gap-1">
                                <Text className="text-muted-foreground ml-2">
                                    {data?.submittedReport ? 'View report summary' : 'Submit report summary'}
                                </Text>
                                <Ionicons color={THEME_CONFIG.primary} name="link-outline" type="evilicon" size={26} />
                            </View>
                        </TouchableOpacity>
                    </View>
                )}

                <View className="mt-4 px-4">
                    <View className="items-baseline justify-between">
                        <TouchableOpacity activeOpacity={0.6} onPress={navigateToReports}>
                            <View className="items-center gap-1 flex-row">
                                <Ionicons color={THEME_CONFIG.primary} name="people-outline" type="ionicon" size={18} />
                                <Text className="text-muted-foreground ml-2">Reports submitted</Text>
                                <Ionicons color={THEME_CONFIG.primary} name="link-outline" type="evilicon" size={26} />
                            </View>
                        </TouchableOpacity>
                        <View className="flex-row items-baseline">
                            <Text className="font-semibold text-primary text-4xl ml-1">
                                {submittedReportCount || 0}
                            </Text>
                            <Text className="font-semibold text-muted-foreground">{`/${sortedData?.length || 0}`}</Text>
                        </View>
                    </View>
                    <Separator />
                </View>
                <FlatListComponent
                    padding={isAndroid ? 3 : true}
                    emptySize={160}
                    data={groupedData}
                    showHeader={false}
                    renderItemComponent={renderGHReportSummaryItem}
                    onRefresh={handleRefresh}
                    isLoading={isLoading || isFetching}
                    refreshing={isLoading || isFetching}
                />
            </>
        );
    }
);

export { CampusReportSummary, GroupHeadReportSummary };
