import { useIsFocused, useNavigation } from '@react-navigation/native';
import { HStack, Text, VStack } from 'native-base';
import React, { memo } from 'react';
import { TouchableNativeFeedback } from 'react-native';
import AvatarComponent from '../../../components/atoms/avatar';
import StatusTag from '../../../components/atoms/status-tag';
import FlatListComponent, { IFlatListColumn } from '../../../components/composite/flat-list';
import { THEME_CONFIG } from '../../../config/appConfig';
import { AVATAR_FALLBACK_URL } from '../../../constants';
import useFetchMoreData from '../../../hooks/fetch-more-data';
import useScreenFocus from '../../../hooks/focus';
import useRole from '../../../hooks/role';
import useAppColorMode from '../../../hooks/theme/colorMode';
import { useGetUsersQuery } from '../../../store/services/account';
import { IAllService, IUser } from '../../../store/types';
import Utils from '../../../utils';
import { useGetServicesQuery } from '../../../store/services/services';
import moment from 'moment';

const ServiceListRow: React.FC<IAllService> = service => {
    const navigation = useNavigation();
    const { isLightMode } = useAppColorMode();

    const handlePress = () => {
        navigation.navigate('User Profile' as never, service as never);
    };

    return (
        <TouchableNativeFeedback
            disabled={false}
            delayPressIn={0}
            // onPress={handlePress}
            accessibilityRole="button"
            background={TouchableNativeFeedback.Ripple(
                isLightMode ? THEME_CONFIG.veryLightGray : THEME_CONFIG.darkGray,
                false,
                220
            )}
            style={{ paddingHorizontal: 20 }}
        >
            <HStack p={2} flex={1} w="full" alignItems="center" justifyContent="space-between">
                <HStack space={3} alignItems="center">
                    <VStack justifyContent="space-between">
                        <Text bold>
                            {/* {Utils.capitalizeFirstChar(user?.firstName)} {Utils.capitalizeFirstChar(user?.lastName)} */}
                            {service?.name}
                        </Text>
                        <Text fontSize="sm" color="gray.400">
                            {`${moment(service?.clockInStartTime).format('DD-MM-YYYY')} - ${moment(
                                service?.clockInStartTime
                            ).format('hh:mm a')}`}
                        </Text>
                    </VStack>
                </HStack>
                <StatusTag>{service?.isGlobalService ? 'Global Service' : 'Local Service'}</StatusTag>
            </HStack>
        </TouchableNativeFeedback>
    );
};

const AllService: React.FC = memo(() => {
    const teamColumns: IFlatListColumn[] = [
        {
            dataIndex: '_id',
            render: (_: IAllService, key) => <ServiceListRow {..._} key={key} />,
        },
    ];

    const isScreenFocused = useIsFocused();
    const [page, setPage] = React.useState<number>(1);

    const { data, isLoading, isSuccess, refetch, isFetching } = useGetServicesQuery(
        { limit: 10, page },
        { skip: !isScreenFocused, refetchOnMountOrArgChange: true }
    );

    const { data: moreData } = useFetchMoreData({ dataSet: data, isSuccess, uniqKey: '_id' });

    const fetchMoreData = () => {
        if (!isFetching && !isLoading) {
            setPage(prev => prev + 1);
        }
    };

    useScreenFocus({ onFocus: refetch });

    return (
        <FlatListComponent
            onRefresh={refetch}
            data={moreData || []}
            columns={teamColumns}
            fetchMoreData={fetchMoreData}
            isLoading={isLoading || isFetching}
            refreshing={isLoading || isFetching}
        />
    );
});

export { AllService };
