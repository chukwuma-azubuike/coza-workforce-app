import { useNavigation } from '@react-navigation/native';
import { HStack, Text, VStack } from 'native-base';
import React, { memo, useMemo } from 'react';
import { TouchableNativeFeedback } from 'react-native';
import AvatarComponent from '../../../components/atoms/avatar';
import StatusTag from '../../../components/atoms/status-tag';
import ErrorBoundary from '../../../components/composite/error-boundary';
import FlatListComponent, { IFlatListColumn } from '../../../components/composite/flat-list';
import { THEME_CONFIG } from '../../../config/appConfig';
import { AVATAR_FALLBACK_URL } from '../../../constants';
import useFetchMoreData from '../../../hooks/fetch-more-data';
import useRole from '../../../hooks/role';
import useAppColorMode from '../../../hooks/theme/colorMode';
import { useGetPermissionsQuery } from '../../../store/services/permissions';
import { IPermission } from '../../../store/types';
import Utils from '../../../utils';
// import PermissionStats from './permission-stats';

interface IPermissionListRowProps extends IPermission {
    type: 'own' | 'team' | 'campus';
    '0'?: string;
    '1'?: IPermission[];
}

const PermissionListRow: React.FC<IPermissionListRowProps> = props => {
    const navigation = useNavigation();

    const { type } = props;

    const { isLightMode } = useAppColorMode();

    return (
        <ErrorBoundary>
            {props[1]?.map((elm, index) => {
                const handlePress = () => {
                    navigation.navigate('Permission Details' as never, elm as never);
                };

                const { requestor, departmentName, categoryName, description, category, status } = elm;

                return (
                    <TouchableNativeFeedback
                        disabled={false}
                        delayPressIn={0}
                        onPress={handlePress}
                        accessibilityRole="button"
                        background={TouchableNativeFeedback.Ripple(
                            isLightMode ? THEME_CONFIG.veryLightGray : THEME_CONFIG.darkGray,
                            false,
                            220
                        )}
                        key={index}
                        style={{ paddingHorizontal: 20 }}
                    >
                        <HStack py={2} flex={1} w="full" alignItems="center" justifyContent="space-between">
                            <HStack space={3} alignItems="center">
                                <AvatarComponent imageUrl={requestor?.pictureUrl || AVATAR_FALLBACK_URL} />
                                <VStack justifyContent="space-between">
                                    {type === 'own' && (
                                        <>
                                            <Text bold fontSize="sm" color="gray.400">
                                                {categoryName}
                                            </Text>
                                            <Text fontSize="sm" color="gray.400">
                                                {Utils.truncateString(description)}
                                            </Text>
                                        </>
                                    )}
                                    {type === 'team' && (
                                        <>
                                            <Text bold>
                                                {`${Utils.capitalizeFirstChar(
                                                    requestor?.firstName
                                                )} ${Utils.capitalizeFirstChar(requestor?.lastName)}`}
                                            </Text>
                                            <Text fontSize="sm" color="gray.400">
                                                {categoryName}
                                            </Text>
                                        </>
                                    )}
                                    {type === 'campus' && (
                                        <>
                                            <Text bold>
                                                {`${Utils.capitalizeFirstChar(
                                                    requestor?.firstName
                                                )} ${Utils.capitalizeFirstChar(requestor?.lastName)}`}
                                            </Text>
                                            <Text fontSize="sm" color="gray.600">
                                                {departmentName}
                                            </Text>
                                            <Text fontSize="sm" color="gray.400">
                                                {categoryName}
                                            </Text>
                                        </>
                                    )}
                                </VStack>
                            </HStack>
                            <StatusTag>{status}</StatusTag>
                        </HStack>
                    </TouchableNativeFeedback>
                );
            })}
        </ErrorBoundary>
    );
};

