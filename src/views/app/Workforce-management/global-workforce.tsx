import { ParamListBase, useNavigation } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Center, Heading, Stack, Text } from 'native-base';
import React from 'react';
import { SmallCardComponent } from '../../../components/composite/card';
import ErrorBoundary from '../../../components/composite/error-boundary';
import { FlatListSkeleton } from '../../../components/layout/skeleton';
import ViewWrapper from '../../../components/layout/viewWrapper';
import { useCustomBackNavigation } from '../../../hooks/navigation';
import useRole from '../../../hooks/role';
import { useGetGlobalWorkForceSummaryQuery } from '../../../store/services/account';
import Utils from '../../../utils';

const GlobalSummary: React.FC<{ title: string; value: string | number }> = ({ title, value }) => {
    return (
        <Stack ml={4} flexDirection="row" alignItems="center" justifyItems="center" my={2}>
            <Heading size="sm" _dark={{ color: 'gray.300' }} _light={{ color: 'gray.700' }}>
                {title}
            </Heading>
            <Text ml="12" flexWrap="wrap" fontWeight="400" _dark={{ color: 'gray.400' }} _light={{ color: 'gray.600' }}>
                {value}
            </Text>
        </Stack>
    );
};

const GlobalWorkforceSummary: React.FC<NativeStackScreenProps<ParamListBase>> = props => {
    const { navigate } = useNavigation();

    const handlePress = (elm: any) => {
        navigate('Campus workforce' as never, elm as never);
    };

    const { data, isLoading, isFetching } = useGetGlobalWorkForceSummaryQuery();

    const summaryList = [
        {
            title: 'Active',
            color: 'purple.700',
            value: data?.activeUser || 0,
        },
        {
            title: 'Campuses',
            color: 'green.700',
            value: data?.campusCount || 0,
        },
        {
            title: 'Blacklisted',
            color: 'orange.700',
            value: data?.blacklistedUsers || 0,
        },
        {
            title: 'Inactive',
            color: 'red.700',
            value: data?.inactiveUser || 0,
        },
        {
            title: 'Unregistered',
            color: 'gray.400',
            value: data?.UnregisteredUsers || 0,
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

    useCustomBackNavigation({ targetRoute: 'More' });

    return (
        <ErrorBoundary>
            <ViewWrapper scroll>
                {isLoading || isFetching ? (
                    <FlatListSkeleton count={1} />
                ) : (
                    <Stack
                        my={6}
                        mx={2}
                        padding={4}
                        borderWidth={1}
                        borderRadius={8}
                        flexDirection="row"
                        alignItems="center"
                        justifyItems="center"
                        justifyContent="space-between"
                        _dark={{ borderColor: 'gray.600' }}
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
                    <Stack py={3} mb={6} flexDirection="row" flex={1} flexWrap="wrap">
                        {isLoading || isFetching ? (
                            <FlatListSkeleton count={6} />
                        ) : (
                            <>
                                {campuslist?.map((item, index) => (
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
