import { Text } from '~/components/ui/text';
import dayjs from 'dayjs';
import React, { useCallback } from 'react';
import { TouchableOpacity, View } from 'react-native';
import StatusTag from '@components/atoms/status-tag';
import FlatListComponent from '@components/composite/flat-list';
import ViewWrapper from '@components/layout/viewWrapper';
import useFetchMoreData from '@hooks/fetch-more-data';
import { ICampusReport, useGetCampusReportListQuery } from '@store/services/reports';
import Utils from '@utils/index';
import { router } from 'expo-router';

export const DepartmentReportListRow: React.FC<ICampusReport> = ({ serviceId, campusId, ...props }) => {
    const navigateToReports = () => {
        router.push({
            pathname: '/reports/campus-report',
            params: { serviceId, campusId },
        });
    };

    return (
        <TouchableOpacity
            disabled={false}
            delayPressIn={0}
            activeOpacity={0.6}
            onPress={navigateToReports}
            style={{ width: '100%' }}
            accessibilityRole="button"
        >
            <View className="px-4 py-3 my-1 items-center bg-muted-background justify-between rounded-md flex-row">
                <Text className="text-muted-foreground">{dayjs(props?.serviceTime).format('DD/MM/YYYY')}</Text>
                <Text className="font-bold">{Utils.truncateString(props?.serviceName)}</Text>
                <StatusTag>{props?.status as any}</StatusTag>
            </View>
        </TouchableOpacity>
    );
};
interface ICampusReportPayload {
    serviceId?: string;
    campusId: string;
}

const CampusReportDetails: React.FC<ICampusReportPayload> = props => {
    const { serviceId, campusId } = props;

    const [page, setPage] = React.useState<number>(0);

    const { data, refetch, isLoading, isFetching, isSuccess } = useGetCampusReportListQuery(
        {
            page,
            campusId,
            limit: 30,
        },
        {
            refetchOnMountOrArgChange: true,
        }
    );

    const renderCampusReportItem = useCallback(
        ({ item }: { item: ICampusReport; index: number }) => (
            <DepartmentReportListRow
                {...item}
                campusId={(campusId as string) ?? item.campusId}
                serviceId={(serviceId as string) ?? item.serviceId}
            />
        ),
        [serviceId, campusId]
    );

    const handleRefresh = () => {
        serviceId && refetch();
    };

    const { data: moreData } = useFetchMoreData({ dataSet: data, isSuccess, uniqKey: 'serviceId' });

    const minimalReportData = React.useMemo(
        () =>
            moreData?.map(({ serviceTime, serviceName, status, serviceId, campusId }) => ({
                serviceId,
                campusId,
                serviceTime,
                serviceName,
                status,
            })) || [],
        [moreData]
    );

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
        <ViewWrapper className="mb-4 flex-1" noPadding refreshing={isLoading} onRefresh={handleRefresh}>
            <FlatListComponent
                onRefresh={refetch}
                data={minimalReportData}
                refreshing={isFetching}
                renderItemComponent={renderCampusReportItem}
                fetchMoreData={fetchMoreData}
                isLoading={isLoading || isFetching}
            />
        </ViewWrapper>
    );
};

export default CampusReportDetails;
