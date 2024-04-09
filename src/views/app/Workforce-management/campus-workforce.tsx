import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Center, Heading, Stack } from 'native-base';
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
import HStackComponent from '@components/layout/h-stack';
import TextComponent from '@components/text';
import useAppColorMode from '@hooks/theme/colorMode';
import { View } from 'react-native';

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
        onFocus: () => {
            campusSummaryIsUninitialized && campusSummaryRefetch();
            campusUsersIsUninitialized && campusSummaryRefetch();
        },
    });

    const handleUserPress = (user: IUser) => {
        navigate('User Profile', user);
    };

    const { textColor } = useAppColorMode();

    return (
        <ErrorBoundary>
            <DynamicSearch
                data={campusUsers}
                onPress={handleUserPress}
                loading={isLoadingUsers || isLoadingUsers}
                searchFields={['firstName', 'lastName', 'departmentName', 'email']}
            />
            <ViewWrapper scroll>
                {campusInfo.map((item, index) =>
                    isLoading || isFetching ? (
                        <FlexListSkeleton count={1} />
                    ) : (
                        <HStackComponent
                            key={index}
                            style={{
                                marginVertical: 12,
                                paddingHorizontal: 6,
                                justifyContent: 'flex-start',
                            }}
                        >
                            <TextComponent>{item.name}</TextComponent>
                            <TextComponent bold size="lg" style={{ marginLeft: 10 }}>
                                {item.value}
                            </TextComponent>
                        </HStackComponent>
                    )
                )}

                {isLoading || isFetching ? (
                    <FlatListSkeleton count={1} />
                ) : (
                    <HStackComponent
                        style={{
                            marginVertical: 16,
                            padding: 8,
                            flex: 1,
                            width: '100%',
                            borderWidth: 0.4,
                            borderRadius: 8,
                            borderColor: textColor,
                        }}
                    >
                        {summaryList.map((item, index) => (
                            <View
                                key={index}
                                style={{
                                    flex: 1,
                                    width: '100%',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginVertical: 2,
                                }}
                            >
                                <TextComponent size="lg">{item.title}</TextComponent>
                                <Heading size="xl" _dark={{ color: item.color }} _light={{ color: item.color }}>
                                    {item.value || 0}
                                </Heading>
                            </View>
                        ))}
                    </HStackComponent>
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
            <If condition={isCampusPastor || isQcHOD || isGlobalPastor || isSuperAdmin || isInternshipHOD}>
                <StaggerButtonComponent buttons={filteredButtons as unknown as any} />
            </If>
        </ErrorBoundary>
    );
};

export default CampusWorkforceSummary;
