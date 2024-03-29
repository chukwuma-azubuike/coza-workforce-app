import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import moment from 'moment';
import { HStack, Text, VStack } from 'native-base';
import React from 'react';
import AvatarComponent from '@components/atoms/avatar';
import ButtonComponent from '@components/atoms/button';
import StatusTag from '@components/atoms/status-tag';
import TextAreaComponent from '@components/atoms/text-area';
import CardComponent from '@components/composite/card';
import If from '@components/composite/if-container';
import { FlatListSkeleton } from '@components/layout/skeleton';
import ViewWrapper from '@components/layout/viewWrapper';
import { AVATAR_FALLBACK_URL, AVATAR_GROUP_FALLBACK_URL } from '@constants';
import useScreenFocus from '@hooks/focus';
import useModal from '@hooks/modal/useModal';
import useRole from '@hooks/role';
import { useGetUserByIdQuery } from '@store/services/account';
import {
    useContestTicketMutation,
    useGetTicketByIdQuery,
    useReplyContestTicketMutation,
    useRetractTicketMutation,
    useUpdateTicketMutation,
} from '@store/services/tickets';
import { ICreateTicketPayload, ITicket } from '@store/types';

const TicketDetails: React.FC<NativeStackScreenProps<ParamListBase>> = props => {
    const { navigate } = props.navigation;
    const ticketParams = props.route.params as ITicket;

    const {
        isQC,
        isCampusPastor,
        isGlobalPastor,
        user: { userId, department },
    } = useRole();

    const { data: ticket, isFetching, isLoading, refetch } = useGetTicketByIdQuery(ticketParams?._id);
    const { data: issuer, isLoading: issuerIsLoading } = useGetUserByIdQuery(ticket?.issuedBy as string, {
        skip: !ticket?.issuedBy,
    });

    const [
        contestTicket,
        {
            isLoading: contestLoading,
            isSuccess: contestSuccess,
            isError: contestIsError,
            error: contestError,
            reset: contestReset,
            data: contestData,
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
            data: retractData,
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
            data: acknowledgeData,
        },
    ] = useUpdateTicketMutation();

    const [contestComment, setContestComment] = React.useState<string>();
    const [contestReplyComment, setContestReplyComment] = React.useState<string | undefined>(
        ticket?.contestReplyComment as string
    );

    const handleChange = (value: string) => {
        setContestComment(value);
    };
    const handleReplyChange = (value: string) => {
        setContestReplyComment(value);
    };

    const handleSubmit = () => {
        contestTicket({
            userId,
            _id: ticketParams?._id,
            comment: contestComment as string,
        });
    };

    const handleReplySubmit = () => {
        replyContest({
            userId,
            _id: ticketParams?._id,
            comment: contestReplyComment as string,
        });
    };

    const handleRetractTicket = () => {
        retractTicket(ticketParams?._id);
    };

    const handleAcknowledge = () => {
        acknowledgeTicket({
            ...ticket,
            status: 'ACKNOWLEGDED',
        } as ICreateTicketPayload);
    };

    const { setModalState } = useModal();

    React.useEffect(() => {
        if (contestSuccess) {
            setModalState({
                message: 'Contest submitted',
                status: 'success',
            });
            contestReset();
            navigate('Tickets', {
                ...ticketParams,
                ...contestData,
                user: ticketParams?.user,
                departmentName: ticketParams?.departmentName,
            });
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
            navigate('Tickets');
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
            navigate('Tickets', {
                ...ticketParams,
                ...retractData,
                user: ticketParams?.user,
                departmentName: ticketParams?.departmentName,
            });
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
            navigate('Tickets', {
                ...ticketParams,
                ...acknowledgeData,
                user: ticketParams?.user,
                departmentName: ticketParams?.departmentName,
            });
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
        if (isQC && userId === ticket?.user?._id) {
            return false;
        }
        if (!isQC) {
            return false;
        }

        return true;
    }, [isQC, userId, ticket?.user?._id]);

    const offenderAction = React.useMemo(() => {
        if (userId === ticket?.user?._id) {
            return true;
        }
        if (ticket?.department?._id === department?._id && ticket?.isDepartment) {
            return true;
        }

        return false;
    }, [ticket?.department?._id, userId, ticket?.user?._id, ticket?.isDepartment, department?._id]);

    return (
        <ViewWrapper scroll refreshing={isLoading || isFetching} onRefresh={refetch}>
            <CardComponent isLoading={isLoading || isFetching} mt={1} px={2} pt={8} pb={4} mx={3} mb={10}>
                <VStack space={4}>
                    <AvatarComponent
                        size="xl"
                        shadow={9}
                        lastName={ticket?.user?.lastName}
                        firstName={ticket?.user?.firstName}
                        imageUrl={
                            ticket?.isIndividual
                                ? ticket?.user?.pictureUrl || AVATAR_FALLBACK_URL
                                : AVATAR_GROUP_FALLBACK_URL
                        }
                    />
                    <HStack
                        space={2}
                        pb={2}
                        w="full"
                        justifyContent="space-between"
                        borderBottomWidth={0.2}
                        borderColor="gray.300"
                    >
                        <Text alignSelf="flex-start" bold>
                            Date issued
                        </Text>
                        <Text>{moment(ticket?.createdAt).format('DD/MM/YYYY - LT')}</Text>
                    </HStack>
                    {ticket?.updatedAt ? (
                        <HStack
                            pb={2}
                            w="full"
                            space={2}
                            borderColor="gray.300"
                            borderBottomWidth={0.2}
                            justifyContent="space-between"
                        >
                            <Text alignSelf="flex-start" bold>
                                Last updated
                            </Text>
                            <Text>{moment(ticket?.updatedAt).format('DD/MM/YYYY - LT')}</Text>
                        </HStack>
                    ) : null}
                    <HStack
                        pb={2}
                        w="full"
                        space={2}
                        borderColor="gray.300"
                        borderBottomWidth={0.2}
                        justifyContent="space-between"
                    >
                        <Text alignSelf="flex-start" bold>
                            Department
                        </Text>
                        <Text>{ticket?.department?.departmentName}</Text>
                    </HStack>
                    <HStack
                        pb={2}
                        w="full"
                        space={2}
                        borderColor="gray.300"
                        borderBottomWidth={0.2}
                        justifyContent="space-between"
                    >
                        <Text alignSelf="flex-start" bold>
                            Ticket type
                        </Text>
                        <Text>{ticket?.isDepartment ? 'Departmental' : 'Individual'}</Text>
                    </HStack>

                    <If condition={isQC || isCampusPastor || isGlobalPastor}>
                        {issuerIsLoading ? (
                            <FlatListSkeleton count={1} />
                        ) : issuer ? (
                            <HStack
                                pb={2}
                                w="full"
                                space={2}
                                borderColor="gray.300"
                                borderBottomWidth={0.2}
                                justifyContent="space-between"
                            >
                                <Text alignSelf="flex-start" bold>
                                    Issued by
                                </Text>
                                <Text>{`${issuer?.firstName} ${issuer?.lastName}`}</Text>
                            </HStack>
                        ) : null}
                    </If>

                    <HStack
                        pb={2}
                        w="full"
                        space={2}
                        borderColor="gray.300"
                        borderBottomWidth={0.2}
                        justifyContent="space-between"
                    >
                        <Text alignSelf="flex-start" bold>
                            Status
                        </Text>
                        <StatusTag>{ticket?.status}</StatusTag>
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
                            {ticket?.isIndividual
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

                    <VStack pb={2} w="full" space={2} justifyContent="space-between">
                        <Text alignSelf="flex-start" bold>
                            Contest Comment
                        </Text>
                        <If condition={ticket?.isIndividual}>
                            {!ticket?.contestComment && (
                                <TextAreaComponent
                                    onChangeText={handleChange}
                                    value={ticket?.contestComment}
                                    isDisabled={ticket?.status !== 'ISSUED' && ticket?.user?._id !== userId}
                                />
                            )}
                            {ticket?.contestComment && <Text flexWrap="wrap">{ticket?.contestComment}</Text>}
                        </If>
                        <If condition={ticket?.isDepartment}>
                            {!ticket?.contestComment && (
                                <TextAreaComponent
                                    onChangeText={handleChange}
                                    value={ticket?.contestComment}
                                    isDisabled={
                                        ticket?.status !== 'ISSUED' || ticket?.department?._id !== department?._id
                                    }
                                />
                            )}
                            {ticket?.contestComment && <Text flexWrap="wrap">{ticket?.contestComment}</Text>}
                        </If>
                    </VStack>
                    <VStack pb={2} w="full" space={2} justifyContent="space-between">
                        <Text alignSelf="flex-start" bold>
                            QC / M&E Reply
                        </Text>
                        {!ticket?.contestReplyComment && (
                            <TextAreaComponent
                                onChangeText={handleReplyChange}
                                isDisabled={!isQC || userId === ticket?.user?._id || !!ticket?.contestReplyComment}
                            />
                        )}
                        {ticket?.contestReplyComment && <Text flexWrap="wrap">{ticket?.contestReplyComment}</Text>}
                    </VStack>
                    <If condition={offenderAction}>
                        <HStack space={4} w="95%" justifyContent="space-between">
                            <ButtonComponent
                                size="md"
                                secondary
                                width="1/2"
                                onPress={handleSubmit}
                                isLoading={contestLoading}
                                isDisabled={
                                    (!contestComment || !!ticket?.contestComment) &&
                                    (ticket?.status === 'ISSUED' ||
                                        ticket?.status === 'ACKNOWLEGDED' ||
                                        ticket?.status === 'CONTESTED')
                                }
                            >
                                Contest ticket
                            </ButtonComponent>
                            <ButtonComponent
                                size="md"
                                width="1/2"
                                onPress={handleAcknowledge}
                                isLoading={acknowledgeLoading}
                                isDisabled={
                                    ticket?.status !== 'ISSUED' &&
                                    (userId !== ticket?.user?._id || ticket?.department._id !== department._id)
                                }
                            >
                                Acknowledge
                            </ButtonComponent>
                        </HStack>
                    </If>
                    <If condition={qcAction}>
                        <HStack space={4} w="95%" justifyContent="space-between">
                            <ButtonComponent
                                size="md"
                                secondary
                                width="1/2"
                                isLoading={retractLoading}
                                onPress={handleRetractTicket}
                            >
                                Retract
                            </ButtonComponent>
                            <ButtonComponent
                                size="md"
                                width="1/2"
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
