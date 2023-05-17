import { useIsFocused, useNavigation } from '@react-navigation/native';
import moment from 'moment';
import { HStack, Text, VStack } from 'native-base';
import React, { memo } from 'react';
import { TouchableOpacity } from 'react-native';
import StatusTag from '../../../components/atoms/status-tag';
import FlatListComponent, { IFlatListColumn } from '../../../components/composite/flat-list';
import useFetchMoreData from '../../../hooks/fetch-more-data';
import useScreenFocus from '../../../hooks/focus';
import { useGetServicesQuery } from '../../../store/services/services';
import { IService } from '../../../store/types';
import Utils from '../../../utils';

const ServiceListRow: React.FC<IService> = service => {
    return (
        <TouchableOpacity disabled={false} delayPressIn={0} activeOpacity={0.6} accessibilityRole="button">
            <HStack p={2} flex={1} w="full" alignItems="center" justifyContent="space-between">
                <HStack space={3} alignItems="center">
                    <VStack justifyContent="space-between">
                        <Text bold>{service?.name}</Text>
                        <Text fontSize="sm" color="gray.400">
                            {`${moment(service?.serviceTime).format('DD-MM-YYYY')} - ${moment(service?.serviceTime)
                                .zone('+00:00')
                                .format('LT')}`}
                        </Text>
                    </VStack>
                </HStack>
                <StatusTag>{service?.isGlobalService ? ('Global Service' as any) : 'Local Service'}</StatusTag>
            </HStack>
        </TouchableOpacity>
    );
};

const AllService: React.FC<{ updatedListItem: IService }> = memo(({ updatedListItem }) => {
    const serviceColumns: IFlatListColumn[] = [
        {
            dataIndex: 'createdAt',
            render: (_: IService, key) => <ServiceListRow {..._} key={key} />,
        },
    ];

    const isScreenFocused = useIsFocused();
    const [page, setPage] = React.useState<number>(1);

    const { data, isLoading, isSuccess, refetch, isFetching } = useGetServicesQuery(
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
            refreshing={isFetching}
            columns={serviceColumns}
            // fetchMoreData={fetchMoreData}
            isLoading={isLoading || isFetching}
        />
    );
});

export { AllService };
