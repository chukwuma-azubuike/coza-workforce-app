import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import moment from 'moment';
import { Center, HStack, Text, VStack } from 'native-base';
import React from 'react';
import AvatarComponent from '../../../components/atoms/avatar';
import StatusTag from '../../../components/atoms/status-tag';
import CardComponent from '../../../components/composite/card';
import ViewWrapper from '../../../components/layout/viewWrapper';
import { AVATAR_FALLBACK_URL } from '../../../constants';
import { useGetUserByIdQuery } from '../../../store/services/account';
import { IUser } from '../../../store/types';

const UserDetails: React.FC<NativeStackScreenProps<ParamListBase>> = props => {
    const { _id } = props.route.params as IUser;

    const { data, isLoading, isFetching, refetch } = useGetUserByIdQuery(_id);

    return (
        <ViewWrapper scroll onRefresh={refetch} refreshing={isFetching}>
            <CardComponent isLoading={isLoading || isFetching} mt={1} px={2} py={8} mx={3} mb={10}>
                <VStack space={4}>
                    <Center>
                        <AvatarComponent size="2xl" imageUrl={data?.pictureUrl || AVATAR_FALLBACK_URL} />
                    </Center>
                    <HStack
                        space={2}
                        pb={2}
                        w="full"
                        justifyContent="space-between"
                        borderBottomWidth={0.2}
                        borderColor="gray.300"
                    >
                        <Text alignSelf="flex-start" bold>
                            First name
                        </Text>
                        <Text>{data?.firstName}</Text>
                    </HStack>
                    <HStack
                        space={2}
                        pb={2}
                        w="full"
                        justifyContent="space-between"
                        borderBottomWidth={0.2}
                        borderColor="gray.300"
                    >
                        <Text alignSelf="flex-start" bold>
                            Last name
                        </Text>
                        <Text>{data?.lastName}</Text>
                    </HStack>

                    <HStack
                        space={2}
                        pb={2}
                        w="full"
                        justifyContent="space-between"
                        borderBottomWidth={0.2}
                        borderColor="gray.300"
                    >
                        <Text alignSelf="flex-start" bold>
                            Phone number
                        </Text>
                        <Text>{data?.phoneNumber}</Text>
                    </HStack>

                    <HStack
                        space={2}
                        pb={2}
                        w="full"
                        flexWrap="wrap"
                        justifyContent="space-between"
                        borderBottomWidth={0.2}
                        borderColor="gray.300"
                    >
                        <Text alignSelf="flex-start" bold>
                            Email
                        </Text>
                        <Text>{data?.email}</Text>
                    </HStack>

                    <HStack
                        space={2}
                        pb={2}
                        w="full"
                        flexWrap="wrap"
                        justifyContent="space-between"
                        borderBottomWidth={0.2}
                        borderColor="gray.300"
                    >
                        <Text alignSelf="flex-start" bold>
                            Address
                        </Text>
                        <Text>{data?.address}</Text>
                    </HStack>

                    <HStack
                        space={2}
                        pb={2}
                        w="full"
                        justifyContent="space-between"
                        borderBottomWidth={0.2}
                        borderColor="gray.300"
                    >
                        <Text alignSelf="flex-start" bold>
                            Status
                        </Text>
                        <StatusTag>{data?.status || 'ACTIVE'}</StatusTag>
                    </HStack>
                    <HStack
                        space={2}
                        pb={2}
                        w="full"
                        justifyContent="space-between"
                        borderBottomWidth={0.2}
                        borderColor="gray.300"
                    >
                        <Text alignSelf="flex-start" bold>
                            Gender
                        </Text>
                        <Text>{data?.gender}</Text>
                    </HStack>

                    <HStack
                        space={2}
                        pb={2}
                        w="full"
                        justifyContent="space-between"
                        borderBottomWidth={0.2}
                        borderColor="gray.300"
                    >
                        <Text alignSelf="flex-start" bold>
                            Marital Status
                        </Text>
                        <Text>{data?.maritalStatus}</Text>
                    </HStack>

                    <HStack
                        space={2}
                        pb={2}
                        w="full"
                        justifyContent="space-between"
                        borderBottomWidth={0.2}
                        borderColor="gray.300"
                    >
                        <Text alignSelf="flex-start" bold>
                            Birthday
                        </Text>
                        <Text>{moment(data?.birthDay).format('Do MMMM')}</Text>
                    </HStack>
                    <HStack
                        space={2}
                        pb={2}
                        w="full"
                        flexWrap="wrap"
                        justifyContent="space-between"
                        borderBottomWidth={0.2}
                        borderColor="gray.300"
                    >
                        <Text alignSelf="flex-start" bold>
                            Department
                        </Text>
                        <Text>{data?.department?.departmentName}</Text>
                    </HStack>
                    <HStack
                        space={2}
                        pb={2}
                        w="full"
                        flexWrap="wrap"
                        justifyContent="space-between"
                        borderBottomWidth={0.2}
                        borderColor="gray.300"
                    >
                        <Text flexWrap="wrap" alignSelf="flex-start" bold>
                            Occupation
                        </Text>
                        <Text>{data?.occupation}</Text>
                    </HStack>
                    <HStack
                        space={2}
                        pb={2}
                        w="full"
                        flexWrap="wrap"
                        justifyContent="space-between"
                        borderBottomWidth={0.2}
                        borderColor="gray.300"
                    >
                        <Text alignSelf="flex-start" bold>
                            Place of work
                        </Text>
                        <Text>{data?.placeOfWork}</Text>
                    </HStack>
                    <HStack
                        space={2}
                        pb={2}
                        w="full"
                        justifyContent="space-between"
                        borderBottomWidth={0.2}
                        borderColor="gray.300"
                    >
                        <Text alignSelf="flex-start" bold>
                            Next of Kin
                        </Text>
                        <VStack>
                            <Text>{data?.nextOfKin}</Text>
                            <Text>{data?.nextOfKinPhoneNo}</Text>
                        </VStack>
                    </HStack>
                </VStack>
            </CardComponent>
        </ViewWrapper>
    );
};

export default UserDetails;
