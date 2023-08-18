import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import moment from 'moment';
import { HStack, Text, VStack } from 'native-base';
import React from 'react';
import { Platform } from 'react-native';
import AvatarComponent from '../../../components/atoms/avatar';
import ButtonComponent from '../../../components/atoms/button';
import StatusTag from '../../../components/atoms/status-tag';
import TextAreaComponent from '../../../components/atoms/text-area';
import CardComponent from '../../../components/composite/card';
import If from '../../../components/composite/if-container';
import ViewWrapper from '../../../components/layout/viewWrapper';
import { AVATAR_FALLBACK_URL } from '../../../constants';
import useScreenFocus from '../../../hooks/focus';
import useModal from '../../../hooks/modal/useModal';
import useRole from '../../../hooks/role';
import {
    useApprovePermissionMutation,
    useDeclinePermissionMutation,
    useGetPermissionByIdQuery,
} from '../../../store/services/permissions';
import { IPermission, IUpdatePermissionPayload } from '../../../store/types';

interface PermissionDetailsParamsProps extends IPermission {
    screen: { name: string; value: string } | undefined;
}

const PermissionDetails: React.FC<NativeStackScreenProps<ParamListBase>> = props => {
    const permissionParams = props.route.params as PermissionDetailsParamsProps;

    const {
        requestor: { _id: requestorId },
        _id,
        screen,
    } = permissionParams;

    const navigate = props.navigation;

    const { user, isHOD, isAHOD, isCampusPastor, isQC } = useRole();

    const {
        refetch,
        isFetching,
        data: permission,
        isLoading: permissionLoading,
        isFetching: permissionIsFetching,
    } = useGetPermissionByIdQuery(_id);

    const [permissionComment, setPermissionComment] = React.useState<IUpdatePermissionPayload['comment']>(
        permission?.comment as string
    );

    const [
        approve,
        {
            isSuccess: approveIsSuccess,
            reset: approveReset,
            isError: approveIsError,
            isLoading: approveIsLoading,
            error: approveError,
            data: approveData,
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
            data: declineData,
        },
    ] = useDeclinePermissionMutation();

    useScreenFocus({
        onFocus: () => {
            refetch();
            if (!permission?.comment) {
                setPermissionComment('');
            }
        },
    });

    const handleApprove = () => {
        approve({ approverId: user.userId, comment: permissionComment, permissionId: permission?._id as string });
    };

    const handleDecline = () =>
        decline({ declinerId: user.userId, comment: permissionComment, permissionId: permission?._id as string });

    const handleChange = (comment: string) => {
        setPermissionComment(comment);
    };

    const { setModalState } = useModal();

    React.useEffect(() => {
        if (approveIsSuccess) {
            setModalState({
                status: 'success',
                message: 'Permission approved',
            });
            setPermissionComment('');
            approveReset();
            if (screen?.name) {
                navigate.navigate('Group head department activies', {
                    permissions: { ...permissionParams, ...approveData, requestor: permissionParams?.requestor },
                    screenName: screen.name,
                    _id: screen.value,
                    tab: 1,
                });
            } else {
                navigate.navigate('Permissions', {
                    ...permissionParams,
                    ...approveData,
                    requestor: permissionParams?.requestor,
                });
            }
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

            if (!!screen?.name) {
                navigate.navigate('Group head department activies', {
                    permissions: { ...permissionParams, ...declineData, requestor: permissionParams?.requestor },
                    screenName: screen.name,
                    _id: screen.value,
                    tab: 1,
                });
            } else {
                navigate.navigate('Permissions', {
                    ...permissionParams,
                    ...declineData,
                    requestor: permissionParams?.requestor,
                });
            }
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
        if (requestorId === user._id) {
            return false;
        }
        if (isQC && permission?.department._id !== user.department._id) {
            return false;
        }
        if (permission?.status !== 'PENDING') {
            return false;
        }

        return true;
    }, [permission, requestorId, user?._id, isQC, permission?.department?._id, user?.department?._id]);

    return (
        <ViewWrapper scroll onRefresh={refetch} refreshing={isFetching}>
            <CardComponent
                mt={1}
                px={2}
                pt={8}
                pb={4}
                mx={3}
                mb={10}
                isLoading={permissionLoading || permissionIsFetching}
            >
                <VStack space={4}>
                    <AvatarComponent
                        size="xl"
                        shadow={9}
                        lastName={permission?.requestor?.lastName}
                        firstName={permission?.requestor?.firstName}
                        imageUrl={permission?.requestor?.pictureUrl || AVATAR_FALLBACK_URL}
                    />
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
                        <Text>{`${permission?.requestor?.firstName} ${permission?.requestor?.lastName}`}</Text>
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
                        <Text>{moment(permission?.createdAt).format('DD/MM/YYYY - LT')}</Text>
                    </HStack>

                    {permission?.dateApproved ? (
                        <HStack
                            pb={2}
                            w="full"
                            space={2}
                            borderColor="gray.300"
                            borderBottomWidth={0.2}
                            justifyContent="space-between"
                        >
                            <Text alignSelf="flex-start" bold>
                                Date Approved
                            </Text>
                            <Text>{moment(permission?.dateApproved).format('DD/MM/YYYY - LT')}</Text>
                        </HStack>
                    ) : null}

                    {permission?.rejectedOn ? (
                        <HStack
                            pb={2}
                            w="full"
                            space={2}
                            borderColor="gray.300"
                            borderBottomWidth={0.2}
                            justifyContent="space-between"
                        >
                            <Text alignSelf="flex-start" bold>
                                Date Rejected
                            </Text>
                            <Text>{moment(permission?.rejectedOn).format('DD/MM/YYYY - LT')}</Text>
                        </HStack>
                    ) : null}

                    <HStack
                        pb={2}
                        w="full"
                        space={2}
                        justifyContent="space-between"
                        borderBottomWidth={0.2}
                        borderColor="gray.300"
                    >
                        <Text alignSelf="flex-start" bold>
                            Start Date
                        </Text>
                        <Text>{moment(permission?.startDate).format('Do MMM, YYYY')}</Text>
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
                        <Text>{moment(permission?.endDate).format('Do MMM, YYYY')}</Text>
                    </HStack>

                    <VStack pb={2} w="full" space={2}>
                        <Text alignSelf="flex-start" bold>
                            Description
                        </Text>
                        {!permission?.description && (
                            <TextAreaComponent value={permission?.description} isDisabled={Platform.OS !== 'android'} />
                        )}
                        {permission?.description && <Text flexWrap="wrap">{permission?.description}</Text>}
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
                        <StatusTag>{permission?.status as any}</StatusTag>
                    </HStack>
                    <VStack pb={2} w="full" space={2}>
                        <Text alignSelf="flex-start" bold>
                            {!isHOD && !isAHOD && !isCampusPastor
                                ? "Leader's comment"
                                : (isAHOD || isHOD) && requestorId === user.userId
                                ? "Pastor's comment"
                                : 'Comment'}
                        </Text>
                        {!permission?.comment && (
                            <TextAreaComponent onChangeText={handleChange} isDisabled={!takePermissionAction} />
                        )}
                        {permission?.comment && <Text flexWrap="wrap">{permission?.comment}</Text>}
                    </VStack>
                    <If condition={takePermissionAction}>
                        <HStack space={4} w="95%" justifyContent="space-between">
                            <ButtonComponent
                                isDisabled={!permissionComment || approveIsLoading}
                                isLoading={declineIsLoading}
                                onPress={handleDecline}
                                width="1/2"
                                secondary
                                size="md"
                            >
                                Decline
                            </ButtonComponent>
                            <ButtonComponent
                                isDisabled={declineIsLoading}
                                isLoading={approveIsLoading}
                                onPress={handleApprove}
                                width="1/2"
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
