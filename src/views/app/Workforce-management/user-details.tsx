import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import moment from 'moment';
import { Center, HStack, Text, VStack } from 'native-base';
import React from 'react';
import AvatarComponent from '../../../components/atoms/avatar';
import CardComponent from '../../../components/composite/card';
import ViewWrapper from '../../../components/layout/viewWrapper';
import { AVATAR_FALLBACK_URL } from '../../../constants';
import { IUser } from '../../../store/types';

const UserDetails: React.FC<NativeStackScreenProps<ParamListBase>> = props => {
    const {
        lastName,
        firstName,
        status,
        pictureUrl,
        department,
        occupation,
        maritalStatus,
        birthDay,
        phoneNumber,
        email,
        address,
        gender,
        placeOfWork,
        nextOfKin,
        nextOfKinPhoneNo,
    } = props.route.params as IUser;

    return (
        <ViewWrapper scroll>
            <CardComponent mt={1} px={2} py={8} mx={3} mb={10}>
                <VStack space={4}>
                    <Center>
                        <AvatarComponent size="2xl" imageUrl={pictureUrl || AVATAR_FALLBACK_URL} />
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
                        <Text>{firstName}</Text>
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
                        <Text>{lastName}</Text>
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
                        <Text>{phoneNumber}</Text>
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
                        <Text>{email}</Text>
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
                        <Text>{status}</Text>
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
                        <Text>{gender}</Text>
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
                        <Text>{maritalStatus}</Text>
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
                        <Text>{moment(birthDay).format('Do MMMM')}</Text>
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
                        <Text>{department?.departmentName}</Text>
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
                        <Text>{occupation}</Text>
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
                        <Text>{placeOfWork}</Text>
                    </HStack>
                    <HStack
                        space={2}
                        pb={2}
                        w="full"
                        h="full"
                        flexWrap="wrap"
                        justifyContent="space-between"
                        borderBottomWidth={0.2}
                        borderColor="gray.300"
                    >
                        <Text alignSelf="flex-start" bold>
                            Address
                        </Text>
                        <Text>{address}</Text>
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
                            <Text>{nextOfKin}</Text>
                            <Text>{nextOfKinPhoneNo}</Text>
                        </VStack>
                    </HStack>
                </VStack>
            </CardComponent>
        </ViewWrapper>
    );
};

export default UserDetails;
