import { ParamListBase, useNavigation } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Center, Heading, Stack, Text } from 'native-base';
import React from 'react';
import { SmallCardComponent } from '../../../components/composite/card';
import ErrorBoundary from '../../../components/composite/error-boundary';
import { FlatListSkeleton, FlexListSkeleton } from '../../../components/layout/skeleton';
import ViewWrapper from '../../../components/layout/viewWrapper';
import { useCustomBackNavigation } from '../../../hooks/navigation';
import useRole from '../../../hooks/role';
import { useGetCampusSummaryByCampusIdQuery } from '../../../store/services/account';

const GlobalWorkforceSummary: React.FC<NativeStackScreenProps<ParamListBase>> = props => {
    const { navigate } = useNavigation();

    const handlePress = (elm: any) => {
        navigate('Workforce management' as never, elm as never);
    };

    const {
        user: { campus },
    } = useRole();

    const { data, isLoading, isSuccess, isFetching } = useGetCampusSummaryByCampusIdQuery(campus._id);

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
            color: 'purple.700',
            value: data?.totalUser || 0,
        },
        {
            title: 'Active',
            color: 'green.700',
            value: data?.activeUser || 0,
        },
        {
            title: 'Dormant',
            color: 'orange.700',
            value: data?.dormantUser || 0,
        },
        {
            title: 'Inactive',
            color: 'red.700',
            value: data?.inactiveUser || 0,
        },
    ];

    const Departmentlist = React.useMemo(
        () =>
            data?.departmentCount.map(item => ({
                ...item,
                _id: item.departmentId,
                value: item.userCount,
                title: item.departmentName,
            })),
        [data]
    );

    useCustomBackNavigation({ targetRoute: 'More' });

    return (
        <ErrorBoundary>
            <ViewWrapper scroll>
                {campusInfo.map((item, index) =>
                    isLoading || isFetching ? (
                        <FlexListSkeleton count={1} />
                    ) : (
                        <Stack key={index} ml={4} flexDirection="row" alignItems="center" justifyItems="center" my={2}>
                            <Heading size="sm" _dark={{ color: 'gray.300' }} _light={{ color: 'gray.700' }}>
                                {item.name}
                            </Heading>
                            <Text
                                ml="12"
                                flexWrap="wrap"
                                fontWeight="400"
                                _dark={{ color: 'gray.400' }}
                                _light={{ color: 'gray.600' }}
                            >
                                {item.value}
                            </Text>
                        </Stack>
                    )
                )}

                {isLoading || isFetching ? (
                    <FlatListSkeleton count={1} />
                ) : (
                    <Stack
                        my={6}
                        padding={4}
                        borderWidth={1}
                        borderRadius={8}
                        flexDirection="row"
                        alignItems="center"
                        justifyItems="center"
                        justifyContent="space-between"
                        _dark={{ borderColor: 'gray.200' }}
                        _light={{ borderColor: 'gray.200' }}
                    >
                        {summaryList.map((item, index) => (
                            <Stack key={index} flexDirection="column" alignItems="center" justifyItems="center" my={2}>
                                <Heading
                                    size="xs"
                                    fontWeight="400"
                                    _dark={{ color: item.color }}
                                    _light={{ color: item.color }}
                                >
                                    {item.title}
                                </Heading>
                                <Heading size="xl" _dark={{ color: item.color }} _light={{ color: item.color }}>
                                    {item.value || 0}
                                </Heading>
                            </Stack>
                        ))}
                    </Stack>
                )}

                <Center>
                    <Stack py={3} flexDirection="row" flex={1} flexWrap="wrap">
                        {isLoading || isFetching ? (
                            <FlatListSkeleton count={6} />
                        ) : (
                            <>
                                {Departmentlist?.map((item, index) => (
                                    <SmallCardComponent
                                        onPress={() => handlePress(item)}
                                        key={index}
                                        label={item.title}
                                        value={item.value}
                                    />
                                ))}
                            </>
                        )}
                    </Stack>
                </Center>
            </ViewWrapper>
        </ErrorBoundary>
    );
};

export default GlobalWorkforceSummary;
