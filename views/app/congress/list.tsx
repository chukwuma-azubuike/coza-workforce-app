import { Text } from "~/components/ui/text";
import { useIsFocused, useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';
import React, { memo } from 'react';
import { TouchableOpacity, View } from 'react-native';
import StatusTag from '@components/atoms/status-tag';
import FlatListComponent, { IFlatListColumn } from '@components/composite/flat-list';
// import useFetchMoreData from '@hooks/fetch-more-data';
import useScreenFocus from '@hooks/focus';
import { ICongress, IUserStatus } from '@store/types';
// import Utils from '@utils';
import { useGetCongresssQuery } from '@store/services/congress';
import assertCongressActive from '~/utils/assertCongressActive';

const CongressListRow: React.FC<ICongress> = memo(congress => {
    const navigation = useNavigation();
    const handlePress = () => {
        navigation.navigate('Congress Details', { CongressId: congress._id } as unknown as never);
    };

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
            <View p={2} flex={1} alignItems="center" justifyContent="space-between">
                <View space={3} alignItems="center">
                    <View justifyContent="space-between">
                        <Text className="font-bold">{congress?.name}</Text>
                        <Text fontSize="sm" color="gray.400">
                            {`${dayjs(congress?.startDate).format('DD MMM, YYYY')} - ${dayjs(congress?.endDate).format(
                                'DD MMM, YYYY'
                            )}`}
                        </Text>
                    </View>
                </View>
                <StatusTag>{status}</StatusTag>
            </View>
        </TouchableOpacity>
    );
});

const CongressList: React.FC<{ updatedListItem: ICongress }> = memo(({ updatedListItem }) => {
    const congressColumns: IFlatListColumn[] = [
        {
            dataIndex: 'createdAt',
            render: (_: ICongress, key) => <CongressListRow {..._} key={key} />,
        },
    ];

    const isScreenFocused = useIsFocused();
    const [page, setPage] = React.useState<number>(1);

    const { data, isLoading, isSuccess, refetch, isFetching } = useGetCongresssQuery({});

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
            columns={congressColumns}
            refreshing={isFetching}
            emptyMessage="No Congress Created"
            // fetchMoreData={fetchMoreData}
            isLoading={isLoading || isFetching}
        />
    );
});

export { CongressList };
