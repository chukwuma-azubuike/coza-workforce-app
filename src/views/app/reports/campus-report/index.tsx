import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import { HStack, Text } from 'native-base';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import StatusTag from '../../../../components/atoms/status-tag';
import FlatListComponent, { IFlatListColumn } from '../../../../components/composite/flat-list';
import ViewWrapper from '../../../../components/layout/viewWrapper';
import useFetchMoreData from '../../../../hooks/fetch-more-data';
import useAppColorMode from '../../../../hooks/theme/colorMode';
import { ICampusReport, useGetCampusReportListQuery } from '../../../../store/services/reports';
import Utils from '../../../../utils';

export const DepartmentReportListRow: React.FC<ICampusReport> = props => {
    const navigation = useNavigation();
    const { isLightMode } = useAppColorMode();

    const handlePress = () => {
        navigation.navigate('Campus Report' as never, props as never);
    };

    return (
        <TouchableOpacity
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
                    {moment(props?.serviceTime).format('DD/MM/YYYY')}
                </Text>
                <Text _dark={{ color: 'gray.400' }} _light={{ color: 'gray.500' }} bold>
                    {Utils.truncateString(props?.serviceName)}
                </Text>
                <StatusTag>{props?.status as any}</StatusTag>
            </HStack>
        </TouchableOpacity>
    );
};
interface ICampusReportPayload {
    serviceId?: string;
    campusId: string;
}

const reportColumns: IFlatListColumn[] = [
    {
        dataIndex: 'createdAt',
        render: (_: ICampusReport, key) => <DepartmentReportListRow {..._} />,
    },
];

const CampusReportDetails: React.FC<ICampusReportPayload> = props => {
    const { serviceId, campusId } = props;

    const [page, setPage] = React.useState<number>(0);

    const { data, refetch, isLoading, isFetching, isSuccess, isError } = useGetCampusReportListQuery(
        {
            page,
            campusId,
            limit: 10,
        },
        {
            refetchOnMountOrArgChange: true,
        }
    );

    const handleRefresh = () => {
        serviceId && refetch();
    };

    const { data: moreData } = useFetchMoreData({ dataSet: data, isSuccess, uniqKey: 'serviceId' });

    const fetchMoreData = () => {
        if (!isFetching && !isLoading) {
            if (data?.length) {
                setPage(prev => prev + 1);
            } else {
                setPage(prev => prev - 1);
            }
        }
    };

    return (
        <ViewWrapper mb={4} noPadding refreshing={isLoading} onRefresh={handleRefresh}>
            <FlatListComponent
                onRefresh={refetch}
                data={moreData as any}
                refreshing={isFetching}
                columns={reportColumns}
                fetchMoreData={fetchMoreData}
                isLoading={isLoading || isFetching}
            />
        </ViewWrapper>
    );
};

export default CampusReportDetails;
