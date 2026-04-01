import React from 'react';
import { Text } from '~/components/ui/text';
import { useNavigation } from '@react-navigation/native';
import { Icon } from '@rneui/themed';
import { Formik, FormikConfig } from 'formik';
import dayjs from 'dayjs';
import { Alert, TouchableOpacity, View } from 'react-native';
import AvatarComponent from '@components/atoms/avatar';
import StatusTag from '@components/atoms/status-tag';
import CardComponent from '@components/composite/card';
import If from '@components/composite/if-container';
import ViewWrapper from '@components/layout/viewWrapper';
import { AVATAR_FALLBACK_URL } from '@constants/index';
import useScreenFocus from '@hooks/focus';
import useModal from '@hooks/modal/useModal';
import useRole from '@hooks/role';
import {
    useDeleteUserMutation,
    useGetUserByIdQuery,
    useGetUserStatusHistoryQuery,
    useUpdateUserMutation,
} from '@store/services/account';
import { useGetCampusesQuery } from '@store/services/campus';
import { useGetDepartmentsByCampusIdQuery } from '@store/services/department';
import { ICampus, IEditProfilePayload, IReAssignUserPayload, IUser, IUserStatus } from '@store/types';
import Utils from '@utils/index';
import compareObjectValueByKey from '@utils/compareObjectValuesByKey';
import Loading from '@components/atoms/loading';
import CenterComponent from '@components/layout/center';
import { router, useLocalSearchParams } from 'expo-router';
import { Button } from '~/components/ui/button';
import { Label } from '~/components/ui/label';
import PickerSelect from '~/components/ui/picker-select';
import { Switch } from '~/components/ui/switch';
import { previousMonth, previousMonthYear } from '~/views/app/profile/status-report/utils';
import WorkerStatusCard from '../profile/status-report/worker-status-card';

