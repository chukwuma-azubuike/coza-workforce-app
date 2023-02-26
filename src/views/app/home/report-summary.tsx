import React from 'react';
import { Icon } from '@rneui/base';
import { Divider, Flex, HStack, Text, VStack } from 'native-base';
import { THEME_CONFIG } from '../../../config/appConfig';
import FlatListComponent, { IFlatListColumn } from '../../../components/composite/flat-list';
import { ICampusReportSummary, useGetCampusReportSummaryQuery } from '../../../store/services/reports';
import TagComponent from '../../../components/atoms/tag';
import Utils from '../../../utils';
import { FlatListSkeleton } from '../../../components/layout/skeleton';

const reportColumns: IFlatListColumn[] = [
    {
        dataIndex: 'departmentName',
        render: (elm: ICampusReportSummary['departmentalReport'][0], key) => (
            <HStack
                p={2}
                px={4}
                w="full"
                borderRadius={10}
                alignItems="center"
                _dark={{ bg: 'gray.900' }}
                _light={{ bg: 'gray.50' }}
                justifyContent="space-between"
            >
                <Text _dark={{ color: "gray.400" }} _light={{ color: "gray.500" }}>
                    {`${elm.departmentName} Report`}
                </Text>
                <TagComponent
                    status={
                        elm.status === 'SUBMITTED' ? 'success' : elm.status === 'REVIEW_REQUESTED' ? 'error' : 'gray'
                    }
                >
                    {elm.status ? Utils.capitalizeFirstChar(elm.status, '_') : 'Pending'}
                </TagComponent>
            </HStack>
        ),
    },
];

interface ICampusReportSummaryProps {
    serviceId?: string;
    serviceIsLoading?: boolean;
}

const CampusReportSummary: React.FC<ICampusReportSummaryProps> = ({ serviceId, serviceIsLoading }) => {
    const { data, refetch, isLoading } = useGetCampusReportSummaryQuery(serviceId as string, {
        skip: !serviceId,
    });

    const handleRefresh = () => {
        refetch();
    };

    return (
        <>
            <VStack mt={6} px={4} overflow="scroll" maxH={260}>
                <HStack alignItems="baseline" justifyContent="space-between">
                    <Flex alignItems="center" flexDirection="row">
                        <Icon color={THEME_CONFIG.primary} name="people-outline" type="ionicon" size={18} />
                        <Text color="gray.400" fontSize="md" ml={2}>
                            Reports submitted
                        </Text>
                    </Flex>
                    <Flex alignItems="baseline" flexDirection="row">
                        <Text fontWeight="semibold" color="primary.600" fontSize="4xl" ml={1}>{`${0}`}</Text>
                        <Text fontWeight="semibold" color="gray.600" fontSize="md">{`/${6}`}</Text>
                    </Flex>
                </HStack>
                <Divider />
            </VStack>
            {isLoading || serviceIsLoading ? (
                <FlatListSkeleton count={3} />
            ) : (
                <FlatListComponent
                    padding
                    emptySize={160}
                    refreshing={isLoading}
                    columns={reportColumns}
                    onRefresh={handleRefresh}
                    data={data?.departmentalReport as unknown as ICampusReportSummary['departmentalReport']}
                />
            )}
        </>
    );
};

export { CampusReportSummary };
