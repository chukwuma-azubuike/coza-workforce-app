import { View } from 'react-native';
import React from 'react';
import { SmallCardComponent } from '@components/composite/card';
import ErrorBoundary from '@components/composite/error-boundary';
import If from '@components/composite/if-container';
import StaggerButtonComponent from '@components/composite/stagger';
import { FlatListSkeleton } from '@components/layout/skeleton';
import ViewWrapper from '@components/layout/viewWrapper';
import { useCustomBackNavigation } from '@hooks/navigation';
import useRole from '@hooks/role';
import { useGetGlobalWorkForceSummaryQuery } from '@store/services/account';
import Utils from '@utils/index';
import useScreenFocus from '@hooks/focus';
import { Text } from '~/components/ui/text';
import { router } from 'expo-router';
import { cn } from '~/lib/utils';

const GlobalWorkforceSummary: React.FC = () => {
    const handlePress = (elm: any) => {
        router.push({ pathname: '/workforce-summary/campus-workforce', params: elm });
    };

    const { isQcHOD, isSuperAdmin, isGlobalPastor, isInternshipHOD, isCampusPastor } = useRole();

    const { data, isLoading, isFetching, refetch: globalSummaryRefetch } = useGetGlobalWorkForceSummaryQuery();

    const summaryList = [
        {
            title: 'Total',
            color: 'text-primary',
            value: data?.totalUsers || 0,
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
            color: 'text-orange-400',
            value: data?.dormantUsers || 0,
        },
        {
            title: 'Blacklisted',
            color: 'text-orange-500',
            value: data?.blacklistedUsers || 0,
        },
        {
            title: 'Campuses',
            color: 'text-green-700',
            value: data?.campusCount || 0,
        },
    ];

    const campuslist = React.useMemo(
        () =>
            Utils.sortStringAscending(
                data?.campusWorfForce.map(item => ({
                    ...item,
                    _id: item.campusId,
                    value: item.userCount,
                    title: item.campusName,
                })),
                'title'
            ),
        [data]
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

    useCustomBackNavigation({ targetRoute: '/more' });
    useScreenFocus({
        onFocus: globalSummaryRefetch,
    });

    return (
        <ErrorBoundary>
            <ViewWrapper scroll className="py-4">
                {isLoading || isFetching ? (
                    <FlatListSkeleton count={1} />
                ) : (
                    <View className="mx-1 p-2 flex-row flex-wrap gap-4 border rounded-xl items-center justify-evenly border-border">
                        {summaryList.map((item, index) => (
                            <View key={index} className="flex-col items-center flex-wrap justify-center my-1">
                                <Text className="">{item.title}</Text>
                                <Text className={cn('text-4xl font-bold', item.color)}>{item.value || 0}</Text>
                            </View>
                        ))}
                    </View>
                )}

                <View className="my-4 flex-row flex-wrap flex-1 gap-4">
                    {isLoading || isFetching ? (
                        <FlatListSkeleton count={6} />
                    ) : (
                        campuslist?.map((item, index) => (
                            <View className="flex-auto flex-grow">
                                <SmallCardComponent
                                    onPress={() => handlePress(item)}
                                    key={index}
                                    label={item.title}
                                    value={item.value}
                                />
                            </View>
                        ))
                    )}
                </View>
            </ViewWrapper>
            <If condition={isCampusPastor || isQcHOD || isGlobalPastor || isSuperAdmin}>
                <StaggerButtonComponent buttons={filteredButtons as unknown as any} />
            </If>
        </ErrorBoundary>
    );
};

export default GlobalWorkforceSummary;
