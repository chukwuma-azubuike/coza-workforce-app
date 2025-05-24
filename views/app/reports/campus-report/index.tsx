import { Text } from '~/components/ui/text';
import dayjs from 'dayjs';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import StatusTag from '@components/atoms/status-tag';
import FlatListComponent, { IFlatListColumn } from '@components/composite/flat-list';
import ViewWrapper from '@components/layout/viewWrapper';
import useFetchMoreData from '@hooks/fetch-more-data';
import { ICampusReport, useGetCampusReportListQuery } from '@store/services/reports';
import Utils from '@utils/index';
import { router } from 'expo-router';

export const DepartmentReportListRow: React.FC<ICampusReport> = props => {
    const handlePress = () => {
        router.push({ pathname: '/reports/campus-report', params: props as any });
    };

    return (
        <TouchableOpacity
            disabled={false}
            delayPressIn={0}
            activeOpacity={0.6}
            onPress={handlePress}
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
        <ViewWrapper className="mb-4" noPadding refreshing={isLoading} onRefresh={handleRefresh}>
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
