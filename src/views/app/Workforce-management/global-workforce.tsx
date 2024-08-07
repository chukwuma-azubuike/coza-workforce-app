import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Center, Heading, Stack, Text } from 'native-base';
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
import Utils from '@utils';
import useScreenFocus from '@hooks/focus';

const GlobalWorkforceSummary: React.FC<NativeStackScreenProps<ParamListBase>> = ({ navigation: { navigate } }) => {
    const handlePress = (elm: any) => {
        navigate('Campus workforce', elm);
    };

    const { isQcHOD, isSuperAdmin, isGlobalPastor, isInternshipHOD, isCampusPastor } = useRole();

    const { data, isLoading, isFetching, refetch: globalSummaryRefetch } = useGetGlobalWorkForceSummaryQuery();

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
        // {
        //     title: 'Inactive',
        //     color: 'red.700',
        //     value: data?.inactiveUser || 0,
        // },
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

    const gotoCreateWorker = () => {
        navigate('Create User');
    };

    const gotoCreateCampus = () => {
        navigate('Create Campus');
    };

    const gotoCreateDepartment = () => {
        navigate('Create Department');
    };

    const allButtons = [
        {
            color: 'blue.400',
            iconType: 'ionicon',
            iconName: 'person-outline',
            handleClick: gotoCreateWorker,
        },
        {
            color: 'blue.600',
            iconType: 'ionicon',
            iconName: 'people-outline',
            handleClick: gotoCreateDepartment,
        },
        {
            color: 'blue.800',
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

    useCustomBackNavigation({ targetRoute: 'More' });
    useScreenFocus({
        onFocus: globalSummaryRefetch,
    });

    return (
        <ErrorBoundary>
            <ViewWrapper scroll>
                {isLoading || isFetching ? (
                    <FlatListSkeleton count={1} />
                ) : (
                    <Stack
                        my={2}
                        mx={2}
                        padding={4}
                        flexWrap="wrap"
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
            <If condition={isCampusPastor || isQcHOD || isGlobalPastor || isSuperAdmin}>
                <StaggerButtonComponent buttons={filteredButtons as unknown as any} />
            </If>
        </ErrorBoundary>
    );
};

export default GlobalWorkforceSummary;
