import { useIsFocused, useNavigation } from '@react-navigation/native';
import moment from 'moment';
import { HStack, Text, VStack } from 'native-base';
import React, { memo } from 'react';
import { TouchableOpacity } from 'react-native';
import StatusTag from '@components/atoms/status-tag';
import FlatListComponent, { IFlatListColumn } from '@components/composite/flat-list';
// import useFetchMoreData from '@hooks/fetch-more-data';
import useScreenFocus from '@hooks/focus';
import { ICGWC, IUserStatus } from '@store/types';
// import Utils from '@utils';
import { useGetCGWCsQuery } from '@store/services/cgwc';

const CGWCListRow: React.FC<ICGWC> = cgwc => {
    const navigation = useNavigation();
    const handlePress = () => {
        navigation.navigate('CGWC Details', { cgwcId: cgwc._id } as unknown as never);
    };

    const status = React.useMemo(
        () => (moment().diff(moment(cgwc?.endDate)) > 0 ? 'INACTIVE' : 'ACTIVE'),
        []
    ) as IUserStatus;

    return (
        <TouchableOpacity
            disabled={false}
            delayPressIn={0}
            activeOpacity={0.6}
            onPress={handlePress}
            style={{ width: '100%' }}
            accessibilityRole="button"
        >
            <HStack p={2} flex={1} alignItems="center" justifyContent="space-between">
                <HStack space={3} alignItems="center">
                    <VStack justifyContent="space-between">
                        <Text bold>{cgwc?.name}</Text>
                        <Text fontSize="sm" color="gray.400">
                            {`${moment(cgwc?.startDate).format('DD MMM, YYYY')} - ${moment(cgwc?.endDate).format(
                                'DD MMM, YYYY'
                            )}`}
                        </Text>
                    </VStack>
                </HStack>
                <StatusTag>{status}</StatusTag>
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

    const { data, isLoading, isSuccess, refetch, isFetching } = useGetCGWCsQuery({});

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

    useScreenFocus({ onFocus: refetch });

    return (
        <FlatListComponent
            data={data || []}
            columns={cgwcColumns}
            refreshing={isFetching}
            emptyMessage="No CGWC Created"
            // fetchMoreData={fetchMoreData}
            isLoading={isLoading || isFetching}
        />
    );
});

export { CGWCList };
