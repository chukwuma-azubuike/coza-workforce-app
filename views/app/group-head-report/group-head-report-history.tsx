import { Text } from "~/components/ui/text";
import { ParamListBase, useNavigation } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { memo } from 'react';
import ViewWrapper from '@components/layout/viewWrapper';
import FlatListComponent, { IFlatListColumn } from '@components/composite/flat-list';
import useFetchMoreData from '@hooks/fetch-more-data';
import Utils from '@utils/index';
import { IGHSubmittedReport } from '@store/services/reports';
import HStackComponent from '@components/layout/h-stack';
import VStackComponent from '@components/layout/v-stack';
import TextComponent from '@components/text';
import StatusTag from '@components/atoms/status-tag';
import { TouchableOpacity, View } from 'react-native';
import dayjs from 'dayjs';
import { useGetGhReportsQuery } from '@store/services/grouphead';

const ITEM_HEIGHT = 60;

export const ReportListRow: React.FC<IGHSubmittedReport> = memo(props => {
    const navigation = useNavigation();
    const { status, serviceName, createdAt } = props;

    const handlePress = () => {
        navigation.navigate('Group Head Service Report' as never, props as never);
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
            <View
                className="py-12 items-center justify-between px-12"
            >
                <View space={6} className="items-center">
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

const GroupHeadReportHistory: React.FC<NativeStackScreenProps<ParamListBase>> = ({ navigation, route }) => {
    return (
        <ViewWrapper scroll>
            <GroupReportList />
        </ViewWrapper>
    );
};

export default GroupHeadReportHistory;

const GroupReportList = memo(() => {
    const groupHeadReportColumns: IFlatListColumn[] = [
        {
            title: '',
            dataIndex: 'createdAt',
            render: (_: IGHSubmittedReport, key) => <ReportListRow {..._} key={key} />,
        },
    ];

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
            columns={groupHeadReportColumns}
            fetchMoreData={fetchMoreData}
            isLoading={isLoading || isFetching}
            refreshing={isLoading || isFetching}
            emptyMessage="There are no report submitted"
            getItemLayout={(data, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
        />
    );
});
