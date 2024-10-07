import React from 'react';
import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import moment from 'moment';
import VStackComponent from '@components/layout/v-stack';
import HStackComponent from '@components/layout/h-stack';
import TextComponent from '@components/text';
import { Platform } from 'react-native';
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
import useRole from '@hooks/role';
import {
    useApprovePermissionMutation,
    useDeclinePermissionMutation,
    useGetPermissionByIdQuery,
} from '@store/services/permissions';
import { IPermission, IUpdatePermissionPayload } from '@store/types';

import { THEME_CONFIG } from '@config/appConfig';

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
                <VStackComponent space={8}>
                    <AvatarComponent
                        size="xl"
                        shadow={9}
                        lastName={permission?.requestor?.lastName}
                        firstName={permission?.requestor?.firstName}
                        imageUrl={permission?.requestor?.pictureUrl || AVATAR_FALLBACK_URL}
                    />
                    <HStackComponent
                        space={4}
                        style={{
                            paddingBottom: 4,
                            borderBottomWidth: 0.2,
                            justifyContent: 'space-between',
                            borderColor: THEME_CONFIG.lightGray,
                        }}
                    >
                        <TextComponent bold>Requester</TextComponent>
                        <TextComponent>{`${permission?.requestor?.firstName} ${permission?.requestor?.lastName}`}</TextComponent>
                    </HStackComponent>
                    <HStackComponent
                        space={4}
                        style={{
                            paddingBottom: 4,
                            borderBottomWidth: 0.2,
                            justifyContent: 'space-between',
                            borderColor: THEME_CONFIG.lightGray,
                        }}
                    >
                        <TextComponent bold>Department</TextComponent>
                        <TextComponent>{permission?.department?.departmentName}</TextComponent>
                    </HStackComponent>
                    <HStackComponent
                        space={4}
                        style={{
                            paddingBottom: 4,
                            borderBottomWidth: 0.2,
                            justifyContent: 'space-between',
                            borderColor: THEME_CONFIG.lightGray,
                        }}
                    >
                        <TextComponent bold>Category</TextComponent>
                        <TextComponent>{permission?.category.name}</TextComponent>
                    </HStackComponent>
                    <HStackComponent
                        space={4}
                        style={{
                            paddingBottom: 4,
                            borderBottomWidth: 0.2,
                            justifyContent: 'space-between',
                            borderColor: THEME_CONFIG.lightGray,
                        }}
                    >
                        <TextComponent bold>Date Requested</TextComponent>
                        <TextComponent>{moment(permission?.createdAt).format('DD/MM/YYYY - LT')}</TextComponent>
                    </HStackComponent>

                    {permission?.dateApproved ? (
                        <HStackComponent
                            space={4}
                            style={{
                                paddingBottom: 4,
                                borderBottomWidth: 0.2,
                                justifyContent: 'space-between',
                                borderColor: THEME_CONFIG.lightGray,
                            }}
                        >
                            <TextComponent bold>Date Approved</TextComponent>
                            <TextComponent>{moment(permission?.dateApproved).format('DD/MM/YYYY - LT')}</TextComponent>
                        </HStackComponent>
                    ) : null}

                    {permission?.rejectedOn ? (
                        <HStackComponent
                            space={4}
                            style={{
                                paddingBottom: 4,
                                borderBottomWidth: 0.2,
                                justifyContent: 'space-between',
                                borderColor: THEME_CONFIG.lightGray,
                            }}
                        >
                            <TextComponent bold>Date Rejected</TextComponent>
                            <TextComponent>{moment(permission?.rejectedOn).format('DD/MM/YYYY - LT')}</TextComponent>
                        </HStackComponent>
                    ) : null}

                    <HStackComponent
                        space={4}
                        style={{
                            paddingBottom: 4,
                            borderBottomWidth: 0.2,
                            justifyContent: 'space-between',
                            borderColor: THEME_CONFIG.lightGray,
                        }}
                    >
                        <TextComponent bold>Start Date</TextComponent>
                        <TextComponent>{moment(permission?.startDate).format('Do MMM, YYYY')}</TextComponent>
                    </HStackComponent>

                    <HStackComponent
                        space={4}
                        style={{
                            paddingBottom: 4,
                            borderBottomWidth: 0.2,
                            justifyContent: 'space-between',
                            borderColor: THEME_CONFIG.lightGray,
                        }}
                    >
                        <TextComponent bold>End Date</TextComponent>
                        <TextComponent>{moment(permission?.endDate).format('Do MMM, YYYY')}</TextComponent>
                    </HStackComponent>

                    <VStackComponent style={{ paddingBottom: 4 }} space={8}>
                        <TextComponent bold>Description</TextComponent>
                        {!permission?.description && (
                            <TextAreaComponent value={permission?.description} isDisabled={Platform.OS !== 'android'} />
                        )}
                        {permission?.description && (
                            <TextComponent numberOfLines={undefined} size="md" flexWrap="wrap">
                                {permission?.description}
                            </TextComponent>
                        )}
                    </VStackComponent>
                    <HStackComponent
                        space={4}
                        style={{
                            paddingBottom: 8,
                            borderBottomWidth: 0.2,
                            justifyContent: 'space-between',
                            borderColor: THEME_CONFIG.lightGray,
                        }}
                    >
                        <TextComponent bold>Status</TextComponent>
                        <StatusTag>{permission?.status as any}</StatusTag>
                    </HStackComponent>
                    <VStackComponent style={{ paddingBottom: 4 }} space={8}>
                        <TextComponent bold>
                            {!isHOD && !isAHOD && !isCampusPastor
                                ? "Leader's comment"
                                : (isAHOD || isHOD) && requestorId === user.userId
                                ? "Pastor's comment"
                                : 'Comment'}
                        </TextComponent>
                        {!permission?.comment && (
                            <TextAreaComponent onChangeText={handleChange} isDisabled={!takePermissionAction} />
                        )}
                        {permission?.comment && (
                            <TextComponent numberOfLines={undefined} flexWrap="wrap">
                                {permission?.comment}
                            </TextComponent>
                        )}
                    </VStackComponent>
                    <If condition={takePermissionAction}>
                        <HStackComponent style={{ justifyContent: 'space-between' }}>
                            <ButtonComponent
                                isDisabled={!permissionComment || approveIsLoading}
                                isLoading={declineIsLoading}
                                onPress={handleDecline}
                                style={{ width: '48%' }}
                                secondary
                                size="md"
                            >
                                Decline
                            </ButtonComponent>
                            <ButtonComponent
                                isDisabled={declineIsLoading}
                                isLoading={approveIsLoading}
                                onPress={handleApprove}
                                style={{ width: '48%' }}
                                size="md"
                            >
                                Approve
                            </ButtonComponent>
                        </HStackComponent>
                    </If>
                </VStackComponent>
            </CardComponent>
        </ViewWrapper>
    );
};

export default React.memo(PermissionDetails);