const MyPermissionsList: React.FC<{ updatedListItem: IPermission }> = memo(({ updatedListItem }) => {
    const myPermissionsColumns: IFlatListColumn[] = [
        {
            dataIndex: 'dateCreated',
            render: (_: IPermission, key) => <PermissionListRow type="own" {..._} key={key} />,
        },
    ];

    const {
        user: { userId },
    } = useRole();

    const [page, setPage] = React.useState<number>(1);

    const { data, isLoading, refetch, isFetching, isSuccess } = useGetPermissionsQuery(
        { requestor: userId, limit: 10, page },
        {
            refetchOnMountOrArgChange: true,
        }
    );

    const { data: moreData } = useFetchMoreData({ uniqKey: '_id', dataSet: data, isSuccess });

    const fetchMoreData = () => {
        if (!isLoading && !isFetching) {
            setPage(prev => prev + 1);
        }
    };

    const memoizedData = useMemo(() => Utils.groupListByKey(moreData, 'dateCreated'), [moreData]);

    return (
        <ErrorBoundary>
            {/* <PermissionStats total={5} pending={1} declined={0} approved={4} /> */}
            <FlatListComponent
                onRefresh={refetch}
                data={memoizedData}
                fetchMoreData={fetchMoreData}
                columns={myPermissionsColumns}
                isLoading={isLoading || isFetching}
                refreshing={isLoading || isFetching}
            />
        </ErrorBoundary>
    );
});

const MyTeamPermissionsList: React.FC<{ updatedListItem: IPermission }> = memo(({ updatedListItem }) => {
    const teamPermissionsColumns: IFlatListColumn[] = [
        {
            dataIndex: 'dateCreated',
            render: (_: IPermission, key) => <PermissionListRow type="team" {..._} key={key} />,
        },
    ];

    const {
        user: {
            department: { _id },
        },
    } = useRole();

    const [page, setPage] = React.useState<number>(1);

    const { data, isLoading, isFetching, isSuccess } = useGetPermissionsQuery(
        { departmentId: _id, limit: 20, page },
        {
            refetchOnMountOrArgChange: true,
        }
    );

    const { data: moreData } = useFetchMoreData({ uniqKey: '_id', dataSet: data, isSuccess });

    const fetchMoreData = () => {
        if (!isFetching && !isLoading && data) {
            setPage(prev => prev + 1);
        }
    };

    const memoizedData = useMemo(
        () =>
            Utils.groupListByKey(
                Utils.replaceArrayItemByNestedKey(moreData || [], updatedListItem, ['_id', updatedListItem?._id]),
                'createdAt'
            ),
        [updatedListItem?._id, moreData]
    );

    return (
        <ErrorBoundary>
            {/* <PermissionStats total={21} pending={2} declined={4} approved={15} /> */}
            <FlatListComponent
                data={memoizedData}
                refreshing={isFetching}
                fetchMoreData={fetchMoreData}
                columns={teamPermissionsColumns}
                isLoading={isLoading || isFetching}
            />
        </ErrorBoundary>
    );
});

const CampusPermissions: React.FC<{ updatedListItem: IPermission }> = memo(({ updatedListItem }) => {
    const teamPermissionsColumns: IFlatListColumn[] = [
        {
            dataIndex: 'dateCreated',
            render: (_: IPermission, key) => <PermissionListRow type="campus" {..._} key={key} />,
        },
    ];

    const {
        user: {
            campus: { _id },
        },
    } = useRole();

    const [page, setPage] = React.useState<number>(1);

    const { data, isLoading, refetch, isFetching, isSuccess } = useGetPermissionsQuery(
        {
            campusId: _id,
            limit: 10,
            page,
        },
        {
            refetchOnMountOrArgChange: true,
        }
    );

    const { data: moreData } = useFetchMoreData({ uniqKey: '_id', dataSet: data, isSuccess });

    const memoizedData = useMemo(() => Utils.groupListByKey(moreData, 'createdAt'), [moreData]);

    const fetchMoreData = () => {
        if (!isFetching && !isLoading) setPage(prev => prev + 1);
    };

    return (
        <ErrorBoundary>
            {/* <PermissionStats total={67} pending={17} declined={15} approved={35} /> */}
            <FlatListComponent
                onRefresh={refetch}
                data={memoizedData}
                fetchMoreData={fetchMoreData}
                columns={teamPermissionsColumns}
                isLoading={isLoading || isFetching}
                refreshing={isLoading || isFetching}
            />
        </ErrorBoundary>
    );
});

export { MyPermissionsList, MyTeamPermissionsList, CampusPermissions };
