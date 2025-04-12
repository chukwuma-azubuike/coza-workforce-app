import { Text } from "~/components/ui/text";
import { ParamListBase, useNavigation } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Icon } from '@rneui/themed';
import { Formik, FormikConfig } from 'formik';
import dayjs from 'dayjs';
import { FormControl } from 'native-base';
import React from 'react';
import { Alert, Switch, View } from 'react-native';
import AvatarComponent from '@components/atoms/avatar';
import ButtonComponent from '@components/atoms/button';
import { SelectComponent, SelectItemComponent } from '@components/atoms/select';
import StatusTag from '@components/atoms/status-tag';
import CardComponent from '@components/composite/card';
import If from '@components/composite/if-container';
import ViewWrapper from '@components/layout/viewWrapper';
import { AVATAR_FALLBACK_URL } from '@constants/index';
import useScreenFocus from '@hooks/focus';
import useModal from '@hooks/modal/useModal';
import useRole from '@hooks/role';
import { useDeleteUserMutation, useGetUserByIdQuery, useUpdateUserMutation } from '@store/services/account';
import { useGetCampusesQuery } from '@store/services/campus';
import { useGetDepartmentsByCampusIdQuery } from '@store/services/department';
import { ICampus, IEditProfilePayload, IReAssignUserPayload, IUser } from '@store/types';
import Utils from '@utils/index';
import compareObjectValueByKey from '@utils/compareObjectValuesByKey';
import Loading from '@components/atoms/loading';
import VStackComponent from '@components/layout/v-stack';
import HStackComponent from '@components/layout/h-stack';
import CenterComponent from '@components/layout/center';
import { THEME_CONFIG } from '@config/appConfig';

