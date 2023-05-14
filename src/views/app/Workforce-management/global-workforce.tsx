import { Center, Heading, Stack, Text, VStack } from 'native-base';
import React from 'react';
import { StyleSheet } from 'react-native';
import ErrorBoundary from '../../../components/composite/error-boundary';
import ViewWrapper from '../../../components/layout/viewWrapper';
import useRole from '../../../hooks/role';
import { useGetCampusSummeryByCampusIdQuery } from '../../../store/services/account';
import { ParamListBase, useNavigation } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import useScreenFocus from '../../../hooks/focus';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

const GlobalWorkforceSummary: React.FC<NativeStackScreenProps<ParamListBase>> = props => {
    const navigation = useNavigation();

    const handlePress = (elm: any) => {
        navigation.navigate('Workforce' as never, elm as never);
    };

    const {
        user: { department, campus },
        isHOD,
        isAHOD,
        isCampusPastor,
        isGlobalPastor,
        isQC,
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
            value: data?.totalUser,
            color: 'purple.700',
        },
        {
            title: 'Active',
            value: data?.activeUser,
            color: 'green.700',
        },
        {
            title: 'Dormant',
            value: data?.dormantUser,
            color: 'orange.700',
        },
        {
            title: 'Inactive',
            value: data?.inactiveUser,
            color: 'red.700',
        },
    ];

    const Departmentlist = data?.departmentCount.map((item, index) => ({
        ...item,
        title: item.departmentName,
        value: item.userCount,
        flex: index % 2 === 0 ? 1 : 0, // set flex to 1 for even index and 0 for odd index
    }));

    const handleRoleRoute = () => {
        if (isHOD || isAHOD) {
            navigation('Workforce');
        }
    };

    useScreenFocus({
        onFocus: handleRoleRoute,
    });

    return (
        <ErrorBoundary>
            <ViewWrapper scroll>
                {campusInfo.map((item, index) => (
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
                ))}

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
                                {item.value}
                            </Heading>
                        </Stack>
                    ))}
                </Stack>
                <Center>
                    <Stack
                        flexDirection="row"
                        alignItems="stretch"
                        flexWrap={'wrap'}
                        padding={4}
                        justifyItems="center"
                        w="full"
                        justifyContent="space-between"
                    >
                        {Departmentlist?.map((item, index) => (
                            <Stack
                                key={index}
                                px="2"
                                flexDirection="column"
                                alignItems="center"
                                justifyItems="center"
                                my={2}
                                w="1/2"
                            >
                                <VStack
                                    space="2"
                                    w="full"
                                    style={style.shadowProp}
                                    bg="white"
                                    borderRadius={3}
                                    flex={item.flex}
                                    justifyContent="center"
                                >
                                    <TouchableOpacity activeOpacity={0.6} onPress={() => handlePress(item)}>
                                        <Stack
                                            space="1"
                                            flexDirection="column"
                                            alignItems="center"
                                            justifyItems="center"
                                            p={3}
                                        >
                                            <Heading
                                                size="xs"
                                                fontWeight="500"
                                                _dark={{ color: 'white' }}
                                                _light={{ color: 'black' }}
                                                textAlign="center"
                                            >
                                                {item.title}
                                            </Heading>
                                            <Heading size="md" _dark={{ color: 'white' }} _light={{ color: 'black' }}>
                                                {item.value}
                                            </Heading>
                                        </Stack>
                                    </TouchableOpacity>
                                </VStack>
                            </Stack>
                        ))}
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

export default GlobalWorkforceSummary;
