import React from 'react';
import { Icon } from '@rneui/base';
import { Divider, Flex, HStack, Text, VStack } from 'native-base';
import { THEME_CONFIG } from '../../../../config/appConfig';
import FlatListComponent, { IFlatListColumn } from '../../../../components/composite/flat-list';
import { ICampusReportSummary, useGetCampusReportSummaryQuery } from '../../../../store/services/reports';
import Utils from '../../../../utils';
import useModal from '../../../../hooks/modal/useModal';
import StatusTag from '../../../../components/atoms/status-tag';

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
                <Text _dark={{ color: 'gray.400' }} _light={{ color: 'gray.500' }}>
                    {`${elm.departmentName} Report`}
                </Text>
                <StatusTag>{(elm?.status as any) || 'PENDING'}</StatusTag>
            </HStack>
        ),
    },
];

interface ICampusReportSummaryProps {
    serviceId?: string;
    serviceIsLoading?: boolean;
}

const DATA = {
    status: 200,
    message: 'Service Report fetched successful.',
    isError: false,
    isSuccessful: true,
    data: {
        departmentalReport: [
            {
                departmentName: 'Children Ministry',
                report: {
                    _id: '640155321ac3081586a4daa6',
                    departmentId: '639cde3af520b583761aed59',
                    campusId: '6361a285832e7fbd65897cb7',
                    serviceId: '640155311ac3081586a4daa2',
                    userId: '63aa07fa94932790566036a8',
                    age1_2: {
                        male: 30,
                        female: 23,
                    },
                    age3_5: {
                        male: 30,
                        female: 23,
                    },
                    age6_11: {
                        male: 30,
                        female: 23,
                    },
                    age12_above: {
                        male: 30,
                        female: 23,
                    },
                    subTotal: {
                        male: 30,
                        female: 23,
                    },
                    grandTotal: 500,
                    otherInfo: 'test',
                    imageUrl: 'test',
                    status: 'SUBMITTED',
                    comment: null,
                    createdAt: '2023-03-03T02:02:26.530Z',
                    __v: 0,
                    updatedAt: '2023-03-03T02:07:30.906Z',
                    updatedBy: 'Olawale Ogunleye',
                },
            },
            {
                departmentName: 'Ushery Board',
                report: {
                    _id: '640155321ac3081586a4daa7',
                    departmentId: '639ce0c7f520b583761aed89',
                    campusId: '6361a285832e7fbd65897cb7',
                    serviceId: '640155311ac3081586a4daa2',
                    userId: null,
                    maleGuestCount: 0,
                    femaleGuestCount: 0,
                    infants: 0,
                    total: 0,
                    otherInfo: '',
                    imageUrl: '',
                    status: 'PENDING',
                    comment: null,
                    createdAt: '2023-03-03T02:02:26.534Z',
                    __v: 0,
                },
            },
            {
                departmentName: 'PCU',
                report: {
                    _id: '640155321ac3081586a4daa8',
                    departmentId: '639cdec3f520b583761aed63',
                    campusId: '6361a285832e7fbd65897cb7',
                    serviceId: '640155311ac3081586a4daa2',
                    userId: null,
                    firstTimersCount: 0,
                    newConvertsCount: 0,
                    otherInfo: null,
                    imageUrl: '',
                    status: 'PENDING',
                    comment: null,
                    createdAt: '2023-03-03T02:02:26.535Z',
                    __v: 0,
                },
            },
            {
                departmentName: 'Digital Surveillance Security',
                report: {
                    _id: '640155321ac3081586a4daa9',
                    departmentId: '639cdfa5f520b583761aed70',
                    campusId: '6361a285832e7fbd65897cb7',
                    serviceId: '640155311ac3081586a4daa2',
                    userId: '63aa07fa94932790566036a8',
                    locations: [
                        {
                            name: 'Opic Plaza',
                            carCount: 50,
                        },
                        {
                            name: 'Sheba Center',
                            carCount: 50,
                        },
                    ],
                    totalCarCount: 200,
                    otherInfo: 'test',
                    imageUrl: 'test',
                    status: 'SUBMITTED',
                    comment: null,
                    createdAt: '2023-03-03T02:02:26.537Z',
                    __v: 0,
                    updatedBy: 'Olawale Ogunleye',
                },
            },
            {
                departmentName: 'COZA Transfer Service',
                report: {
                    _id: '640155321ac3081586a4daaa',
                    departmentId: '639cde4ff520b583761aed5b',
                    campusId: '6361a285832e7fbd65897cb7',
                    serviceId: '640155311ac3081586a4daa2',
                    userId: null,
                    locations: [],
                    otherInfo: '',
                    imageUrl: '',
                    status: 'PENDING',
                    comment: null,
                    createdAt: '2023-03-03T02:02:26.539Z',
                    __v: 0,
                },
            },
        ],
        incidentReport: [
            {
                incidentReport: {
                    _id: '640157e61ac3081586a4db06',
                    departmentId: '639cde3af520b583761aed59',
                    campusId: '6361a285832e7fbd65897cb7',
                    serviceId: '640155311ac3081586a4daa2',
                    createdBy: '63aa07fa94932790566036a8',
                    isPublished: false,
                    publishedBy: null,
                    details:
                        'A phone was stolen during service. An Iphone 12 Pro was stolen during service, this was brought to our notice and we are trying to check the survelliance camera to see the culprit',
                    imageUrl: 'string',
                    createdAt: '2023-03-03T02:13:58.387Z',
                    __v: 0,
                },
            },
        ],
    },
};

const CampusReportSummary: React.FC<ICampusReportSummaryProps> = ({ serviceId, serviceIsLoading }) => {
    const { data, refetch, isLoading, isFetching } = useGetCampusReportSummaryQuery(serviceId as string, {
        skip: !serviceId,
    });

    const { setModalState } = useModal();

    const handleRefresh = () => {
        if (!serviceId) {
            setModalState({
                duration: 4,
                status: 'info',
                message: 'There is no service today so reports are not available sir.',
            });
        } else refetch();
    };

    return (
        <>
            <VStack mt={4} px={4} overflow="scroll">
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
            <FlatListComponent
                emptySize={160}
                columns={reportColumns}
                onRefresh={handleRefresh}
                isLoading={isLoading || isFetching || serviceIsLoading}
                refreshing={isLoading || isFetching || serviceIsLoading}
                data={DATA.data?.departmentalReport as unknown as ICampusReportSummary['departmentalReport']}
            />
        </>
    );
};

export { CampusReportSummary };
