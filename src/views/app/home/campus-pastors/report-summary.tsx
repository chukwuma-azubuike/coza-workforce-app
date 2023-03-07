import React from 'react';
import { Icon } from '@rneui/base';
import { Divider, Flex, HStack, Text, VStack } from 'native-base';
import { THEME_CONFIG } from '../../../../config/appConfig';
import FlatListComponent, { IFlatListColumn } from '../../../../components/composite/flat-list';
import { ICampusReportSummary, useGetCampusReportSummaryQuery } from '../../../../store/services/reports';
import StatusTag from '../../../../components/atoms/status-tag';
import ButtonComponent from '../../../../components/atoms/button';
import { useNavigation } from '@react-navigation/native';
import { TouchableNativeFeedback } from 'react-native';
import useAppColorMode from '../../../../hooks/theme/colorMode';
import Utils from '../../../../utils';
import useScreenFocus from '../../../../hooks/focus';
import useRole from '../../../../hooks/role';

interface ReportSummaryListRowProps {
    '0'?: string;
    '1'?: ICampusReportSummary['departmentalReport'];
}

enum ReportSummaryMap {
    Childcare = 'Childcare Report',
    Ushery = 'Attendance Report',
    PCU = 'Guest Report',
    Security = 'Security Report',
    CTS = 'Transfer Report',
    PRU = 'Service Report',
}

interface ReportSummaryMapIndex {
    [key: string]: ReportSummaryMap;
}

const ReportRouteIndex: ReportSummaryMapIndex = {
    PCU: ReportSummaryMap.PCU,
    'Ushery Board': ReportSummaryMap.Ushery,
    'COZA Transfer Service': ReportSummaryMap.CTS,
    'Children Ministry': ReportSummaryMap.Childcare,
    'Public Relations Unit (PRU)': ReportSummaryMap.PRU,
    'Digital Surveillance Security': ReportSummaryMap.Security,
};

const ReportSummaryListRow: React.FC<ReportSummaryListRowProps> = props => {
    const navigation = useNavigation();
    const { isLightMode } = useAppColorMode();

    const { user } = useRole();

    return (
        <>
            {props[1]?.map((elm, index) => {
                const handlePress = () => {
                    navigation.navigate(
                        ReportRouteIndex[elm?.departmentName] as never,
                        {
                            _id: elm?.report._id,
                            userId: user?.userId,
                        } as never
                    );
                };

                return (
                    <TouchableNativeFeedback
                        disabled={false}
                        delayPressIn={0}
                        onPress={handlePress}
                        accessibilityRole="button"
                        background={TouchableNativeFeedback.Ripple(
                            isLightMode ? THEME_CONFIG.veryLightGray : THEME_CONFIG.darkGray,
                            false,
                            220
                        )}
                        key={index}
                        style={{ paddingHorizontal: 20 }}
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
                                {`${elm.departmentName} Report`}
                            </Text>
                            <StatusTag>{elm?.report.status as any}</StatusTag>
                        </HStack>
                    </TouchableNativeFeedback>
                );
            })}
        </>
    );
};

interface ICampusReportSummaryProps {
    serviceId?: string;
    refetchService: () => void;
}

const CampusReportSummary: React.FC<ICampusReportSummaryProps> = ({ serviceId, refetchService }) => {
    const { data, refetch, isLoading, isFetching, isUninitialized } = useGetCampusReportSummaryQuery(
        serviceId as string,
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

    const sortedData = React.useMemo(() => Utils.sortByDate(data ? data.departmentalReport : [], 'createdAt'), [data]);

    const groupedData = React.useMemo(() => Utils.groupListByKey(sortedData, 'createdAt'), [sortedData]);

    useScreenFocus({ onFocus: !isUninitialized ? refetch : undefined });

    return (
        <>
            <VStack mt={4} px={4} overflow="scroll">
                <HStack alignItems="baseline" justifyContent="space-between">
                    <ButtonComponent
                        size="xs"
                        padding={0}
                        width={200}
                        shadow="none"
                        variant="link"
                        onPress={navigateToReports}
                    >
                        <HStack alignItems="center" space={1}>
                            <Icon color={THEME_CONFIG.primary} name="people-outline" type="ionicon" size={18} />
                            <Text color="gray.400" fontSize="md" ml={2}>
                                Reports submitted
                            </Text>
                            <Icon color={THEME_CONFIG.primary} name="external-link" type="evilicon" size={26} />
                        </HStack>
                    </ButtonComponent>
                    <Flex alignItems="baseline" flexDirection="row">
                        <Text fontWeight="semibold" color="primary.600" fontSize="4xl" ml={1}>{`${0}`}</Text>
                        <Text fontWeight="semibold" color="gray.600" fontSize="md">{`/${6}`}</Text>
                    </Flex>
                </HStack>
                <Divider />
            </VStack>
            <FlatListComponent
                padding
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
};

export { CampusReportSummary };
