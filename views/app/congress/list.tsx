import React, { memo, useCallback } from 'react';
import dayjs from 'dayjs';
import { TouchableOpacity, View } from 'react-native';
import StatusTag from '@components/atoms/status-tag';
import FlatListComponent from '@components/composite/flat-list';
import useScreenFocus from '@hooks/focus';
import { Text } from '~/components/ui/text';
import { ICongress, IUserStatus } from '@store/types';
import { useGetCongresssQuery } from '@store/services/congress';
import assertCongressActive from '~/utils/assertCongressActive';
import { router } from 'expo-router';

const CongressListRow: React.FC<ICongress> = memo(congress => {
    const handlePress = useCallback(() => {
        router.push({
            pathname: '/congress/congress-details',
            params: { congressId: congress._id, name: congress.name },
        });
    }, [congress]);

    const status = React.useMemo(() => (assertCongressActive(congress) ? 'ACTIVE' : 'INACTIVE'), []) as IUserStatus;

    return (
        <TouchableOpacity
            disabled={false}
            delayPressIn={0}
            activeOpacity={0.6}
            onPress={handlePress}
            style={{ width: '100%' }}
            accessibilityRole="button"
        >
            <View className="items-center justify-between gap-4 flex-row p-2 px-4 rounded-xl border border-border">
                <View className="gap-2 flex-1">
                    <Text className="font-bold">{congress?.name}</Text>
                    <Text className="text-muted-foreground">
                        {dayjs(congress?.startDate).format('DD MMM, YYYY')} -{' '}
                        {dayjs(congress?.endDate).format('DD MMM, YYYY')}
                    </Text>
                </View>
                <StatusTag>{status}</StatusTag>
            </View>
        </TouchableOpacity>
    );
});

const CongressList: React.FC<{ updatedListItem: ICongress }> = memo(() => {
    const renderCongressItem = React.useCallback(
        ({ item }: { item: ICongress; index: number }) => <CongressListRow {...item} />,
        []
    );

    const { data, isLoading, refetch, isFetching } = useGetCongresssQuery({});

    const minimalCongressData = React.useMemo(
        () =>
            data?.map(({ _id, name, startDate, endDate }) => ({
                _id,
                name,
                startDate,
                endDate,
            })) || [],
        [data]
    );

    useScreenFocus({ onFocus: refetch });

    return (
        <FlatListComponent
            data={minimalCongressData}
            renderItemComponent={renderCongressItem}
            refreshing={isFetching}
            emptyMessage="No congress created"
            isLoading={isLoading || isFetching}
        />
    );
});

export { CongressList };
