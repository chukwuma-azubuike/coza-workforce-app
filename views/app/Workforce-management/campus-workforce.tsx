import { Text } from '~/components/ui/text';
import React from 'react';
import { SmallCardComponent } from '@components/composite/card';
import ErrorBoundary from '@components/composite/error-boundary';
import If from '@components/composite/if-container';
import StaggerButtonComponent from '@components/composite/stagger';
import { FlatListSkeleton, FlexListSkeleton } from '@components/layout/skeleton';
import ViewWrapper from '@components/layout/viewWrapper';
import { useCustomBackNavigation } from '@hooks/navigation';
import useRole from '@hooks/role';
import { useGetCampusSummaryByCampusIdQuery, useGetUsersQuery } from '@store/services/account';
import Utils from '@utils/index';
import useScreenFocus from '@hooks/focus';
import DynamicSearch from '@components/composite/search';
import { IUser } from '@store/types';
import { View } from 'react-native';
import { cn } from '~/lib/utils';
import { router, useLocalSearchParams } from 'expo-router';

const CampusWorkforceSummary: React.FC = () => {
    const params = useLocalSearchParams() as unknown as { _id?: string };
    const campusId = params?._id;

    const handlePress = (elm: any) => {
        router.push({ pathname: '/workforce-summary/workforce-management', params: { ...elm, campusId } });
    };

    const {
        isQcHOD,
        isSuperAdmin,
        isGlobalPastor,
        isInternshipHOD,
        isCampusPastor,
        user: { campus },
    } = useRole();

    const {
        data,
        isLoading,
        isFetching,
        refetch: campusSummaryRefetch,
        isUninitialized: campusSummaryIsUninitialized,
    } = useGetCampusSummaryByCampusIdQuery(campusId || campus._id);

    const {
        data: campusUsers,
        isLoading: isLoadingUsers,
        isFetching: isFetchingUsers,
        refetch: campusUsersSummaryRefetch,
        isUninitialized: campusUsersIsUninitialized,
    } = useGetUsersQuery(
        { campusId: campusId || campus._id },
        { refetchOnMountOrArgChange: true, skip: typeof campusId === 'undefined' && typeof !campus._id === 'undefined' }
    );

    const isRefreshing = isLoading || isFetching || isLoadingUsers || isFetchingUsers;

    const campusInfo = [
        {
            name: 'Campus',
            value: data?.campusName,
        },
        {
            name: 'Departments',
            value: data?.departments,
        },
    ];

    const summaryList = [
        {
            title: 'Total',
            color: 'text-primary',
            value: data?.totalUser || 0,
        },
        {
            title: 'Active',
            color: 'text-green-700',
            value: data?.activeUser || 0,
        },
        {
            title: 'Inactive',
            color: 'text-red-700',
            value: data?.inactiveUser || 0,
        },
        {
            title: 'Dormant',
            color: 'text-orange-500',
            value: data?.dormantUser || 0,
        },
        {
            title: 'Blacklisted',
            color: 'text-orange-500',
            value: data?.blacklistedUser || 0,
        },
    ];

    const Departmentlist = React.useMemo(
        () =>
            Utils.sortStringAscending(
                data?.departmentCount.map(item => ({
                    ...item,
                    value: item.userCount,
                    _id: item.departmentId,
                    title: item.departmentName,
                })),
                'title'
            ),
        [data?.departmentCount]
    );

    const gotoCreateWorker = () => {
        router.push('/workforce-summary/create-user');
    };

    const gotoCreateCampus = () => {
        router.push('/workforce-summary/create-campus');
    };

    const gotoCreateDepartment = () => {
        router.push('/workforce-summary/create-department');
    };

    const allButtons = [
        {
            color: 'bg-blue-400',
            iconType: 'ionicon',
            iconName: 'person-outline',
            handleClick: gotoCreateWorker,
        },
        {
            color: 'bg-blue-600',
            iconType: 'ionicon',
            iconName: 'people-outline',
            handleClick: gotoCreateDepartment,
        },
        {
            color: 'bg-blue-800',
            iconName: 'church',
            iconType: 'material-community',
            handleClick: gotoCreateCampus,
        },
    ];

    const filteredButtons = React.useMemo(() => {
        if (isSuperAdmin || isGlobalPastor) {
            return allButtons;
        }

        if (isCampusPastor || isInternshipHOD || isQcHOD) {
            return [allButtons[0], allButtons[1]];
        }

        return [allButtons[0]];
    }, []);

    const refresh = () => {
        !campusSummaryIsUninitialized && campusSummaryRefetch();
        !campusUsersIsUninitialized && campusUsersSummaryRefetch();
    };

    useCustomBackNavigation({
        targetRoute: isGlobalPastor || isSuperAdmin ? '/workforce-summary/global-workforce' : '/more',
    });
    useScreenFocus({
        onFocus: refresh,
    });

    const handleUserPress = (user: IUser) => {
        router.push({ pathname: '/workforce-summary/user-profile', params: user as any });
    };

    return (
        <ErrorBoundary>
            <DynamicSearch
                data={campusUsers}
                onPress={handleUserPress}
                loading={isLoadingUsers || isLoadingUsers}
                searchFields={['firstName', 'lastName', 'departmentName', 'email']}
            />
            <ViewWrapper scroll onRefresh={refresh} refreshing={isRefreshing}>
                <View className="flex-row justify-center p-4  border border-border rounded-2xl my-4">
                    {campusInfo.map((item, index) =>
                        isLoading ? (
                            <FlexListSkeleton count={1} key={index} />
                        ) : (
                            <View key={index} className="px-6 items-center">
                                <Text>{item.name}</Text>
                                <Text className="font-bold text-2xl">{item.value}</Text>
                            </View>
                        )
                    )}
                </View>

                {isLoading ? (
                    <FlatListSkeleton count={1} />
                ) : (
                    <View className="p-4 flex-1 flex-row flex-wrap justify-evenly border border-border rounded-2xl">
                        {summaryList.map((item, index) => (
                            <View
                                key={index}
                                style={{
                                    minWidth: '20%',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginVertical: 2,
                                }}
                            >
                                <Text className="text-2xl">{item.title}</Text>
                                <Text className={cn('text-4xl font-bold', item.color)}>{item.value || 0}</Text>
                            </View>
                        ))}
                    </View>
                )}

                <View className="my-4 flex-row flex-1 flex-wrap gap-4">
                    {isLoading ? (
                        <FlatListSkeleton count={6} />
                    ) : (
                        <>
                            {Departmentlist?.map((item, index) => (
                                <View className="flex-auto flex-grow" key={index}>
                                    <SmallCardComponent
                                        key={index}
                                        label={item.title}
                                        value={item.value}
                                        onPress={() => handlePress(item)}
                                    />
                                </View>
                            ))}
                        </>
                    )}
                </View>
            </ViewWrapper>
            <If condition={isCampusPastor || isQcHOD || isGlobalPastor || isSuperAdmin || isInternshipHOD}>
                <StaggerButtonComponent buttons={filteredButtons as unknown as any} />
            </If>
        </ErrorBoundary>
    );
};

export default CampusWorkforceSummary;
