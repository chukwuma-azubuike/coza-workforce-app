import { Text } from '~/components/ui/text';
import React, { memo } from 'react';
import ViewWrapper from '@components/layout/viewWrapper';
import FlatListComponent from '@components/composite/flat-list';
import useFetchMoreData from '@hooks/fetch-more-data';
import Utils from '@utils/index';
import { IGHSubmittedReport } from '@store/services/reports';
import StatusTag from '@components/atoms/status-tag';
import { TouchableOpacity, View } from 'react-native';
import dayjs from 'dayjs';
import { useGetGhReportsQuery } from '@store/services/grouphead';
import { router } from 'expo-router';

const ITEM_HEIGHT = 60;

export const ReportListRow: React.FC<IGHSubmittedReport> = memo(props => {
    const { status, serviceName, createdAt } = props;

    const handlePress = () => {
        router.push('/group-head-service-report');
    };

    return (
        <TouchableOpacity
            key={createdAt}
            delayPressIn={0}
            activeOpacity={0.6}
            onPress={handlePress}
            accessibilityRole="button"
            style={{ flex: 1 }}
        >
            <View className="py-12 items-center justify-between px-12">
                <View className="items-center gap-12">
                    <View className="justify-between">
                        <>
                            <Text>{serviceName}</Text>
                            <Text>{dayjs(createdAt).format('MMMM DD, YYYY')}</Text>
                        </>
                    </View>
                </View>
                <StatusTag>{status}</StatusTag>
            </View>
        </TouchableOpacity>
    );
});

const GroupHeadReportHistory: React.FC = () => {
    return (
        <ViewWrapper scroll>
            <GroupReportList />
        </ViewWrapper>
    );
};

export default GroupHeadReportHistory;

const GroupReportList = memo(() => {
    const renderGroupHeadReportItem = React.useCallback(
        ({ item }: { item: IGHSubmittedReport; index: number }) => <ReportListRow {...item} />,
        []
    );

    const [page, setPage] = React.useState<number>(1);
    const { data, isLoading, isSuccess, isFetching } = useGetGhReportsQuery(
        {
            limit: 20,
            page,
        },
        { refetchOnMountOrArgChange: true }
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

    const { data: moreData } = useFetchMoreData({ dataSet: data, isSuccess: isSuccess, uniqKey: 'createdAt' });

    const preparedForSortData = React.useMemo(
        () =>
            moreData?.map((report: IGHSubmittedReport) => {
                return { ...report, sortDateKey: report?.createdAt };
            }),
        [moreData]
    );

    const sortedData = React.useMemo(
        () => Utils.sortByDate(preparedForSortData || [], 'sortDateKey'),
        [preparedForSortData]
    );

    return (
        <FlatListComponent
            data={sortedData}
            renderItemComponent={renderGroupHeadReportItem}
            fetchMoreData={fetchMoreData}
            isLoading={isLoading || isFetching}
            refreshing={isLoading || isFetching}
            emptyMessage="There are no report submitted"
            getItemLayout={(data, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
        />
    );
});