const UserDetails: React.FC = () => {
    const { _id } = useLocalSearchParams() as unknown as IUser;
    const { setModalState } = useModal();
    const { goBack } = useNavigation();
    const { isHOD, isAHOD, isSuperAdmin, isGlobalPastor, isCampusPastor, isInternshipHOD, rolesPermittedToCreate } =
        useRole();

    const canEdit = isSuperAdmin || isGlobalPastor || isCampusPastor || isInternshipHOD;
    const canDelete = isSuperAdmin || isGlobalPastor || isCampusPastor;
    const canApproveForCongress = isHOD || isAHOD || isCampusPastor || isGlobalPastor || isSuperAdmin;

    const [isEditMode, setIsEditMode] = React.useState<boolean>(false);
    const handleEditMode = () => {
        setIsEditMode(prev => !prev);
    };

    const { data, isLoading, isFetching, refetch } = useGetUserByIdQuery(_id);
    const [campusId, setCampusId] = React.useState<string>(data?.campus._id as string);

    const {
        data: statusHistory,
        isFetching: statusHistoryIsFetching,
        isLoading: statusHistoryIsLoading,
    } = useGetUserStatusHistoryQuery({
        userId: _id,
        month: previousMonth,
        year: previousMonthYear,
        monthsBack: 1,
    });
    const userCurrentStatusReport = statusHistory?.currentReport;

    const { data: campuses, isLoading: campusesIsLoading } = useGetCampusesQuery();
    const {
        data: campusDepartments,
        isFetching: isFetchingDepartments,
        isLoading: campusDepartmentsLoading,
    } = useGetDepartmentsByCampusIdQuery(campusId || (data?.campus._id as string), { refetchOnMountOrArgChange: true });

    const sortedCampusDepartments = React.useMemo(
        () => Utils.sortStringAscending(campusDepartments, 'departmentName'),
        [campusDepartments]
    );

    const [updateUser, updateResults] = useUpdateUserMutation();
    const [deleteUser, deleteUserResults] = useDeleteUserMutation();

    const handleDelete = () => {
        Alert.alert('Confirm delete', 'This action is permanent, are you sure?', [
            {
                text: 'No',
                style: 'destructive',
            },
            {
                text: 'Yes',
                style: 'default',
                onPress: handleDeleteUser,
            },
        ]);
    };

    const handleDeleteUser = async () => {
        try {
            const result = await deleteUser(data?.email as string);

            if ('data' in result) {
                setModalState({
                    message: 'User successfully deleted',
                    defaultRender: true,
                    status: 'success',
                    duration: 1,
                });
                goBack();
            }

            if ('error' in result) {
                setModalState({
                    message: (result?.error as any)?.data?.message ?? 'Oops, something went wrong!',
                    defaultRender: true,
                    status: 'error',
                    duration: 1,
                });
            }
        } catch (error) {
            setModalState({
                message: 'Oops, something went wrong!',
                defaultRender: true,
                status: 'error',
                duration: 1,
            });
        }
    };

    const sortedCampuses = React.useMemo(
        () => Utils.sortStringAscending(campuses, 'campusName'),
        [campuses]
    ) as ICampus[];

    const INITIAL_VALUES = {
        _id,
        roleId: data?.roleId,
        campusId: data?.campus._id,
        departmentId: data?.department._id,
    } as IReAssignUserPayload;

    const submitForm: FormikConfig<IReAssignUserPayload>['onSubmit'] = async values => {
        try {
            const result = await updateUser({ ...values, _id } as unknown as IEditProfilePayload);

            if ('data' in result) {
                setModalState({
                    message: 'User successfully reassigned',
                    defaultRender: true,
                    status: 'success',
                    duration: 1,
                });
                goBack();
            }

            if ('error' in result) {
                setModalState({
                    message: (updateResults?.error as any)?.data?.message ?? 'Oops, something went wrong!',
                    defaultRender: true,
                    status: 'error',
                    duration: 1,
                });
            }
            // eslint-disable-next-line no-catch-shadow, no-shadow
        } catch (error) {
            setModalState({
                message: 'Oops, something went wrong!',
                defaultRender: true,
                status: 'error',
                duration: 1,
            });
        }
    };

    const handleApproveCongress = async (event: boolean) => {
        try {
            const result = await updateUser({ isCGWCApproved: event, _id });

            if ('data' in result) {
                setModalState({
                    message: `User ${event ? 'Approved' : 'Unapproved'} for Congress`,
                    defaultRender: true,
                    status: 'success',
                    duration: 1,
                });
            }

            if ('error' in result) {
                setModalState({
                    message: (result?.error as any)?.data?.message ?? 'Oops, something went wrong!',
                    defaultRender: true,
                    status: 'error',
                    duration: 1,
                });
            }
        } catch (error) {
            setModalState({
                message: 'Oops, something went wrong!',
                defaultRender: true,
                status: 'error',
                duration: 1,
            });
        }
    };

    useScreenFocus({
        onFocus: () => {
            setIsEditMode(false);
        },
    });

    const rolesPermitted = React.useMemo(() => rolesPermittedToCreate(), []);

    const handleViewFullReport = () => {
        router.push({ pathname: '/workforce-summary/worker-status-report', params: { _id } });
    };

    return (
        <ViewWrapper
            scroll
            onRefresh={refetch}
            refreshing={isFetching}
            style={{
                paddingHorizontal: 10,
            }}
        >
            <CardComponent isLoading={isLoading} style={{ paddingVertical: 20, marginTop: 20 }}>
                <Formik<IReAssignUserPayload> validateOnChange onSubmit={submitForm} initialValues={INITIAL_VALUES}>
                    {({ values, handleChange, handleSubmit }) => {
                        const handleCampusIdChange = (value: string) => {
                            handleChange('campusId')(value);
                            setCampusId(value);
                        };

                        const disableSave = React.useMemo(
                            () => compareObjectValueByKey(INITIAL_VALUES, values),
                            [values]
                        );

                        return (
                            <View className="ga!py-4 !py-4">
                                <CenterComponent>
                                    <AvatarComponent
                                        alt="profile-pic"
                                        className="w-32 h-32"
                                        imageUrl={data?.pictureUrl || AVATAR_FALLBACK_URL}
                                    />
                                </CenterComponent>
                                <If condition={canEdit}>
                                    <View className="my-6 gap-4 flex-row">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            startIcon={
                                                <Icon
                                                    size={20}
                                                    color="white"
                                                    type="material-icon"
                                                    name={isEditMode ? 'save' : 'loop'}
                                                />
                                            }
                                            className="flex-1"
                                            disabled={isEditMode && disableSave}
                                            isLoading={updateResults.isLoading}
                                            onPress={isEditMode ? (handleSubmit as () => void) : handleEditMode}
                                        >
                                            {isEditMode ? 'Done' : 'Reassign'}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            startIcon={
                                                <Icon size={20} color="white" name={'delete'} type="material-icon" />
                                            }
                                            className="flex-1"
                                            onPress={handleDelete}
                                            disabled={!canDelete}
                                            isLoading={deleteUserResults.isLoading}
                                        >
                                            Delete
                                        </Button>
                                    </View>
                                </If>
                                <View className="py-6">
                                    <WorkerStatusCard
                                        onPress={handleViewFullReport}
                                        status={userCurrentStatusReport?.status as IUserStatus}
                                        loading={statusHistoryIsFetching || statusHistoryIsLoading}
                                    />
                                </View>
                                <If condition={canApproveForCongress}>
                                    <View className="flex-row justify-between">
                                        <Label>{data?.isCGWCApproved ? 'Approved' : 'Approve'} for Congress</Label>

                                        {updateResults?.isLoading ? (
                                            <Loading />
                                        ) : (
                                            <Switch
                                                checked={!!data?.isCGWCApproved}
                                                onCheckedChange={handleApproveCongress}
                                                disabled={updateResults?.isLoading}
                                            />
                                        )}
                                    </View>
                                </If>
                                <View className="gap-1  justify-between border-b-[2px] border-border w-full flex-row items-center !py-4">
                                    <Text className="font-bold items-start">Role</Text>
                                    <Text>{data?.role.name}</Text>
                                </View>
                                <View className="gap-1 justify-between border-b-[2px] border-border w-full flex-row items-center !py-4">
                                    <Text className="font-bold items-start">First name</Text>
                                    <Text>{data?.firstName}</Text>
                                </View>
                                <View className="gap-1 justify-between border-b-[2px] border-border w-full flex-row items-center !py-4">
                                    <Text className="font-bold">Last name</Text>
                                    <Text>{data?.lastName}</Text>
                                </View>
                                <View className="gap-1 justify-between border-b-[2px] border-border w-full flex-row items-center !py-4">
                                    <Text className="font-bold">Phone number</Text>
                                    <Text>{data?.phoneNumber}</Text>
                                </View>
                                <View className="gap-1 justify-between border-b-[2px] border-border w-full flex-row items-center !py-4">
                                    <Text className="font-bold">Email</Text>
                                    <Text>{data?.email}</Text>
                                </View>
                                <View className="gap-4 justify-between border-b-[2px] border-border w-full flex-row !py-4">
                                    <Text className="font-bold">Address</Text>
                                    <Text className="line-clamp-none flex-1 text-right">{data?.address}</Text>
                                </View>

                                <View className="gap-1 justify-between border-b-[2px] border-border w-full flex-row items-center !py-4">
                                    <Text className="font-bold">Gender</Text>
                                    <Text>{data?.gender}</Text>
                                </View>
                                <View className="gap-1 justify-between border-b-[2px] border-border w-full flex-row items-center !py-4">
                                    <Text className="font-bold">Marital Status</Text>
                                    <Text>{data?.maritalStatus}</Text>
                                </View>
                                <View className="gap-1 justify-between border-b-[2px] border-border w-full flex-row items-center !py-4">
                                    <Text className="font-bold">Birthday</Text>
                                    <Text>{dayjs(data?.birthDay).format('DD MMMM')}</Text>
                                </View>
                                <View className="gap-1 justify-between border-b-[2px] border-border w-full flex-row items-center !py-4">
                                    <Text className="font-bold flex-1">Campus</Text>
                                    <If condition={!isEditMode}>
                                        <Text>{data?.campus.campusName}</Text>
                                    </If>

                                    {isEditMode && canEdit ? (
                                        <View className="flex-row-reverse flex-1">
                                            <PickerSelect
                                                valueKey="_id"
                                                className="w-full"
                                                labelKey="campusName"
                                                value={values.campusId}
                                                items={sortedCampuses || []}
                                                isLoading={campusesIsLoading}
                                                placeholder="Choose campus"
                                                onValueChange={handleCampusIdChange}
                                            />
                                        </View>
                                    ) : null}
                                </View>
                                <View className="gap-1  justify-between border-b-[2px] border-border w-full flex-row items-center !py-4">
                                    <Text className="font-bold flex-1">Department</Text>

                                    <If condition={!isEditMode}>
                                        <Text>{data?.department?.departmentName}</Text>
                                    </If>

                                    {isEditMode && canEdit ? (
                                        <View className="flex-row-reverse flex-1">
                                            <PickerSelect
                                                valueKey="_id"
                                                className="w-full"
                                                labelKey="departmentName"
                                                value={values.departmentId}
                                                placeholder="Choose department"
                                                items={sortedCampusDepartments || []}
                                                isLoading={campusDepartmentsLoading || isFetchingDepartments}
                                                onValueChange={handleChange('departmentId') as any}
                                            />
                                        </View>
                                    ) : null}
                                </View>
                                <If condition={isEditMode}>
                                    <View className="gap-1  justify-between border-b-[2px] border-border w-full flex-row items-center !py-4">
                                        <Text className="font-bold flex-1">Role</Text>
                                        <View className="flex-row-reverse flex-1">
                                            <PickerSelect
                                                valueKey="_id"
                                                className="w-full"
                                                labelKey="name"
                                                value={values.roleId}
                                                placeholder="Choose role"
                                                items={rolesPermitted || []}
                                                onValueChange={handleChange('roleId') as any}
                                                isLoading={campusDepartmentsLoading || isFetchingDepartments}
                                            />
                                        </View>
                                    </View>
                                </If>
                                <View className="gap-1  justify-between border-b-[2px] border-border w-full flex-row items-center !py-4">
                                    <Text className="font-bold">Occupation</Text>
                                    <Text className="line-clamp-none flex-1 text-right">{data?.occupation}</Text>
                                </View>
                                <View className="gap-1  justify-between border-b-[2px] border-border w-full flex-row items-center !py-4">
                                    <Text className="font-bold">Place of work</Text>
                                    <Text className="line-clamp-none flex-1 text-right">{data?.placeOfWork}</Text>
                                </View>
                                <View className="gap-1  justify-between border-b-[2px] border-border w-full flex-row !py-4">
                                    <Text className="font-bold">Next of Kin</Text>
                                    <View>
                                        <Text>{data?.nextOfKin}</Text>
                                        <Text>{data?.nextOfKinPhoneNo}</Text>
                                    </View>
                                </View>
                            </View>
                        );
                    }}
                </Formik>
            </CardComponent>
        </ViewWrapper>
    );
};

export default React.memo(UserDetails);

UserDetails.displayName = 'UserDetails';
