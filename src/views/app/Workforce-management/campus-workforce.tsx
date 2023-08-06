import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Center, Heading, Stack, Text } from 'native-base';
import React from 'react';
import { SmallCardComponent } from '../../../components/composite/card';
import ErrorBoundary from '../../../components/composite/error-boundary';
import If from '../../../components/composite/if-container';
import StaggerButtonComponent from '../../../components/composite/stagger';
import { FlatListSkeleton, FlexListSkeleton } from '../../../components/layout/skeleton';
import ViewWrapper from '../../../components/layout/viewWrapper';
import { useCustomBackNavigation } from '../../../hooks/navigation';
import useRole from '../../../hooks/role';
import { useGetCampusSummaryByCampusIdQuery } from '../../../store/services/account';
import Utils from '../../../utils';
import useScreenFocus from '../../../hooks/focus';

const CampusWorkforceSummary: React.FC<NativeStackScreenProps<ParamListBase>> = props => {
    const params = props.route.params as { _id?: string };
    const campusId = params?._id;

    const {
        navigation: { navigate },
    } = props;

    const handlePress = (elm: any) => {
        navigate('Workforce management', { ...elm, campusId });
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
    } = useGetCampusSummaryByCampusIdQuery(campusId || campus._id);

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
            Utils.sortStringAscending(
                data?.departmentCount.map(item => ({
                    ...item,
                    value: item.userCount,
                    _id: item.departmentId,
                    title: item.departmentName,
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

    useCustomBackNavigation({ targetRoute: isGlobalPastor || isSuperAdmin ? 'Global workforce' : 'More' });
    useScreenFocus({
        onFocus: campusSummaryRefetch,
    });

    return (
        <ErrorBoundary>
            <ViewWrapper scroll>
                {campusInfo.map((item, index) =>
                    isLoading || isFetching ? (
                        <FlexListSkeleton count={1} />
                    ) : (
                        <Stack key={index} flexDirection="row" alignItems="center" justifyItems="center" my={2} px={2}>
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
                        </Stack>
                    )
                )}

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
                    <Stack py={3} mb={4} flexDirection="row" flex={1} flexWrap="wrap">
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
                    </Stack>
                </Center>
            </ViewWrapper>
            <If condition={isCampusPastor || isQcHOD || isGlobalPastor || isSuperAdmin}>
                <StaggerButtonComponent buttons={filteredButtons as unknown as any} />
            </If>
        </ErrorBoundary>
    );
};

export default CampusWorkforceSummary;
