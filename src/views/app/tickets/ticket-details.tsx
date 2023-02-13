import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HStack, Text, VStack } from 'native-base';
import React from 'react';
import ButtonComponent from '../../../components/atoms/button';
import TextAreaComponent from '../../../components/atoms/text-area';
import CardComponent from '../../../components/composite/card';
import If from '../../../components/composite/if-container';
import ViewWrapper from '../../../components/layout/viewWrapper';
import useRole from '../../../hooks/role';
import { ITicket } from '../../../store/types';
import Utils from '../../../utils';

const TicketDetails: React.FC<NativeStackScreenProps<ParamListBase>> = props => {
    const {
        remarks,
        category,
        dateCreated,
        contestComment,
        contestReplyComment,
        _id,
        status,
        ticketSummary,
        isRetracted,
        ticketType,
        createdAt,
        department,
        user: { firstName, lastName },
    } = props.route.params as ITicket;

    const { isQC } = useRole();

    return (
        <ViewWrapper scroll>
            <CardComponent mt={1} px={2} py={8} mx={3} mb={10}>
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
                            Date
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
                            Department
                        </Text>
                        <Text>{department.departmentName}</Text>
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
                            Ticket type
                        </Text>
                        <Text>{Utils.capitalizeFirstChar(ticketType)}</Text>
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
                            Offender
                        </Text>
                        <Text>
                            {ticketType === 'INDIVIDUAL' ? `${firstName} ${lastName}` : `${department.departmentName}`}
                        </Text>
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
                            Details
                        </Text>
                        <Text>{ticketSummary}</Text>
                    </HStack>

                    <VStack space={2} pb={2} w="full" justifyContent="space-between">
                        <Text alignSelf="flex-start" bold>
                            Contest Comment
                        </Text>
                        <TextAreaComponent isDisabled={status !== 'ISSUED'} value={contestComment} />
                    </VStack>
                    <VStack space={2} pb={2} w="full" justifyContent="space-between">
                        <Text alignSelf="flex-start" bold>
                            Contest Reply
                        </Text>
                        <TextAreaComponent isDisabled={!isQC} value={contestReplyComment} />
                    </VStack>
                    <If condition={status === 'ISSUED'}>
                        <HStack space={4} justifyContent="space-between">
                            <ButtonComponent secondary size="md" width={150}>
                                Dispute
                            </ButtonComponent>
                            <ButtonComponent size="md" width={150}>
                                Acknowledge
                            </ButtonComponent>
                        </HStack>
                    </If>
                </VStack>
            </CardComponent>
        </ViewWrapper>
    );
};

export default TicketDetails;
