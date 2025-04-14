import { Text } from '~/components/ui/text';
import React from 'react';
import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import dayjs from 'dayjs';
import { Platform, View } from 'react-native';
import AvatarComponent from '@components/atoms/avatar';
import ButtonComponent from '@components/atoms/button';
import StatusTag from '@components/atoms/status-tag';
import TextAreaComponent from '@components/atoms/text-area';
import CardComponent from '@components/composite/card';
import If from '@components/composite/if-container';
import ViewWrapper from '@components/layout/viewWrapper';
import { AVATAR_FALLBACK_URL } from '@constants/index';
import useScreenFocus from '@hooks/focus';
import useModal from '@hooks/modal/useModal';
import useRole, { ROLES } from '@hooks/role';
import {
    useApprovePermissionMutation,
    useDeclinePermissionMutation,
    useGetPermissionByIdQuery,
} from '@store/services/permissions';
import { IPermission, IUpdatePermissionPayload } from '@store/types';

import useRoleName from '@hooks/role/useRoleName';
import { Button } from '~/components/ui/button';

interface PermissionDetailsParamsProps extends IPermission {
    screen: { name: string; value: string } | undefined;
}

const PermissionDetails: React.FC<NativeStackScreenProps<ParamListBase>> = props => {
    const permissionParams = props.route.params as PermissionDetailsParamsProps;

    const {
        requestor: { _id: requestorId, roleId: requestorRoleId },
        _id,
        screen,
    } = permissionParams;

    const navigate = props.navigation;

    const { user, isHOD, isAHOD, isGlobalPastor, isCampusPastor, isQC } = useRole();

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
                navigate.navigate('Group Head Department Activities', {
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
                message: (approveError as any)?.data?.message || 'Oops something went wrong',
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
                navigate.navigate('Group Head Department Activities', {
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
                message: (declineError as any)?.data?.message || 'Oops something went wrong',
            });
            declineReset();
        }
    }, [declineIsSuccess, declineIsError]);

    const requestorRoleName = useRoleName(requestorRoleId)?.name;

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
        if ((isCampusPastor || isGlobalPastor) && requestorRoleName === ROLES.worker) {
            return false;
        }

        return true;
    }, [permission, requestorId, user?._id, isQC, permission?.department?._id, user?.department?._id]);

    return (
        <ViewWrapper
            avoidKeyboard
            scroll
            onRefresh={refetch}
            refreshing={isFetching}
            style={{
                paddingVertical: 20,
                paddingHorizontal: 10,
            }}
        >
            <CardComponent style={{ paddingVertical: 20 }} isLoading={permissionLoading || permissionIsFetching}>
                <View className="gap-4">
                    <AvatarComponent
                        alt="requestor-pic"
                        className="w-32 h-32"
                        lastName={permission?.requestor?.lastName}
                        firstName={permission?.requestor?.firstName}
                        imageUrl={permission?.requestor?.pictureUrl || AVATAR_FALLBACK_URL}
                    />
                    <View className="flex-row gap-2 pb-4 justify-between">
                        <Text className="font-bold">Requester</Text>
                        <Text>{`${permission?.requestor?.firstName} ${permission?.requestor?.lastName}`}</Text>
                    </View>
                    <View className="flex-row gap-2 pb-4 justify-between">
                        <Text className="font-bold">Department</Text>
                        <Text>{permission?.department?.departmentName}</Text>
                    </View>
                    <View className="flex-row gap-2 pb-4 justify-between">
                        <Text className="font-bold">Category</Text>
                        <Text>{permission?.category.name}</Text>
                    </View>
                    <View className="flex-row gap-2 pb-4 justify-between">
                        <Text className="font-bold">Date Requested</Text>
                        <Text>{dayjs(permission?.createdAt).format('DD/MM/YYYY - h:mm A')}</Text>
                    </View>

                    {permission?.dateApproved ? (
                        <View className="flex-row gap-2 pb-4 justify-between">
                            <Text className="font-bold">Date Approved</Text>
                            <Text>{dayjs(permission?.dateApproved).format('DD/MM/YYYY - h:mm A')}</Text>
                        </View>
                    ) : null}

                    {permission?.rejectedOn ? (
                        <View className="flex-row gap-2 pb-4 justify-between">
                            <Text className="font-bold">Date Rejected</Text>
                            <Text>{dayjs(permission?.rejectedOn).format('DD/MM/YYYY - h:mm A')}</Text>
                        </View>
                    ) : null}

                    <View className="flex-row gap-2 pb-4 justify-between">
                        <Text className="font-bold">Start Date</Text>
                        <Text>{dayjs(permission?.startDate).format('DD MMM, YYYY')}</Text>
                    </View>

                    <View className="flex-row gap-2 pb-4 justify-between">
                        <Text className="font-bold">End Date</Text>
                        <Text>{dayjs(permission?.endDate).format('DD MMM, YYYY')}</Text>
                    </View>

                    <View className="pb-4 gap-4">
                        <Text className="font-bold">Description</Text>
                        {!permission?.description && (
                            <TextAreaComponent value={permission?.description} isDisabled={Platform.OS !== 'android'} />
                        )}
                        {permission?.description && (
                            <Text numberOfLines={undefined} className="flex-wrap line-clamp-none">
                                {permission?.description}
                            </Text>
                        )}
                    </View>
                    <View className="pb-8 justify-between flex-row">
                        <Text className="font-bold">Status</Text>
                        <StatusTag>{permission?.status as any}</StatusTag>
                    </View>
                    <View className="pb-4 gap-4">
                        <Text className="font-bold">
                            {!isHOD && !isAHOD && !isCampusPastor
                                ? "Leader's comment"
                                : (isAHOD || isHOD) && requestorId === user.userId
                                ? "Pastor's comment"
                                : 'Comment'}
                        </Text>
                        {!permission?.comment && (
                            <TextAreaComponent onChangeText={handleChange} isDisabled={!takePermissionAction} />
                        )}
                        {permission?.comment && (
                            <Text numberOfLines={undefined} className="flex-wrap line-clamp-none">
                                {permission?.comment}
                            </Text>
                        )}
                    </View>
                    <If condition={takePermissionAction}>
                        <View className="flex-row gap-4">
                            <Button
                                disabled={!permissionComment || approveIsLoading}
                                isLoading={declineIsLoading}
                                onPress={handleDecline}
                                className="flex-1"
                                variant="outline"
                            >
                                Decline
                            </Button>
                            <Button
                                disabled={declineIsLoading}
                                isLoading={approveIsLoading}
                                onPress={handleApprove}
                                className="flex-1"
                            >
                                Approve
                            </Button>
                        </View>
                    </If>
                </View>
            </CardComponent>
        </ViewWrapper>
    );
};

export default React.memo(PermissionDetails);
