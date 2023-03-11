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
    useUpdateTicketMutation,
} from '../../../store/services/tickets';
import { ICreateTicketPayload, ITicket } from '../../../store/types';

const TicketDetails: React.FC<NativeStackScreenProps<ParamListBase>> = props => {
    const { contestComment, _id, status, isDepartment, isIndividual, createdAt } = props.route.params as ITicket;

    const {
        isQC,
        isHOD,
        isAHOD,
        user: { userId, department },
    } = useRole();

    const { data: ticket, isFetching, isLoading, refetch, isSuccess, isError } = useGetTicketByIdQuery(_id);
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

    const [
        acknowledgeTicket,
        {
            isSuccess: acknowledgeIsSuccess,
            isLoading: acknowledgeLoading,
            isError: acknowledgeIsError,
            reset: acknowledgeReset,
            error: acknowledgeError,
        },
    ] = useUpdateTicketMutation();

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

    const handleAcknowledge = () => {
        acknowledgeTicket({
            ...ticket,
            status: 'ACKNOWLEGDED',
        } as ICreateTicketPayload);
    };

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
                message: contestError?.data?.message,
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
                message: replyError?.data?.message,
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
                message: retractError?.data?.message,
                status: 'error',
            });
        }
    }, [retractSuccess, retractIsError]);

    React.useEffect(() => {
        if (acknowledgeIsSuccess) {
            setModalState({
                message: 'Ticket acknowledged',
                status: 'success',
            });
            acknowledgeReset();
            navigate.goBack();
        }

        if (acknowledgeIsError) {
            setModalState({
                message: acknowledgeError?.data,
                status: 'error',
            });
        }
    }, [acknowledgeIsSuccess, acknowledgeIsError]);

    useScreenFocus({
        onFocus: () => {
            refetch();
            setContestReplyComment(ticket?.contestReplyComment);
        },
    });

    const qcAction = React.useMemo(() => {
        if (isQC && userId === ticket?.user?._id) return false;
        if (!isQC) return false;

        return true;
    }, [isQC, userId, ticket?.user?._id]);

    const offenderAction = React.useMemo(() => {
        if (userId === ticket?.user?._id) return true;
        if (ticket?.department?._id === department?._id && ticket?.isDepartment) return true;

        return false;
    }, []);

    return (
        <ViewWrapper scroll refreshing={isLoading || isFetching} onRefresh={refetch}>
            <CardComponent isLoading={isLoading || isFetching} mt={1} px={2} py={8} mx={3} mb={10}>
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
                        flexWrap="wrap"
                        justifyContent="space-between"
                        borderBottomWidth={0.2}
                        borderColor="gray.300"
                    >
                        <Text alignSelf="flex-start" bold mb={1}>
                            Details
                        </Text>
                        <Text>{ticket?.ticketSummary}</Text>
                    </HStack>

                    <VStack space={2} pb={2} w="full" justifyContent="space-between">
                        <Text alignSelf="flex-start" bold>
                            Contest Comment
                        </Text>
                        <If condition={isIndividual}>
                            <TextAreaComponent
                                onChangeText={handleChange}
                                value={ticket?.contestComment}
                                isDisabled={status !== 'ISSUED'} // || ticket?.user?._id !== userId
                            />
                        </If>
                        <If condition={isDepartment}>
                            <TextAreaComponent
                                onChangeText={handleChange}
                                value={ticket?.contestComment}
                                isDisabled={status !== 'ISSUED' || ticket?.department?._id !== department?._id}
                            />
                        </If>
                    </VStack>
                    <VStack space={2} pb={2} w="full" justifyContent="space-between">
                        <Text alignSelf="flex-start" bold>
                            Quality Control Reply
                        </Text>
                        <TextAreaComponent
                            onChangeText={handleReplyChange}
                            value={ticket?.contestReplyComment}
                            isDisabled={!isQC || userId === ticket?.user?._id || !!ticket?.contestReplyComment}
                        />
                    </VStack>
                    <If condition={offenderAction}>
                        <HStack space={4} justifyContent="space-between">
                            <ButtonComponent
                                size="md"
                                secondary
                                width={150}
                                onPress={handleSubmit}
                                isLoading={contestLoading}
                                isDisabled={!comment && status === 'ISSUED'}
                            >
                                Contest ticket
                            </ButtonComponent>
                            <ButtonComponent
                                size="md"
                                width={150}
                                onPress={handleAcknowledge}
                                isLoading={acknowledgeLoading}
                                isDisabled={
                                    status !== 'ISSUED' &&
                                    (userId !== ticket?.user?._id || ticket?.department._id !== department._id)
                                }
                            >
                                Acknowledge
                            </ButtonComponent>
                        </HStack>
                    </If>
                    <If condition={qcAction}>
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
                                isDisabled={!contestReplyComment}
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
