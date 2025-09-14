import { SafeAreaView, View } from 'react-native';
import React from 'react';
import { SmallCardComponent } from '@components/composite/card';
import ErrorBoundary from '@components/composite/error-boundary';
import { FlatListSkeleton } from '@components/layout/skeleton';
import ViewWrapper from '@components/layout/viewWrapper';
import useRole from '@hooks/role';
import { useGetGHCampusByIdQuery } from '@store/services/campus';
import Utils from '@utils/index';
import { router } from 'expo-router';

const GroupHeadCampuses: React.FC = () => {
    const handlePress = (elm: any) => {
        router.push({ pathname: '/group-head-campus/group-head-departments', params: elm });
    };

    const { user } = useRole();

    const { data, isLoading, isFetching } = useGetGHCampusByIdQuery(user.userId);

    const Departmentlist = React.useMemo(
        () =>
            Utils.sortStringAscending(
                data?.campuses.map(item => ({
                    ...item,
                    value: item.departmentCount,
                    _id: item.id,
                    title: item.campusName,
                })),
                'title'
            ),
        [data]
    );

    return (
        <ErrorBoundary>
            <ViewWrapper scroll>
                <SafeAreaView>
                    <View className="py-3 mb-8 flex flex-row flex-1 flex-wrap">
                        {isLoading || isFetching ? (
                            <FlatListSkeleton count={6} />
                        ) : (
                            <>
                                {Departmentlist?.map((item, index) => (
                                    <SmallCardComponent
                                        key={index}
                                        label={item.title}
                                        value={item.value}
                                        onPress={() => handlePress(item)}
                                    />
                                ))}
                            </>
                        )}
                    </View>
                </SafeAreaView>
            </ViewWrapper>
        </ErrorBoundary>
    );
};

export default GroupHeadCampuses;
