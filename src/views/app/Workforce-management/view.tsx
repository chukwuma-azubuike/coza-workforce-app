import { StyleSheet, TouchableHighlight, TouchableOpacity, View } from 'react-native';
import React from 'react';
import ErrorBoundary from '../../../components/composite/error-boundary';
import ViewWrapper from '../../../components/layout/viewWrapper';
import { Box, Center, Flex, HStack, Heading, Stack, Text, VStack } from 'native-base';
import CardComponent from '../../../components/composite/card';
import useRole from '../../../hooks/role';
import { useGetCampusSummeryByCampusIdQuery } from '../../../store/services/account';
const list = [
    {
        title: 'Total',
        value: '122',
        color: 'purple.700',
    },
    {
        title: 'Active',
        value: '320',
        color: 'green.700',
    },
    {
        title: 'Dormant',
        value: '430',
        color: 'orange.700',
    },
    {
        title: 'Inactive',
        value: '500',
        color: 'red.700',
    },
];

const campuslist = [
    {
        name: 'Campus',
        value: 'Lagos Campus',
    },
    {
        name: 'Departments',
        value: '19',
    },
];

const cardlist = [
    {
        title: 'Avalanche',
        value: '122',
        flex: 1,
    },
    {
        title: 'COZA Transfer Service',
        value: '320',
        flex: 0,
    },
    {
        title: 'Internship',
        value: '430',
        flex: 0,
    },
    {
        title: 'Photismos',
        value: '500',
        flex: 0,
    },
];
const Views = () => {
    const {
        user: { department, campus },
    } = useRole();
    const { data, isLoading, isSuccess, isFetching } = useGetCampusSummeryByCampusIdQuery({
        campusId: '641497441cbe4cc79e155179',
    });

    console.log('ssc', data);
    return (
        <ErrorBoundary>
            <ViewWrapper>
                {campuslist.map((item, index) => (
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
                    {list.map((item, index) => (
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
                        {cardlist.map((item, index) => (
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

export default Views;
