import React from 'react';
import { Icon } from '@rneui/base';
import { Divider, Flex, HStack, Text, VStack } from 'native-base';
import { THEME_CONFIG } from '@config/appConfig';
import FlatListComponent, { IFlatListColumn } from '@components/composite/flat-list';
import { ICampusReportSummary, useGetCampusReportSummaryQuery } from '@store/services/reports';
import StatusTag from '@components/atoms/status-tag';
import { useNavigation } from '@react-navigation/native';
import { Platform, TouchableOpacity } from 'react-native';
import useAppColorMode from '@hooks/theme/colorMode';
import Utils from '@utils';
import useScreenFocus from '@hooks/focus';
import useRole from '@hooks/role';
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
    'Programme Coordination': ReportSummaryMap.Programme,
};

const ReportSummaryListRow: React.FC<ReportSummaryListRowProps> = props => {
    const navigation = useNavigation();
    const { isLightMode } = useAppColorMode();

    const { user } = useRole();

    return (
        <>
            {props[1]?.map((elm, index) => {
                const handlePress = () => {
                    navigation.navigate(ReportRouteIndex[elm?.departmentName] as never, elm.report as never);
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
                        <HStack
                            p={2}
                            px={4}
                            my={1.5}
                            w="full"
                            borderRadius={10}
                            alignItems="center"
                            _dark={{ bg: 'gray.900' }}
                            _light={{ bg: 'gray.50' }}
                            justifyContent="space-between"
                        >
                            <Text _dark={{ color: 'gray.400' }} _light={{ color: 'gray.500' }}>
                                {`${elm?.departmentName} Report`}
                            </Text>
                            <StatusTag>{elm?.report.status as any}</StatusTag>
                        </HStack>
                    </TouchableOpacity>
                );
            })}
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

        const { navigate } = useNavigation();

        const navigateToReports = () => navigate('Reports' as never);

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
            <>
                <VStack mt={4} px={4} overflow="scroll">
                    <HStack alignItems="baseline" justifyContent="space-between">
                        <TouchableOpacity activeOpacity={0.6} onPress={navigateToReports}>
                            <HStack alignItems="center" space={1}>
                                <Icon color={THEME_CONFIG.primary} name="people-outline" type="ionicon" size={18} />
                                <Text color="gray.400" fontSize="md" ml={2}>
                                    Reports submitted
                                </Text>
                                <Icon color={THEME_CONFIG.primary} name="external-link" type="evilicon" size={26} />
                            </HStack>
                        </TouchableOpacity>
                        <Flex alignItems="baseline" flexDirection="row">
                            <Text fontWeight="semibold" color="primary.600" fontSize="4xl" ml={1}>
                                {submittedReportCount || 0}
                            </Text>
                            <Text fontWeight="semibold" color="gray.600" fontSize="md">{`/${
                                sortedData?.length || 0
                            }`}</Text>
                        </Flex>
                    </HStack>
                    <Divider />
                </VStack>
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

export { CampusReportSummary };
