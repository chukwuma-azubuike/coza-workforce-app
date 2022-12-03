import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HStack, Text, VStack } from 'native-base';
import React from 'react';
import ButtonComponent from '../../../components/atoms/button';
import StatusTag from '../../../components/atoms/status-tag';
import TextAreaComponent from '../../../components/atoms/text-area';
import CardComponent from '../../../components/composite/card';
import If from '../../../components/composite/if-container';
import ViewWrapper from '../../../components/layout/viewWrapper';
import { IPermission } from '../../../store/types';
import Utils from '../../../utils';

const PermissionDetails: React.FC<
    NativeStackScreenProps<ParamListBase>
> = props => {
    const {
        requestor: { firstName, lastName, pictureUrl, department },
        startDate,
        endDate,
        description,
        dateCreated,
        status,
        comment,
        category,
    } = props.route.params as IPermission;

    return (
        <ViewWrapper scroll>
            <CardComponent mt={1} p={4} mx={4}>
                <VStack space={4}>
                    <HStack
                        space={2}
                        pb={2}
                        w="full"
                        justifyContent="space-between"
                        borderBottomWidth={0.2}
                        borderColor="gray.300"
                    >
                        <Text alignSelf="flex-start" bold>
                            Requester
                        </Text>
                        <Text>{`${firstName} ${lastName}`}</Text>
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
                            Submitted
                        </Text>
                        <Text>{dateCreated}</Text>
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
                            Category
                        </Text>
                        <Text>{Utils.capitalizeFirstChar(category)}</Text>
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
                            Date Requested
                        </Text>
                        <Text>{`${startDate}  to  ${endDate}`}</Text>
                    </HStack>
                    <VStack
                        space={2}
                        pb={2}
                        w="full"
                        justifyContent="space-between"
                        borderBottomWidth={0.2}
                        borderColor="gray.300"
                    >
                        <Text alignSelf="flex-start" bold>
                            Description
                        </Text>
                        <TextAreaComponent isDisabled value={description} />
                    </VStack>
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
                        <StatusTag>{status}</StatusTag>
                    </HStack>
                    <VStack
                        pb={2}
                        w="full"
                        space={2}
                        justifyContent="space-between"
                    >
                        <Text alignSelf="flex-start" bold>
                            HOD / AHOD Comment
                        </Text>
                        <TextAreaComponent
                            value={comment}
                            isDisabled={status !== 'PENDING'}
                        />
                    </VStack>
                    <If condition={status === 'PENDING'}>
                        <HStack space={4} justifyContent="space-between">
                            <ButtonComponent secondary size="md" width={150}>
                                Decline
                            </ButtonComponent>
                            <ButtonComponent size="md" width={150}>
                                Accept
                            </ButtonComponent>
                        </HStack>
                    </If>
                </VStack>
            </CardComponent>
        </ViewWrapper>
    );
};

export default PermissionDetails;
