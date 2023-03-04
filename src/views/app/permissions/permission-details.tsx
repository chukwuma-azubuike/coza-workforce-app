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
import { useGetPermissionByIdQuery, useUpdatePermissionMutation } from '../../../store/services/permissions';
import { IPermission, IUpdatePermissionPayload } from '../../../store/types';
import Utils from '../../../utils';

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

    const { user, isHOD, isAHOD, isCampusPastor } = useRole();

    const canApprove = (userId: string, requestor: string, isHod: boolean, isAHod: boolean, isPastor: boolean) => {
        // Member permission
        if (!isHod && !isAHod && !isPastor) {
            return false;
        }
        // HOD permission
        if ((isHod || isAHod) && userId === requestor) {
            return false;
        }
        // Peer permission
        if ((isHod || isAHod) && user.department._id === department?._id) {
            return false;
        }
        return true;
    };

    const disable = React.useMemo(
        () => canApprove(user.userId, requestorId, isHOD, isAHOD, isCampusPastor),
        [user.userId, requestorId, isHOD, isAHOD, isCampusPastor]
    );

    const [permissionComment, setPermissionComment] = React.useState<IUpdatePermissionPayload['comment']>(comment);

    const {
        refetch,
        data: permission,
        isLoading: permissionLoading,
        isError: permissionIsError,
        isSuccess: permissionIsSuccess,
    } = useGetPermissionByIdQuery(_id);

    const [
        updateTicket,
        { isSuccess: updateIsSuccess, isError: updateIsError, isLoading: updateLoading, reset: updateReset },
    ] = useUpdatePermissionMutation();

    useScreenFocus({
        onFocus: refetch,
    });

    const handleUpdate = (status: IUpdatePermissionPayload['status']) => {
        updateTicket({ comment: permissionComment, _id, status } as IUpdatePermissionPayload);
    };

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
            updateReset();
            navigate.goBack();
        }
        if (updateIsError) {
            setModalState({
                status: 'error',
                message: 'Oops something went wrong.',
            });
        }
    }, [updateIsSuccess, updateIsError]);

    return (
        <ViewWrapper scroll>
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
                        <Text>{Utils.capitalizeFirstChar(permission?.categoryId?.name)}</Text>
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
                            {`${isHOD || isAHOD ? 'Pastor' : 'HOD/AHOD'}'s Comment`}
                        </Text>
                        <TextAreaComponent
                            value={permissionComment}
                            onChangeText={handleChange}
                            isDisabled={status !== 'PENDING' && disable}
                        />
                    </VStack>
                    <If condition={status === 'PENDING' && user.userId !== requestorId}>
                        <HStack space={4} justifyContent="space-between">
                            <ButtonComponent
                                isDisabled={status === 'DECLINED' || !permissionComment}
                                onPress={() => handleUpdate('DECLINED')}
                                isLoading={updateLoading}
                                width={150}
                                secondary
                                size="md"
                            >
                                Decline
                            </ButtonComponent>
                            <ButtonComponent
                                onPress={() => handleUpdate('APPROVED')}
                                isDisabled={status === 'APPROVED'}
                                isLoading={updateLoading}
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
