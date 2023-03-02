import { ParamListBase, useNavigation } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import moment from 'moment';
import { HStack, Text, VStack } from 'native-base';
import React from 'react';
import ButtonComponent from '../../../components/atoms/button';
import StatusTag from '../../../components/atoms/status-tag';
import TextAreaComponent from '../../../components/atoms/text-area';
import CardComponent from '../../../components/composite/card';
import If from '../../../components/composite/if-container';
import ViewWrapper from '../../../components/layout/viewWrapper';
import useScreenFocus from '../../../hooks/focus';
import useModal from '../../../hooks/modal/useModal';
import useRole from '../../../hooks/role';
import {
    useContestTicketMutation,
    useGetTicketByIdQuery,
    useReplyContestTicketMutation,
    useRetractTicketMutation,
} from '../../../store/services/tickets';
import { ITicket } from '../../../store/types';

const TicketDetails: React.FC<NativeStackScreenProps<ParamListBase>> = props => {
    const { contestComment, _id, status, ticketSummary, isDepartment, isIndividual, createdAt } = props.route
        .params as ITicket;

    const {
        isQC,
        user: { userId, department },
    } = useRole();

    const { data: ticket, isLoading, refetch } = useGetTicketByIdQuery(_id);
    const [
        contestTicket,
        {
            isLoading: contestLoading,
            isSuccess: contestSuccess,
            isError: contestIsError,
            error: contestError,
            reset: contestReset,
        },
    ] = useContestTicketMutation();
    const [
        replyContest,
        {
            isLoading: replyLoading,
            isSuccess: replySuccess,
            isError: replyIsError,
            error: replyError,
            reset: resetReply,
        },
    ] = useReplyContestTicketMutation();
    const [
        retractTicket,
        {
            isLoading: retractLoading,
            isSuccess: retractSuccess,
            isError: retractIsError,
            error: retractError,
            reset: retractReset,
        },
    ] = useRetractTicketMutation();

    const [comment, setComment] = React.useState<string>();
    const [contestReplyComment, setContestReplyComment] = React.useState<string | undefined>(
        ticket?.contestReplyComment as string
    );

    const handleChange = (value: string) => {
        setComment(value);
    };
    const handleReplyChange = (value: string) => {
        setContestReplyComment(value);
    };

    const handleSubmit = () => {
        contestTicket({
            _id,
            userId,
            comment: comment as string,
        });
    };

    const handleReplySubmit = () => {
        replyContest({
            _id,
            userId,
            comment: contestReplyComment as string,
        });
    };

    const handleRetractTicket = () => {
        retractTicket(_id);
    };

    const handleAcknowledge = () => {};

    const { setModalState } = useModal();
    const navigate = useNavigation();

    React.useEffect(() => {
        if (contestSuccess) {
            setModalState({
                message: 'Contest submitted',
                status: 'success',
            });
            contestReset();
            navigate.goBack();
        }

        if (contestIsError) {
            setModalState({
                message: contestError.data,
                status: 'error',
            });
        }
    }, [contestSuccess, contestIsError]);

    React.useEffect(() => {
        if (replySuccess) {
            setModalState({
                message: 'Reply submitted',
                status: 'success',
            });
            resetReply();
            navigate.goBack();
        }

        if (replyIsError) {
            setModalState({
                message: replyError.data,
                status: 'error',
            });
        }
    }, [replySuccess, replyIsError]);

    React.useEffect(() => {
        if (retractSuccess) {
            setModalState({
                message: 'Successfully retracted',
                status: 'success',
            });
            retractReset();
            navigate.goBack();
        }

        if (retractIsError) {
            setModalState({
                message: retractError.data,
                status: 'error',
            });
        }
    }, [retractSuccess, retractIsError]);

    useScreenFocus({
        onFocus: () => {
            refetch();
            setContestReplyComment(ticket?.contestReplyComment);
        },
    });

    return (
        <ViewWrapper scroll refreshing={isLoading} onRefresh={refetch}>
            <CardComponent isLoading={isLoading} mt={1} px={2} py={8} mx={3} mb={10}>
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
                        <Text>{moment(createdAt).format('Do MMMM YYYY')}</Text>
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
                        <Text>{ticket?.department.departmentName}</Text>
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
                        <Text>{isDepartment ? 'Departmental' : 'Individual'}</Text>
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
                        <StatusTag>{status}</StatusTag>
                    </HStack>

                    {isIndividual && (
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
                            <Text>{ticket?.category.categoryName}</Text>
                        </HStack>
                    )}

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
                            {isIndividual
                                ? `${ticket?.user?.firstName} ${ticket?.user?.lastName}`
                                : `${ticket?.department?.departmentName}`}
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
                        <TextAreaComponent
                            value={contestComment}
                            onChangeText={handleChange}
                            isDisabled={status !== 'ISSUED'}
                        />
                    </VStack>
                    <VStack space={2} pb={2} w="full" justifyContent="space-between">
                        <Text alignSelf="flex-start" bold>
                            Quality Control Reply
                        </Text>
                        <TextAreaComponent
                            value={contestReplyComment}
                            onChangeText={handleReplyChange}
                            isDisabled={!isQC || userId === ticket?.user?._id || !!ticket?.contestReplyComment}
                        />
                    </VStack>
                    <If condition={userId === ticket?.user?._id || ticket?.department?._id === department?._id}>
                        <HStack space={4} justifyContent="space-between">
                            <ButtonComponent
                                size="md"
                                secondary
                                width={150}
                                onPress={handleSubmit}
                                isLoading={contestLoading}
                                isDisabled={!comment || status === 'ACKNOWLEGDED' || status === 'CONTESTED'}
                            >
                                Contest ticket
                            </ButtonComponent>
                            <ButtonComponent
                                size="md"
                                width={150}
                                onPress={handleAcknowledge}
                                isDisabled={status === 'ACKNOWLEGDED'}
                            >
                                Acknowledge
                            </ButtonComponent>
                        </HStack>
                    </If>
                    <If condition={isQC && userId !== ticket?.user?._id}>
                        <HStack space={4} justifyContent="space-between">
                            <ButtonComponent
                                size="md"
                                secondary
                                width={150}
                                isLoading={retractLoading}
                                onPress={handleRetractTicket}
                            >
                                Retract
                            </ButtonComponent>
                            <ButtonComponent
                                size="md"
                                width={150}
                                isLoading={replyLoading}
                                onPress={handleReplySubmit}
                                isDisabled={status !== 'CONTESTED' || !contestReplyComment}
                            >
                                Reply
                            </ButtonComponent>
                        </HStack>
                    </If>
                </VStack>
            </CardComponent>
        </ViewWrapper>
    );
};

export default TicketDetails;
