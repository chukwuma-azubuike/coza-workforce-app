import { useIsFocused } from '@react-navigation/native';
import moment from 'moment';
import React, { memo } from 'react';
import { TouchableOpacity } from 'react-native';
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
            <HStackComponent style={{ padding: 4, alignItems: 'center', justifyContent: 'space-between' }}>
                <HStackComponent space={6} style={{ alignItems: 'center' }}>
                    <VStackComponent style={{ justifyContent: 'space-between' }}>
                        <TextComponent bold>{service?.name}</TextComponent>
                        <TextComponent fontSize="sm">
                            {`${moment(service?.serviceTime).format('DD-MM-YYYY')} - ${moment(
                                service?.serviceTime
                            ).format('LT')}`}
                        </TextComponent>
                    </VStackComponent>
                </HStackComponent>
                <StatusTag>{service?.isGlobalService ? ('Global Service' as any) : 'Local Service'}</StatusTag>
            </HStackComponent>
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
