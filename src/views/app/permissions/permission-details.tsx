import { ParamListBase } from '@react-navigation/native';
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
    useApprovePermissionMutation,
    useDeclinePermissionMutation,
    useGetPermissionByIdQuery,
    useUpdatePermissionMutation,
} from '../../../store/services/permissions';
import { IPermission, IUpdatePermissionPayload } from '../../../store/types';

const PermissionDetails: React.FC<NativeStackScreenProps<ParamListBase>> = props => {
    const {
        requestor: { firstName, lastName, pictureUrl, department, _id: requestorId },
        startDate,
        endDate,
        description,
        dateCreated,
        status,
        createdAt,
        comment,
        category,
        _id,
    } = props.route.params as IPermission;

    const navigate = props.navigation;

    const { user, isHOD, isAHOD, isCampusPastor, isQC } = useRole();

    const [permissionComment, setPermissionComment] = React.useState<IUpdatePermissionPayload['comment']>(comment);

    const {
        refetch,
        isFetching,
        data: permission,
        isLoading: permissionLoading,
        isError: permissionIsError,
        isSuccess: permissionIsSuccess,
    } = useGetPermissionByIdQuery(_id);

    const [
        updatePermission,
        { isSuccess: updateIsSuccess, isError: updateIsError, isLoading: updateLoading, reset: updateReset },
    ] = useUpdatePermissionMutation();

    const [
        approve,
        {
            isSuccess: approveIsSuccess,
            reset: approveReset,
            isError: approveIsError,
            isLoading: approveIsLoading,
            error: approveError,
        },
    ] = useApprovePermissionMutation();

    const [
        decline,
        {
            isSuccess: declineIsSuccess,
            reset: declineReset,
            isError: declineIsError,
            isLoading: declineIsLoading,
            error: declineError,
        },
    ] = useDeclinePermissionMutation();

    useScreenFocus({
        onFocus: () => {
            refetch();
            setPermissionComment('');
        },
    });

    const handleUpdate = (status: IUpdatePermissionPayload['status']) => {
        updatePermission({ comment: permissionComment, _id, status } as IUpdatePermissionPayload);
    };

    const handleApprove = () => approve({ approverId: user.userId, permissionId: permission?._id as string });

    const handleDecline = () => decline({ declinerId: user.userId, permissionId: permission?._id as string });

    const handleChange = (comment: string) => {
        setPermissionComment(comment);
    };

    const { setModalState } = useModal();

    React.useEffect(() => {
        if (updateIsSuccess) {
            setModalState({
                status: 'success',
                message: 'Permission updated',
            });
            setPermissionComment('');
            updateReset();
            navigate.goBack();
        }
        if (updateIsError) {
            setModalState({
                status: 'error',
                message: 'Oops something went wrong.',
            });
            updateReset();
        }
    }, [updateIsSuccess, updateIsError]);

    React.useEffect(() => {
        if (approveIsSuccess) {
            setModalState({
                status: 'success',
                message: 'Permission approved',
            });
            setPermissionComment('');
            approveReset();
            navigate.goBack();
        }
        if (approveIsError) {
            setModalState({
                duration: 6,
                status: 'error',
                message: approveError?.data?.message || 'Oops something went wrong',
            });
            approveReset();
        }
    }, [approveIsSuccess, approveIsError]);

    React.useEffect(() => {
        if (declineIsSuccess) {
            setModalState({
                status: 'success',
                message: 'Permission declined',
            });
            setPermissionComment('');
            declineReset();
            navigate.goBack();
        }
        if (declineIsError) {
            setModalState({
                status: 'error',
                message: declineError?.data?.message || 'Oops something went wrong',
            });
            declineReset();
        }
    }, [declineIsSuccess, declineIsError]);

    const takePermissionAction = React.useMemo(() => {
        if (requestorId === user._id) return false;
        if (isQC && permission?.department._id !== user.department._id) return false;
        if (status !== 'PENDING') return false;

        return true;
    }, [permission, status, requestorId, user._id, isQC, permission?.department._id, user.department._id]);

    return (
        <ViewWrapper scroll onRefresh={refetch} refreshing={isFetching}>
            <CardComponent isLoading={permissionLoading} mt={1} px={2} py={8} mx={3} mb={10}>
                <VStack space={4}>
                    <HStack
                        pb={2}
                        w="full"
                        space={2}
                        flexWrap="wrap"
                        borderColor="gray.300"
                        borderBottomWidth={0.2}
                        justifyContent="space-between"
                    >
                        <Text alignSelf="flex-start" bold>
                            Requester
                        </Text>
                        <Text>{`${firstName} ${lastName}`}</Text>
                    </HStack>
                    <HStack
                        pb={2}
                        w="full"
                        space={2}
                        flexWrap="wrap"
                        borderColor="gray.300"
                        borderBottomWidth={0.2}
                        justifyContent="space-between"
                    >
                        <Text alignSelf="flex-start" bold>
                            Department
                        </Text>
                        <Text>{permission?.department?.departmentName}</Text>
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
                            Category
                        </Text>
                        <Text>{permission?.category.name}</Text>
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
                        <Text>{moment(createdAt).format('Do MMM, YYYY')}</Text>
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
                            Start Date
                        </Text>
                        <Text>{moment(startDate).format('Do MMM, YYYY')}</Text>
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
                            End Date
                        </Text>
                        <Text>{moment(endDate).format('Do MMM, YYYY')}</Text>
                    </HStack>

                    <VStack space={2} pb={2} w="full" justifyContent="space-between">
                        <Text alignSelf="flex-start" bold>
                            Description
                        </Text>
                        <TextAreaComponent isDisabled value={description} />
                    </VStack>
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
                        <StatusTag>{status}</StatusTag>
                    </HStack>
                    <VStack pb={2} w="full" space={2} justifyContent="space-between">
                        <Text alignSelf="flex-start" bold>
                            {!isHOD && !isAHOD && !isCampusPastor
                                ? "Leader's comment"
                                : (isAHOD || isHOD) && requestorId === user.userId
                                ? "Pastor's comment"
                                : "Leader's Comment"}
                        </Text>
                        <TextAreaComponent
                            onChangeText={handleChange}
                            isDisabled={!takePermissionAction}
                            value={permissionComment || permission?.comment}
                        />
                    </VStack>
                    <If condition={takePermissionAction}>
                        <HStack space={4} justifyContent="space-between">
                            <ButtonComponent
                                isDisabled={!permissionComment || approveIsLoading}
                                isLoading={declineIsLoading}
                                onPress={handleDecline}
                                width={150}
                                secondary
                                size="md"
                            >
                                Decline
                            </ButtonComponent>
                            <ButtonComponent
                                isDisabled={declineIsLoading}
                                isLoading={approveIsLoading}
                                onPress={handleApprove}
                                width={150}
                                size="md"
                            >
                                Approve
                            </ButtonComponent>
                        </HStack>
                    </If>
                </VStack>
            </CardComponent>
        </ViewWrapper>
    );
};

export default PermissionDetails;
