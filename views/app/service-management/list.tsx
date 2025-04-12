import { Text } from "~/components/ui/text";
import { useIsFocused } from '@react-navigation/native';
import dayjs from 'dayjs';
import React, { memo } from 'react';
import { TouchableOpacity, View } from 'react-native';
import StatusTag from '@components/atoms/status-tag';
import FlatListComponent, { IFlatListColumn } from '@components/composite/flat-list';
import useFetchMoreData from '@hooks/fetch-more-data';
import useScreenFocus from '@hooks/focus';
import { useGetServicesQuery } from '@store/services/services';
import { IService } from '@store/types';
import Utils from '@utils/index';
import HStackComponent from '@components/layout/h-stack';
import VStackComponent from '@components/layout/v-stack';
import TextComponent from '@components/text';

const ServiceListRow: React.FC<IService> = React.memo(service => {
    return (
        <TouchableOpacity
            disabled={false}
            delayPressIn={0}
            activeOpacity={0.6}
            style={{ width: '100%' }}
            accessibilityRole="button"
        >
            <View className="p-4 items-center justify-between">
                <View space={6} className="items-center">
                    <View className="justify-between">
                        <Text className="font-bold">{service?.name}</Text>
                        <Text fontSize="sm">
                            {`${dayjs(service?.serviceTime).format('DD-MM-YYYY')} - ${dayjs(
                                service?.serviceTime
                            ).format('h:mm A')}`}
                        </Text>
                    </View>
                </View>
                <StatusTag>{service?.isGlobalService ? ('Global Service' as any) : 'Local Service'}</StatusTag>
            </View>
        </TouchableOpacity>
    );
});

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

    const { data: moreData } = useFetchMoreData({ uniqKey: '_id', dataSet: data, isSuccess });

    const fetchMoreData = () => {
        if (!isFetching && !isLoading) {
            if (data?.length) {
                setPage(prev => prev + 1);
            } else {
                setPage(prev => prev - 1);
            }
        }
    };

    const groupedData = React.useMemo(
        () => Utils.replaceArrayItemByNestedKey(data || [], updatedListItem, ['createdAt', updatedListItem?._id]),
        [updatedListItem?._id, data]
    );

    useScreenFocus({ onFocus: refetch });

    return (
        <FlatListComponent
            data={moreData}
            refreshing={isFetching}
            columns={serviceColumns}
            fetchMoreData={fetchMoreData}
            isLoading={isLoading || isFetching}
        />
    );
});

export { AllService };
