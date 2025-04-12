import { Text } from "~/components/ui/text";
import StatusTag from '@components/atoms/status-tag';
import FlatListComponent, { IFlatListColumn } from '@components/composite/flat-list';
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
import React from 'react';
import { Platform, TouchableOpacity, View } from 'react-native';
import { Separator } from '~/components/ui/separator';
const isAndroid = Platform.OS === 'android';

interface ReportSummaryListRowProps {
    '0'?: string;
    '1'?: ICampusReportSummary['departmentalReport'];
}

enum ReportSummaryMap {
    PCU = 'Guest Report',
    CTS = 'Transfer Report',
    Ushery = 'Attendance Report',
    Security = 'Security Report',
    Programme = 'Service Report',
    Childcare = 'Childcare Report',
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

const ReportSummaryListRow: React.FC<ReportSummaryListRowProps> = props => {
    const { isLightMode } = useAppColorMode();

    const { isGroupHead } = useRole();

    return (
        <>
            {props[1]?.map((elm, index) => {
                const handlePress = () => {
                    router.push({ pathname: ReportRouteIndex[elm?.departmentName] as any, params: elm.report });
                };

                return (
                    <TouchableOpacity
                        key={index}
                        disabled={false}
                        delayPressIn={0}
                        activeOpacity={0.6}
                        onPress={handlePress}
                        accessibilityRole="button"
                    >
                        <View className="p-2 px-4 my-1 w-full rounded-md items-center bg-muted-background justify-between">
                            <Text className="text-muted-foreground">{`${elm?.departmentName} Report`}</Text>
                            <StatusTag>{elm?.report.status as any}</StatusTag>
                        </View>
                    </TouchableOpacity>
                );
            })}
        </>
    );
};

const GHReportSummaryListRow: React.FC<ReportSummaryListRowProps> = props => {
    const navigation = useNavigation();
    const { isLightMode } = useAppColorMode();

    const { isGroupHead } = useRole();

    const groupedData = props[1]?.reduce((acc: Record<string, (typeof props)[1]>, item) => {
        const campusName = item.campus;
        if (!acc[campusName]) {
            acc[campusName] = [];
        }
        acc[campusName].push(item);
        return acc;
    }, {});

    return (
        <>
            {groupedData &&
                Object.entries(groupedData).map(([campusName, reports]) => (
                    <>
                        <Text className="text-muted-foreground">{campusName}</Text>

                        {reports?.map((reportItem, index) => {
                            const handlePress = () => {
                                router.push({
                                    pathname: ReportRouteIndex[reportItem?.departmentName] as any,
                                    params: reportItem.report,
                                });
                            };
                            return (
                                <TouchableOpacity
                                    key={index}
                                    disabled={false}
                                    delayPressIn={0}
                                    activeOpacity={0.6}
                                    onPress={handlePress}
                                    accessibilityRole="button"
                                >
                                    <View className="p-2 px-4 my-1 w-full rounded-md items-center bg-muted-background justify-between">
                                        <Text className="text-muted-foreground">
                                            {`${reportItem?.departmentName} Report`}
                                        </Text>
                                        <StatusTag>{reportItem?.report.status as any}</StatusTag>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </>
                ))}
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

        const navigateToReports = () => router.push('/reports');

        const reportColumns: IFlatListColumn[] = [
            {
                dataIndex: 'createdAt',
                render: (_: ICampusReportSummary['departmentalReport'][0], key) => (
                    <ReportSummaryListRow {..._} key={key} />
                ),
            },
        ];

        const sortedData = React.useMemo(
            () => Utils.sortByDate(data ? data.departmentalReport : [], 'createdAt'),
            [data]
        );

        const groupedData = React.useMemo(() => Utils.groupListByKey(sortedData, 'createdAt'), [sortedData]);

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
                    columns={reportColumns}
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

        const reportColumns: IFlatListColumn[] = [
            {
                dataIndex: 'createdAt',
                render: (_: ICampusReportSummary['departmentalReport'][0], key) => (
                    <GHReportSummaryListRow {..._} key={key} />
                ),
            },
        ];

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
                    columns={reportColumns}
                    onRefresh={handleRefresh}
                    isLoading={isLoading || isFetching}
                    refreshing={isLoading || isFetching}
                />
            </>
        );
    }
);

export { CampusReportSummary, GroupHeadReportSummary };
