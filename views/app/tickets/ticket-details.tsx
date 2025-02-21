import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import moment from 'moment';
import React from 'react';
import AvatarComponent from '@components/atoms/avatar';
import ButtonComponent from '@components/atoms/button';
import StatusTag from '@components/atoms/status-tag';
import TextAreaComponent from '@components/atoms/text-area';
import CardComponent from '@components/composite/card';
import If from '@components/composite/if-container';
import { FlatListSkeleton } from '@components/layout/skeleton';
import ViewWrapper from '@components/layout/viewWrapper';
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
import VStackComponent from '@components/layout/v-stack';
import HStackComponent from '@components/layout/h-stack';
import TextComponent from '@components/text';
import { THEME_CONFIG } from '@config/appConfig';

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
        <ViewWrapper
            scroll
            avoidKeyboard
            onRefresh={refetch}
            style={{
                paddingVertical: 20,
                paddingHorizontal: 10,
            }}
            refreshing={isLoading || isFetching}
        >
            <CardComponent
                isLoading={isLoading || isFetching}
                style={{
                    paddingVertical: 20,
                }}
            >
                <VStackComponent space={12}>
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
                    <HStackComponent
                        space={4}
                        style={{
                            paddingBottom: 8,
                            justifyContent: 'space-between',
                            borderBottomWidth: 0.2,
                            borderColor: THEME_CONFIG.gray,
                        }}
                    >
                        <TextComponent bold>Date issued</TextComponent>
                        <TextComponent>{moment(ticket?.createdAt).format('DD/MM/YYYY - LT')}</TextComponent>
                    </HStackComponent>
                    {ticket?.updatedAt ? (
                        <HStackComponent
                            space={4}
                            style={{
                                paddingBottom: 8,
                                borderColor: THEME_CONFIG.lightGray,
                                borderBottomWidth: 0.2,
                                justifyContent: 'space-between',
                            }}
                        >
                            <TextComponent bold>Last updated</TextComponent>
                            <TextComponent>{moment(ticket?.updatedAt).format('DD/MM/YYYY - LT')}</TextComponent>
                        </HStackComponent>
                    ) : null}
                    <HStackComponent
                        space={4}
                        style={{
                            paddingBottom: 8,
                            borderColor: THEME_CONFIG.lightGray,
                            borderBottomWidth: 0.2,
                            justifyContent: 'space-between',
                        }}
                    >
                        <TextComponent bold>Department</TextComponent>
                        <TextComponent>{ticket?.department?.departmentName}</TextComponent>
                    </HStackComponent>
                    <HStackComponent
                        space={4}
                        style={{
                            paddingBottom: 8,
                            borderColor: THEME_CONFIG.lightGray,
                            borderBottomWidth: 0.2,
                            justifyContent: 'space-between',
                        }}
                    >
                        <TextComponent bold>Ticket type</TextComponent>
                        <TextComponent>{ticket?.isDepartment ? 'Departmental' : 'Individual'}</TextComponent>
                    </HStackComponent>

                    <If condition={isQC || isCampusPastor || isGlobalPastor}>
                        {issuerIsLoading ? (
                            <FlatListSkeleton count={1} />
                        ) : issuer ? (
                            <HStackComponent
                                space={4}
                                style={{
                                    paddingBottom: 8,
                                    borderColor: THEME_CONFIG.lightGray,
                                    borderBottomWidth: 0.2,
                                    justifyContent: 'space-between',
                                }}
                            >
                                <TextComponent style={{ alignSelf: 'flex-start' }} bold>
                                    Issued by
                                </TextComponent>
                                <TextComponent>{`${issuer?.firstName} ${issuer?.lastName}`}</TextComponent>
                            </HStackComponent>
                        ) : null}
                    </If>

                    <HStackComponent
                        space={4}
                        style={{
                            paddingBottom: 8,
                            borderColor: THEME_CONFIG.lightGray,
                            borderBottomWidth: 0.2,
                            justifyContent: 'space-between',
                        }}
                    >
                        <TextComponent style={{ alignSelf: 'flex-start' }} bold>
                            Status
                        </TextComponent>
                        <StatusTag>{ticket?.status}</StatusTag>
                    </HStackComponent>

                    <HStackComponent
                        space={4}
                        style={{
                            paddingBottom: 8,
                            borderColor: THEME_CONFIG.lightGray,
                            borderBottomWidth: 0.2,
                            justifyContent: 'space-between',
                        }}
                    >
                        <TextComponent style={{ alignSelf: 'flex-start' }} bold>
                            Category
                        </TextComponent>
                        <TextComponent>{ticket?.category.categoryName}</TextComponent>
                    </HStackComponent>

                    <HStackComponent
                        space={4}
                        style={{
                            paddingBottom: 8,
                            borderColor: THEME_CONFIG.lightGray,
                            borderBottomWidth: 0.2,
                            justifyContent: 'space-between',
                        }}
                    >
                        <TextComponent style={{ alignSelf: 'flex-start' }} bold>
                            Offender
                        </TextComponent>
                        <TextComponent>
                            {ticket?.isIndividual
                                ? `${ticket?.user?.firstName} ${ticket?.user?.lastName}`
                                : `${ticket?.department?.departmentName}`}
                        </TextComponent>
                    </HStackComponent>

                    <VStackComponent
                        space={4}
                        style={{
                            paddingBottom: 8,
                            borderColor: THEME_CONFIG.lightGray,
                            borderBottomWidth: 0.2,
                            justifyContent: 'space-between',
                        }}
                    >
                        <TextComponent style={{ marginBottom: 8 }} bold>
                            Details
                        </TextComponent>
                        <TextComponent numberOfLines={undefined}>{ticket?.ticketSummary}</TextComponent>
                    </VStackComponent>

                    <VStackComponent style={{ paddingBottom: 4, justifyContent: 'space-between' }} space={4}>
                        <TextComponent style={{ alignSelf: 'flex-start' }} bold>
                            Contest Comment
                        </TextComponent>
                        <If condition={ticket?.isIndividual}>
                            {!ticket?.contestComment && (
                                <TextAreaComponent
                                    onChangeText={handleChange}
                                    value={ticket?.contestComment}
                                    isDisabled={ticket?.status !== 'ISSUED' && ticket?.user?._id !== userId}
                                />
                            )}
                            {ticket?.contestComment && (
                                <TextComponent numberOfLines={undefined}>{ticket?.contestComment}</TextComponent>
                            )}
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
                            {ticket?.contestComment && (
                                <TextComponent numberOfLines={undefined}>{ticket?.contestComment}</TextComponent>
                            )}
                        </If>
                    </VStackComponent>
                    <VStackComponent style={{ paddingBottom: 4, justifyContent: 'space-between' }} space={4}>
                        <TextComponent style={{ alignSelf: 'flex-start' }} bold>
                            QC / M&E Reply
                        </TextComponent>
                        {!ticket?.contestReplyComment && (
                            <TextAreaComponent
                                onChangeText={handleReplyChange}
                                isDisabled={!isQC || userId === ticket?.user?._id || !!ticket?.contestReplyComment}
                            />
                        )}
                        {ticket?.contestReplyComment && (
                            <TextComponent numberOfLines={undefined}>{ticket?.contestReplyComment}</TextComponent>
                        )}
                    </VStackComponent>
                    <If condition={offenderAction}>
                        <HStackComponent style={{ paddingBottom: 4, justifyContent: 'space-between' }} space={4}>
                            <ButtonComponent
                                size="md"
                                secondary
                                style={{ flex: 1 }}
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
                                style={{ flex: 1 }}
                                onPress={handleAcknowledge}
                                isLoading={acknowledgeLoading}
                                isDisabled={
                                    ticket?.status !== 'ISSUED' &&
                                    (userId !== ticket?.user?._id || ticket?.department._id !== department._id)
                                }
                            >
                                Acknowledge
                            </ButtonComponent>
                        </HStackComponent>
                    </If>
                    <If condition={qcAction}>
                        <HStackComponent style={{ paddingBottom: 4, justifyContent: 'space-between' }} space={6}>
                            <ButtonComponent
                                size="md"
                                secondary
                                style={{ flex: 1 }}
                                isLoading={retractLoading}
                                onPress={handleRetractTicket}
                            >
                                Retract
                            </ButtonComponent>
                            <ButtonComponent
                                size="md"
                                style={{ flex: 1 }}
                                isLoading={replyLoading}
                                onPress={handleReplySubmit}
                                isDisabled={!contestReplyComment}
                            >
                                Reply
                            </ButtonComponent>
                        </HStackComponent>
                    </If>
                </VStackComponent>
            </CardComponent>
        </ViewWrapper>
    );
};

export default React.memo(TicketDetails);