const UserDetails: React.FC<NativeStackScreenProps<ParamListBase>> = props => {
    const { _id } = props.route.params as IUser;
    const { setModalState } = useModal();
    const { goBack } = useNavigation();
    const { isHOD, isAHOD, isSuperAdmin, isGlobalPastor, isCampusPastor, isInternshipHOD, rolesPermittedToCreate } =
        useRole();

    const canEdit = isSuperAdmin || isGlobalPastor || isCampusPastor || isInternshipHOD;
    const canDelete = isSuperAdmin || isGlobalPastor || isCampusPastor;
    const canApproveForCGWC = isHOD || isAHOD || isCampusPastor || isGlobalPastor || isSuperAdmin;

    const [isEditMode, setIsEditMode] = React.useState<boolean>(false);
    const handleEditMode = () => {
        setIsEditMode(prev => !prev);
    };

    const { data, isLoading, isFetching, refetch } = useGetUserByIdQuery(_id);
    const [campusId, setCampusId] = React.useState<string>(data?.campus._id as string);

    const { data: campuses, isLoading: campusesIsLoading } = useGetCampusesQuery();
    const {
        data: campusDepartments,
        refetch: refetchDepartments,
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
                    duration: 3,
                });
                goBack();
            }

            if ('error' in result) {
                setModalState({
                    message: `${deleteUserResults?.error?.data.message}` || 'Oops, something went wrong!',
                    defaultRender: true,
                    status: 'error',
                    duration: 6,
                });
            }
        } catch (error) {
            setModalState({
                message: 'Oops, something went wrong!',
                defaultRender: true,
                status: 'error',
                duration: 6,
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

    const submitForm: FormikConfig<IReAssignUserPayload>['onSubmit'] = async (values, { resetForm }) => {
        try {
            const result = await updateUser({ ...values, _id } as unknown as IEditProfilePayload);

            if ('data' in result) {
                setModalState({
                    message: 'User successfully reassigned',
                    defaultRender: true,
                    status: 'success',
                    duration: 3,
                });
                resetForm();
                goBack();
            }

            if ('error' in result) {
                setModalState({
                    message: `${updateResults?.error?.data?.message}` || 'Oops, something went wrong!',
                    defaultRender: true,
                    status: 'error',
                    duration: 6,
                });
            }
            // eslint-disable-next-line no-catch-shadow, no-shadow
        } catch (error) {
            setModalState({
                message: 'Oops, something went wrong!',
                defaultRender: true,
                status: 'error',
                duration: 6,
            });
        }
    };

    const approveForCGWC = async (event: boolean) => {
        try {
            const result = await updateUser({ isCGWCApproved: event, _id });

            if ('data' in result) {
                setModalState({
                    message: `User ${event ? 'Approved' : 'Unapproved'} for CGWC`,
                    defaultRender: true,
                    status: 'success',
                    duration: 3,
                });
            }

            if ('error' in result) {
                setModalState({
                    message: `${updateResults?.error?.data?.message}` || 'Oops, something went wrong!',
                    defaultRender: true,
                    status: 'error',
                    duration: 6,
                });
            }
        } catch (error) {
            setModalState({
                message: 'Oops, something went wrong!',
                defaultRender: true,
                status: 'error',
                duration: 6,
            });
        }
    };

    useScreenFocus({
        onFocus: () => {
            setIsEditMode(false);
        },
    });

    const handleApproveCGWC = async (event: boolean) => {
        await approveForCGWC(event)
            .then(() => {
                refetch();
            })
            .catch(() => {});
    };

    const rolesPermitted = React.useMemo(() => rolesPermittedToCreate(), []);

    return (
        <ViewWrapper
            scroll
            onRefresh={refetch}
            refreshing={isFetching}
            style={{
                paddingHorizontal: 10,
            }}
        >
            <CardComponent isLoading={isLoading || isFetching} style={{ paddingVertical: 20, marginTop: 20 }}>
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
                            <View space={8}>
                                <CenterComponent>
                                    <AvatarComponent size="2xl" imageUrl={data?.pictureUrl || AVATAR_FALLBACK_URL} />
                                </CenterComponent>
                                <If condition={canEdit}>
                                    <View className="my-6 justify-between">
                                        <ButtonComponent
                                            style={{ paddingHorizontal: 6, backgroundColor: THEME_CONFIG.info }}
                                            size="md"
                                            startIcon={
                                                <Icon
                                                    size={18}
                                                    color="white"
                                                    type="material-icon"
                                                    name={isEditMode ? 'save' : 'loop'}
                                                />
                                            }
                                            isDisabled={isEditMode && disableSave}
                                            isLoading={updateResults.isLoading}
                                            onPress={isEditMode ? (handleSubmit as () => void) : handleEditMode}
                                        >
                                            {isEditMode ? 'Done' : 'Reassign'}
                                        </ButtonComponent>
                                        <ButtonComponent
                                            style={{ paddingHorizontal: 6, backgroundColor: THEME_CONFIG.rose }}
                                            size="md"
                                            startIcon={
                                                <Icon size={18} color="white" name={'delete'} type="material-icon" />
                                            }
                                            onPress={handleDelete}
                                            isDisabled={!canDelete}
                                            isLoading={deleteUserResults.isLoading}
                                        >
                                            Delete
                                        </ButtonComponent>
                                    </View>
                                </If>
                                <If condition={canApproveForCGWC}>
                                    <View className="mx-2">
                                        <FormControl flexDirection="row" justifyContent="space-between">
                                            <FormControl.Label>
                                                {data?.isCGWCApproved ? 'Approved' : 'Approve'} for CGWC
                                            </FormControl.Label>

                                            {updateResults?.isLoading ? (
                                                <Loading w={7} h={7} />
                                            ) : (
                                                <Switch
                                                    value={data?.isCGWCApproved}
                                                    onValueChange={handleApproveCGWC}
                                                    disabled={updateResults?.isLoading}
                                                />
                                            )}
                                        </FormControl>
                                    </View>
                                </If>
                                <View
                                    space={2}
                                    pb={2}
                                    w="full"
                                    justifyContent="space-between"
                                    borderBottomWidth={0.2}
                                    borderColor="gray.300"
                                >
                                    <Text alignSelf="flex-start" className="font-bold">
                                        Role
                                    </Text>
                                    <Text>{data?.role.name}</Text>
                                </View>
                                <View
                                    space={2}
                                    pb={2}
                                    w="full"
                                    justifyContent="space-between"
                                    borderBottomWidth={0.2}
                                    borderColor="gray.300"
                                >
                                    <Text alignSelf="flex-start" className="font-bold">
                                        First name
                                    </Text>
                                    <Text>{data?.firstName}</Text>
                                </View>
                                <View
                                    space={2}
                                    pb={2}
                                    w="full"
                                    justifyContent="space-between"
                                    borderBottomWidth={0.2}
                                    borderColor="gray.300"
                                >
                                    <Text alignSelf="flex-start" className="font-bold">
                                        Last name
                                    </Text>
                                    <Text>{data?.lastName}</Text>
                                </View>
                                <View
                                    space={2}
                                    pb={2}
                                    w="full"
                                    justifyContent="space-between"
                                    borderBottomWidth={0.2}
                                    borderColor="gray.300"
                                >
                                    <Text alignSelf="flex-start" className="font-bold">
                                        Phone number
                                    </Text>
                                    <Text>{data?.phoneNumber}</Text>
                                </View>
                                <View
                                    space={2}
                                    pb={2}
                                    w="full"
                                    flexWrap="wrap"
                                    justifyContent="space-between"
                                    borderBottomWidth={0.2}
                                    borderColor="gray.300"
                                >
                                    <Text alignSelf="flex-start" className="font-bold">
                                        Email
                                    </Text>
                                    <Text>{data?.email}</Text>
                                </View>
                                <View
                                    space={2}
                                    pb={2}
                                    w="full"
                                    flexWrap="wrap"
                                    justifyContent="space-between"
                                    borderBottomWidth={0.2}
                                    borderColor="gray.300"
                                >
                                    <Text alignSelf="flex-start" className="font-bold">
                                        Address
                                    </Text>
                                    <Text>{data?.address}</Text>
                                </View>
                                <View
                                    space={2}
                                    pb={2}
                                    w="full"
                                    justifyContent="space-between"
                                    borderBottomWidth={0.2}
                                    borderColor="gray.300"
                                >
                                    <Text alignSelf="flex-start" className="font-bold">
                                        Status
                                    </Text>
                                    <StatusTag>{data?.status}</StatusTag>
                                </View>
                                <View
                                    space={2}
                                    pb={2}
                                    w="full"
                                    justifyContent="space-between"
                                    borderBottomWidth={0.2}
                                    borderColor="gray.300"
                                >
                                    <Text alignSelf="flex-start" className="font-bold">
                                        Gender
                                    </Text>
                                    <Text>{data?.gender}</Text>
                                </View>
                                <View
                                    space={2}
                                    pb={2}
                                    w="full"
                                    justifyContent="space-between"
                                    borderBottomWidth={0.2}
                                    borderColor="gray.300"
                                >
                                    <Text alignSelf="flex-start" className="font-bold">
                                        Marital Status
                                    </Text>
                                    <Text>{data?.maritalStatus}</Text>
                                </View>
                                <View
                                    space={2}
                                    pb={2}
                                    w="full"
                                    justifyContent="space-between"
                                    borderBottomWidth={0.2}
                                    borderColor="gray.300"
                                >
                                    <Text alignSelf="flex-start" className="font-bold">
                                        Birthday
                                    </Text>
                                    <Text>{dayjs(data?.birthDay).format('Do MMMM')}</Text>
                                </View>
                                <View
                                    pb={2}
                                    w="full"
                                    space={2}
                                    alignItems="center"
                                    borderColor="gray.300"
                                    borderBottomWidth={0.2}
                                    justifyContent="space-between"
                                >
                                    <Text alignSelf="flex-start" className="font-bold">
                                        Campus
                                    </Text>
                                    <If condition={!isEditMode}>
                                        <Text>{data?.campus.campusName}</Text>
                                    </If>

                                    {isEditMode && canEdit ? (
                                        <FormControl mb={3} h={12} maxW={200} flexDirection="row-reverse">
                                            <SelectComponent
                                                valueKey="_id"
                                                items={sortedCampuses}
                                                displayKey="campusName"
                                                style={{ width: 200 }}
                                                placeholder="Choose campus"
                                                selectedValue={values.campusId}
                                                onValueChange={handleCampusIdChange as any}
                                                isDisabled={isInternshipHOD || isCampusPastor}
                                            >
                                                {sortedCampuses?.map((campus, index) => (
                                                    <SelectItemComponent
                                                        value={campus._id}
                                                        key={`campus-${index}`}
                                                        label={campus.campusName}
                                                        isLoading={campusesIsLoading}
                                                    />
                                                ))}
                                            </SelectComponent>
                                        </FormControl>
                                    ) : null}
                                </View>
                                <View
                                    pb={2}
                                    w="full"
                                    space={2}
                                    flexWrap="wrap"
                                    borderColor="gray.300"
                                    borderBottomWidth={0.2}
                                    justifyContent="space-between"
                                >
                                    <Text alignSelf="flex-start" className="font-bold">
                                        Department
                                    </Text>

                                    <If condition={!isEditMode}>
                                        <Text>{data?.department?.departmentName}</Text>
                                    </If>

                                    {isEditMode && canEdit ? (
                                        <FormControl mb={3} h={12} maxW={200} flex={1} flexDirection="row-reverse">
                                            <SelectComponent
                                                valueKey="_id"
                                                style={{ width: 200 }}
                                                displayKey="departmentName"
                                                placeholder="Choose department"
                                                items={sortedCampusDepartments || []}
                                                selectedValue={values.departmentId}
                                                onValueChange={handleChange('departmentId') as any}
                                                isLoading={campusDepartmentsLoading || isFetchingDepartments}
                                                isDisabled={campusDepartmentsLoading || isFetchingDepartments}
                                            >
                                                {sortedCampusDepartments?.map((department, index) => (
                                                    <SelectItemComponent
                                                        value={department._id}
                                                        key={`department-${index}`}
                                                        label={department.departmentName}
                                                        isLoading={campusDepartmentsLoading || isFetchingDepartments}
                                                    />
                                                ))}
                                            </SelectComponent>
                                        </FormControl>
                                    ) : null}
                                </View>
                                <If condition={isEditMode}>
                                    <View
                                        pb={2}
                                        w="full"
                                        space={2}
                                        flexWrap="wrap"
                                        borderColor="gray.300"
                                        borderBottomWidth={0.2}
                                        justifyContent="space-between"
                                    >
                                        <Text alignSelf="flex-start" className="font-bold">
                                            Role
                                        </Text>
                                        <FormControl mb={3} h={12} maxW={200} flexDirection="row-reverse">
                                            <SelectComponent
                                                valueKey="_id"
                                                displayKey="name"
                                                placeholder="Choose role"
                                                style={{ width: 200 }}
                                                items={rolesPermitted || []}
                                                selectedValue={values.roleId}
                                                onValueChange={handleChange('roleId') as any}
                                            >
                                                {rolesPermitted?.map((role, index) => (
                                                    <SelectItemComponent
                                                        value={role._id}
                                                        label={role.name}
                                                        key={`role-${index}`}
                                                    />
                                                ))}
                                            </SelectComponent>
                                        </FormControl>
                                    </View>
                                </If>
                                <View
                                    space={2}
                                    pb={2}
                                    w="full"
                                    flexWrap="wrap"
                                    justifyContent="space-between"
                                    borderBottomWidth={0.2}
                                    borderColor="gray.300"
                                >
                                    <Text flexWrap="wrap" alignSelf="flex-start" className="font-bold">
                                        Occupation
                                    </Text>
                                    <Text>{data?.occupation}</Text>
                                </View>
                                <View
                                    space={2}
                                    pb={2}
                                    w="full"
                                    flexWrap="wrap"
                                    justifyContent="space-between"
                                    borderBottomWidth={0.2}
                                    borderColor="gray.300"
                                >
                                    <Text alignSelf="flex-start" className="font-bold">
                                        Place of work
                                    </Text>
                                    <Text>{data?.placeOfWork}</Text>
                                </View>
                                <View
                                    space={2}
                                    pb={2}
                                    w="full"
                                    justifyContent="space-between"
                                    borderBottomWidth={0.2}
                                    borderColor="gray.300"
                                >
                                    <Text alignSelf="flex-start" className="font-bold">
                                        Next of Kin
                                    </Text>
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
