import { Text } from '~/components/ui/text';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { SmallCardComponent } from '@components/composite/card';
import ErrorBoundary from '@components/composite/error-boundary';
import { FlatListSkeleton, FlexListSkeleton } from '@components/layout/skeleton';
import ViewWrapper from '@components/layout/viewWrapper';
import useRole from '@hooks/role';
import Utils from '@utils/index';
import { useGetGHDepartmentByIdQuery } from '@store/services/department';
import useScreenFocus from '@hooks/focus';
import { router, useLocalSearchParams } from 'expo-router';

const GroupHeadDepartments: React.FC = props => {
    const params = useLocalSearchParams<{ _id?: string; title: string }>();
    const campusId = params?._id as string;

    const { navigate, setOptions } = useNavigation();

    const { user } = useRole();

    const { data, refetch, isLoading, isFetching, isSuccess } = useGetGHDepartmentByIdQuery({
        _id: user.userId,
        campusId,
    });

    useScreenFocus({
        onFocus: () => {
            setOptions({ title: params.title });
            refetch();
        },
    });

    const handlePress = (elm: any) => {
        const screenName = `${data?.campusName} - ${elm.title}`;
        router.push({
            pathname: '/group-head-campus/group-head-department-activities',
            params: { ...elm, campusId, screenName },
        });
    };

    const campusInfo = [
        {
            name: 'Campus',
            value: data?.campusName,
        },
        {
            name: 'Departments',
            value: data?.campuses.length,
        },
    ];

    const Departmentlist = React.useMemo(
        () =>
            Utils.sortStringAscending(
                data?.campuses
                    .filter(item => item !== null)
                    .map(item => ({
                        ...item,
                        value: item.userCount,
                        _id: item.id,
                        title: item.departmentName,
                    })),
                'title'
            ),
        [data]
    );

    return (
        <ErrorBoundary>
            <ViewWrapper scroll>
                {campusInfo.map((item, index) =>
                    isLoading || isFetching ? (
                        <FlexListSkeleton count={1} />
                    ) : (
                        <View key={index} className="px-2 flex-row items-center justify-center my-4">
                            <Text className="flex-wrap font-semibold text-muted-foreground">{item.name}</Text>
                            <Text className="flex-wrap text-base font-semibold text-muted-foreground ml-8">
                                {item.value}
                            </Text>
                        </View>
                    )
                )}
                <View>
                    <View className="py-3 mb-8 flex-row flex-1 flex-wrap">
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
                </View>
            </ViewWrapper>
        </ErrorBoundary>
    );
};

export default GroupHeadDepartments;
