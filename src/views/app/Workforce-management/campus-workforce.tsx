import { ParamListBase, useNavigation } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Center, Heading, Stack, Text } from 'native-base';
import React from 'react';
import { StyleSheet } from 'react-native';
import { SmallCardComponent } from '../../../components/composite/card';
import ErrorBoundary from '../../../components/composite/error-boundary';
import { FlatListSkeleton, FlexListSkeleton } from '../../../components/layout/skeleton';
import ViewWrapper from '../../../components/layout/viewWrapper';
import useRole from '../../../hooks/role';
import { useGetCampusSummeryByCampusIdQuery } from '../../../store/services/account';

const CampusWorkforceSummary: React.FC<NativeStackScreenProps<ParamListBase>> = props => {
    const { navigate } = useNavigation();

    const handlePress = (elm: any) => {
        navigate('Workforce management' as never, elm as never);
    };

    const {
        user: { campus },
    } = useRole();
    const { data, isLoading, isSuccess, isFetching } = useGetCampusSummeryByCampusIdQuery(campus._id);

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

    const summeryList = [
        {
            title: 'Total',
            value: data?.totalUser || 0,
            color: 'purple.700',
        },
        {
            title: 'Active',
            value: data?.activeUser || 0,
            color: 'green.700',
        },
        {
            title: 'Dormant',
            value: data?.dormantUser || 0,
            color: 'orange.700',
        },
        {
            title: 'Inactive',
            value: data?.inactiveUser || 0,
            color: 'red.700',
        },
    ];

    const Departmentlist = data?.departmentCount.map(item => ({
        ...item,
        title: item.departmentName,
        value: item.userCount,
    }));

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
                        flexDirection="row"
                        alignItems="center"
                        padding={4}
                        my={6}
                        justifyItems="center"
                        justifyContent="space-between"
                        borderWidth={1}
                        borderRadius={8}
                        _dark={{ borderColor: 'gray.200' }}
                        _light={{ borderColor: 'gray.200' }}
                    >
                        {summeryList.map((item, index) => (
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

const style = StyleSheet.create({
    shadowProp: {
        shadowColor: '#171717',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
});

export default CampusWorkforceSummary;
