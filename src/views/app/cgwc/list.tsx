import { useIsFocused } from '@react-navigation/native';
import moment from 'moment';
import { HStack, Text, VStack } from 'native-base';
import React, { memo } from 'react';
import { TouchableOpacity } from 'react-native';
import StatusTag from '../../../components/atoms/status-tag';
import FlatListComponent, { IFlatListColumn } from '../../../components/composite/flat-list';
// import useFetchMoreData from '../../../hooks/fetch-more-data';
import useScreenFocus from '../../../hooks/focus';
import { ICGWC } from '../../../store/types';
import Utils from '../../../utils';
import { useGetCGWCsQuery } from '../../../store/services/cgwc';

const CGWCListRow: React.FC<ICGWC> = cgwc => {
    return (
        <TouchableOpacity
            disabled={false}
            delayPressIn={0}
            activeOpacity={0.6}
            style={{ width: '100%' }}
            accessibilityRole="button"
        >
            <HStack p={2} flex={1} alignItems="center" justifyContent="space-between">
                <HStack space={3} alignItems="center">
                    {/* <VStack justifyContent="space-between">
                        <Text bold>{cgwc?.name}</Text>
                        <Text fontSize="sm" color="gray.400">
                            {`${moment(cgwc?.serviceTime).format('DD-MM-YYYY')} - ${moment(
                                cgwc?.serviceTime
                            ).format('LT')}`}
                        </Text>
                    </VStack> */}
                </HStack>
                {/* <StatusTag>{cgwc?.isGlobalService ? ('Global Service' as any) : 'Local Service'}</StatusTag> */}
            </HStack>
        </TouchableOpacity>
    );
};

const CGWCList: React.FC<{ updatedListItem: ICGWC }> = memo(({ updatedListItem }) => {
    const cgwcColumns: IFlatListColumn[] = [
        {
            dataIndex: 'createdAt',
            render: (_: ICGWC, key) => <CGWCListRow {..._} key={key} />,
        },
    ];

    const isScreenFocused = useIsFocused();
    const [page, setPage] = React.useState<number>(1);

    const { data, isLoading, isSuccess, refetch, isFetching } = useGetCGWCsQuery(
        { limit: 20, page },
        { skip: !isScreenFocused, refetchOnMountOrArgChange: true }
    );

    // const { data: moreData } = useFetchMoreData({ uniqKey: '_id', dataSet: data, isSuccess });

    // const fetchMoreData = () => {
    //     if (!isFetching && !isLoading) {
    //         if (data?.length) {
    //             setPage(prev => prev + 1);
    //         } else {
    //             setPage(prev => prev - 1);
    //         }
    //     }
    // };

    const groupedData = React.useMemo(
        () => Utils.replaceArrayItemByNestedKey(data || [], updatedListItem, ['createdAt', updatedListItem?._id]),
        [updatedListItem?._id, data]
    );

    const sortedData = React.useMemo(() => Utils.sortByDate(groupedData, 'serviceTime'), [groupedData]);

    useScreenFocus({ onFocus: refetch });

    return (
        <FlatListComponent
            data={sortedData}
            columns={cgwcColumns}
            refreshing={isFetching}
            // fetchMoreData={fetchMoreData}
            isLoading={isLoading || isFetching}
        />
    );
});

export { CGWCList };
