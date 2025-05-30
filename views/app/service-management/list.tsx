import { Text } from '~/components/ui/text';
import dayjs from 'dayjs';
import React, { memo } from 'react';
import { TouchableOpacity, View } from 'react-native';
import StatusTag from '@components/atoms/status-tag';
import useInfiniteData from '@hooks/fetch-more-data/use-infinite-data';
import { useGetServicesQuery } from '@store/services/services';
import { IService } from '@store/types';
import { router } from 'expo-router';
import ServiceContextMenu from './service-context-menu';
import { cn } from '~/lib/utils';
import SectionListComponent from '~/components/composite/section-list';
import ErrorBoundary from '~/components/composite/error-boundary';

const ServiceListRow: React.FC<IService> = React.memo(service => {
    const handleUpdate = () => {
        router.push({ pathname: '/service-management/update-service', params: service as any });
    };

    return (
        <ServiceContextMenu service={service}>
            <TouchableOpacity
                onPress={handleUpdate}
                delayPressIn={0}
                activeOpacity={0.6}
                accessibilityRole="button"
                className="w-full"
            >
                <View className="py-4 my-2 px-4 items-center gap-2 justify-between flex-row w-full rounded-xl border-border border">
                    <View className="gap-3 flex-1">
                        <View className="justify-between">
                            <Text className="font-bold ">{service?.name}</Text>
                            <Text className="text-sm">
                                {`${dayjs(service?.serviceTime).format('DD-MM-YYYY')} - ${dayjs(
                                    service?.serviceTime
                                ).format('h:mm A')}`}
                            </Text>
                        </View>
                    </View>
                    <StatusTag
                        className={cn(
                            service?.isGlobalService ? 'bg-violet-100 text-violet-700' : 'bg-sky-100 text-sky-700'
                        )}
                    >
                        {service?.isGlobalService ? ('Global Service' as any) : 'Local Service'}
                    </StatusTag>
                </View>
            </TouchableOpacity>
        </ServiceContextMenu>
    );
});

const AllService: React.FC = memo(() => {
    const { data, isLoading, isFetchingNextPage, fetchNextPage, refetch, hasNextPage } = useInfiniteData(
        { limit: 10 },
        useGetServicesQuery,
        '_id'
    );

    return (
        <ErrorBoundary>
            <SectionListComponent
                data={data}
                field="serviceTime"
                headerDateFormat="MMMM, YYYY"
                refetch={refetch}
                itemHeight={72.3}
                isLoading={isLoading}
                hasNextPage={hasNextPage}
                column={ServiceListRow}
                fetchNextPage={fetchNextPage}
                extraProps={{ type: 'campus' }}
                isFetchingNextPage={isFetchingNextPage}
            />
        </ErrorBoundary>
    );
});

export { AllService };
