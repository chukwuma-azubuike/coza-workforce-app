import { Text } from '~/components/ui/text';
import { View } from 'react-native';
import { ParamListBase, useNavigation } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Heading } from 'native-base';
import React from 'react';
import { SmallCardComponent } from '@components/composite/card';
import ErrorBoundary from '@components/composite/error-boundary';
import { FlatListSkeleton, FlexListSkeleton } from '@components/layout/skeleton';
import ViewWrapper from '@components/layout/viewWrapper';
import useRole from '@hooks/role';
import Utils from '@utils/index';
import { useGetGHDepartmentByIdQuery } from '@store/services/department';
import useScreenFocus from '@hooks/focus';

const GroupHeadDepartments: React.FC<NativeStackScreenProps<ParamListBase>> = props => {
    const params = props.route.params as { _id?: string; title: string };
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
        navigate('Group Head Department Activities' as never, { ...elm, campusId, screenName } as never);
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
                        <View
                            key={index}
                            flexDirection="row"
                            alignItems="center"
                            justifyItems="center"
                            my={2}
                            className="px-2"
                        >
                            <Text
                                flexWrap="wrap"
                                fontWeight="400"
                                _dark={{ color: 'gray.400' }}
                                _light={{ color: 'gray.600' }}
                            >
                                {item.name}
                            </Text>
                            <Heading ml={4} size="sm" _dark={{ color: 'gray.300' }} _light={{ color: 'gray.700' }}>
                                {item.value}
                            </Heading>
                        </View>
                    )
                )}
                <View>
                    <View mb={4} flexDirection="row" flex={1} flexWrap="wrap" className="py-3">
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
