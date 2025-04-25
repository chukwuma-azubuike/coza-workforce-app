import { Text } from '~/components/ui/text';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import dayjs from 'dayjs';
import React from 'react';
import AvatarComponent from '@components/atoms/avatar';
import StatusTag from '@components/atoms/status-tag';
import TextAreaComponent from '@components/atoms/text-area';
import CardComponent from '@components/composite/card';
import If from '@components/composite/if-container';
import { FlatListSkeleton } from '@components/layout/skeleton';
import { AVATAR_FALLBACK_URL, AVATAR_GROUP_FALLBACK_URL } from '@constants/index';
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
import { Button } from '~/components/ui/button';
import { router, useLocalSearchParams } from 'expo-router';
import RefreshControl from '~/components/RefreshControl';

const TicketDetails: React.FC = () => {
    const ticketParams = useLocalSearchParams<ITicket>();

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
            router.push({
                pathname: '/tickets',
                params: {
                    ...ticketParams,
                    ...contestData,
                    user: ticketParams?.user,
                    departmentName: ticketParams?.departmentName,
                } as any,
            });
        }

        if (contestIsError) {
            setModalState({
                message: (contestError as any)?.data?.message,
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
            router.push('/tickets');
        }

        if (replyIsError) {
            setModalState({
                message: (replyError as any)?.data?.message,
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
            router.push({
                pathname: '/tickets',
                params: {
                    ...ticketParams,
                    ...retractData,
                    user: ticketParams?.user,
                    departmentName: ticketParams?.departmentName,
                },
            } as any);
        }

        if (retractIsError) {
            setModalState({
                message: (retractError as any)?.data?.message,
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
            router.push({
                pathname: '/tickets',
                params: {
                    ...ticketParams,
                    ...acknowledgeData,
                    user: ticketParams?.user,
                    departmentName: ticketParams?.departmentName,
                },
            } as any);
        }

        if (acknowledgeIsError) {
            setModalState({
                message: (acknowledgeError as any)?.data,
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
        <View className="pb-16">
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'position' : 'height'}>
                <ScrollView refreshControl={<RefreshControl refreshing={isLoading} />} className="px-2 py-10">
                    <CardComponent
                        isLoading={isLoading || isFetching}
                        style={{
                            paddingVertical: 20,
                        }}
                        className="py-8"
                    >
                        <View className="gap-2">
                            <AvatarComponent
                                alt="ticket-pic"
                                className="w-32 h-32 mx-auto"
                                lastName={ticket?.user?.lastName}
                                firstName={ticket?.user?.firstName}
                                imageUrl={
                                    ticket?.isIndividual
                                        ? ticket?.user?.pictureUrl || AVATAR_FALLBACK_URL
                                        : AVATAR_GROUP_FALLBACK_URL
                                }
                            />
                            <View className="pb-4 pt-2 justify-between gap-2 flex-row border-b border-b-border">
                                <Text className="font-bold">Date issued</Text>
                                <Text>{dayjs(ticket?.createdAt).format('DD/MM/YYYY - h:mm A')}</Text>
                            </View>
                            {ticket?.updatedAt ? (
                                <View className="pb-4 pt-2 justify-between gap-2 flex-row border-b border-b-border">
                                    <Text className="font-bold">Last updated</Text>
                                    <Text>{dayjs(ticket?.updatedAt).format('DD/MM/YYYY - h:mm A')}</Text>
                                </View>
                            ) : null}
                            <View className="pb-4 pt-2 justify-between gap-2 flex-row border-b border-b-border">
                                <Text className="font-bold">Department</Text>
                                <Text>{ticket?.department?.departmentName}</Text>
                            </View>
                            <View className="pb-4 pt-2 justify-between gap-2 flex-row border-b border-b-border">
                                <Text className="font-bold">Ticket type</Text>
                                <Text>{ticket?.isDepartment ? 'Departmental' : 'Individual'}</Text>
                            </View>

                            <If condition={isQC || isCampusPastor || isGlobalPastor}>
                                {issuerIsLoading ? (
                                    <FlatListSkeleton count={1} />
                                ) : issuer ? (
                                    <View className="pb-4 pt-2 justify-between gap-2 flex-row border-b border-b-border">
                                        <Text className="font-bold">Issued by</Text>
                                        <Text>{`${issuer?.firstName} ${issuer?.lastName}`}</Text>
                                    </View>
                                ) : null}
                            </If>

                            <View className="pb-4 pt-2 justify-between gap-2 flex-row border-b border-b-border">
                                <Text className="font-bold">Status</Text>
                                <StatusTag>{ticket?.status}</StatusTag>
                            </View>

                            <View className="pb-4 pt-2 justify-between gap-2 flex-row border-b border-b-border">
                                <Text className="font-bold">Category</Text>
                                <Text>{ticket?.category.categoryName}</Text>
                            </View>

                            <View className="pb-4 pt-2 justify-between gap-2 flex-row border-b border-b-border">
                                <Text className="font-bold">Offender</Text>
                                <Text>
                                    {ticket?.isIndividual
                                        ? `${ticket?.user?.firstName} ${ticket?.user?.lastName}`
                                        : `${ticket?.department?.departmentName}`}
                                </Text>
                            </View>

                            <View className="pb-4 justify-between border-b border-b-border">
                                <Text className="mb-8 font-bold">Details</Text>
                                <Text className="line-clamp-none">{ticket?.ticketSummary}</Text>
                            </View>

                            <View className="pb-4 justify-between  gap-2">
                                <Text className="font-bold">Contest Comment</Text>
                                <If condition={ticket?.isIndividual}>
                                    {!ticket?.contestComment && (
                                        <TextAreaComponent
                                            onChangeText={handleChange}
                                            value={ticket?.contestComment}
                                            isDisabled={ticket?.status !== 'ISSUED' && ticket?.user?._id !== userId}
                                        />
                                    )}
                                    {ticket?.contestComment && (
                                        <Text className="line-clamp-none">{ticket?.contestComment}</Text>
                                    )}
                                </If>
                                <If condition={ticket?.isDepartment}>
                                    {!ticket?.contestComment && (
                                        <TextAreaComponent
                                            onChangeText={handleChange}
                                            value={ticket?.contestComment}
                                            isDisabled={
                                                ticket?.status !== 'ISSUED' ||
                                                ticket?.department?._id !== department?._id
                                            }
                                        />
                                    )}
                                    {ticket?.contestComment && (
                                        <Text className="line-clamp-none">{ticket?.contestComment}</Text>
                                    )}
                                </If>
                            </View>
                            <View className="pb-4 justify-between gap-2">
                                <Text className="font-bold">QC / M&E Reply</Text>
                                {!ticket?.contestReplyComment && (
                                    <TextAreaComponent
                                        onChangeText={handleReplyChange}
                                        isDisabled={
                                            !isQC || userId === ticket?.user?._id || !!ticket?.contestReplyComment
                                        }
                                    />
                                )}
                                {ticket?.contestReplyComment && (
                                    <Text className="line-clamp-none">{ticket?.contestReplyComment}</Text>
                                )}
                            </View>
                            <If condition={offenderAction}>
                                <View className="pb-4 justify-between gap-2 flex-row">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        style={{ flex: 1 }}
                                        onPress={handleSubmit}
                                        isLoading={contestLoading}
                                        disabled={
                                            (!contestComment || !!ticket?.contestComment) &&
                                            (ticket?.status === 'ISSUED' ||
                                                ticket?.status === 'ACKNOWLEGDED' ||
                                                ticket?.status === 'CONTESTED')
                                        }
                                    >
                                        Contest ticket
                                    </Button>
                                    <Button
                                        size="sm"
                                        style={{ flex: 1 }}
                                        onPress={handleAcknowledge}
                                        isLoading={acknowledgeLoading}
                                        disabled={
                                            ticket?.status !== 'ISSUED' &&
                                            (userId !== ticket?.user?._id || ticket?.department._id !== department._id)
                                        }
                                    >
                                        Acknowledge
                                    </Button>
                                </View>
                            </If>
                            <If condition={qcAction}>
                                <View className="pb-4 flex-row gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1"
                                        isLoading={retractLoading}
                                        onPress={handleRetractTicket}
                                    >
                                        Retract
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="flex-1"
                                        isLoading={replyLoading}
                                        onPress={handleReplySubmit}
                                        disabled={!contestReplyComment}
                                    >
                                        Reply
                                    </Button>
                                </View>
                            </If>
                        </View>
                    </CardComponent>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

export default React.memo(TicketDetails);
